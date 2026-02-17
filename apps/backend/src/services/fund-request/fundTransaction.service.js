import crypto from 'node:crypto';
import { db } from '../../database/core/core-db.js';
import { eq, and } from 'drizzle-orm';

import { fundTransactionTable } from '../../models/fund-request/index.js';
import { ApiError } from '../../lib/ApiError.js';

import { buildTenantChain } from '../../lib/tenantHierarchy.util.js';
import { FUNDREQUEST_SERVICE_CODE } from '../../config/constant.js';

import { platformServiceResolve } from '../../lib/platformServiceResolver.util.js';
import { getFundRequestPlugin } from '../../plugin_registry/fund-request/pluginRegistry.js';

import WalletService from '../wallet.service.js';
import { tenantsTable } from '../../models/core/index.js';

class FundTransactionService {
  // MAIN ENTRY
  static async initiateFundRequest({ payload, actor }) {
    const { amount, idempotencyKey, paymentMode } = payload;

    if (!paymentMode) {
      throw ApiError.badRequest('Payment mode is required');
    }

    const tenantChain = await buildTenantChain(actor.tenantId);

    const { service, provider } = await platformServiceResolve({
      tenantChain,
      platformServiceCode: FUNDREQUEST_SERVICE_CODE,
    });

    // 🔐 Idempotency check
    const existing = await db
      .select()
      .from(fundTransactionTable)
      .where(
        and(
          eq(fundTransactionTable.tenantId, actor.tenantId),
          eq(fundTransactionTable.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1);

    if (existing.length) {
      return {
        transactionId: existing[0].id,
        status: existing[0].status,
        duplicate: true,
      };
    }

    const transactionId = crypto.randomUUID();

    const [mainWallet] = await WalletService.getUserWallets(
      actor.id,
      actor.tenantId,
    ).then((w) => w.filter((x) => x.walletType === 'MAIN'));

    if (!mainWallet) {
      throw ApiError.notFound('Main wallet not found');
    }

    // 🔌 Resolve plugin
    const plugin = getFundRequestPlugin(provider.code, provider.config);

    // 🧠 Create provider transaction
    const providerResponse = await plugin.createTransaction({
      amount,
      transid: transactionId,
      paymentMode,
    });

    await db.insert(fundTransactionTable).values({
      id: transactionId,
      idempotencyKey,
      tenantId: actor.tenantId,
      userId: actor.id,
      walletId: mainWallet.id,
      amount,
      paymentMode,

      platformServiceId: service.id,
      platformServiceFeatureId: null,

      providerCode: provider.code,
      providerId: provider.providerId,
      providerConfig: provider.config,

      providerTxnId: providerResponse.providerTxnId,
      status: providerResponse.status,

      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      transactionId,
      status: providerResponse.status,
      paymentInstructions: providerResponse.instructions,
    };
  }

  // PROVIDER RESPONSE HANDLER
  static async _handleProviderResponse({ transactionId, providerResponse }) {
    const status = String(providerResponse.status).toUpperCase();

    // Manual fund → always pending
    await db
      .update(fundTransactionTable)
      .set({
        status: 'PENDING',
        providerTxnId: providerResponse.providerTxnId,
        updatedAt: new Date(),
      })
      .where(eq(fundTransactionTable.id, transactionId));

    return {
      status: 'PENDING',
      transactionId,
      instructions: providerResponse.instructions || null,
    };
  }

  // ADMIN APPROVE / REJECT
  static async changeStatus({ transactionId, status, actor }) {
    if (!actor.isTenantOwner && actor.roleLevel !== 0) {
      throw ApiError.forbidden('Not allowed');
    }

    await db.transaction(async (tx) => {
      const [txn] = await tx
        .select()
        .from(fundTransactionTable)
        .where(eq(fundTransactionTable.id, transactionId))
        .forUpdate()
        .limit(1);

      if (!txn || txn.status !== 'PENDING') {
        throw ApiError.badRequest('Invalid transaction');
      }

      if (status === 'SUCCESS') {
        // 🔥 PAYER = approver
        if (actor.roleLevel !== 0) {
          const [payerWallet] = await WalletService.getUserWallets(
            actor.id,
            actor.tenantId,
          ).then((w) => w.filter((x) => x.walletType === 'MAIN'));

          if (!payerWallet) {
            throw ApiError.notFound('Approver wallet not found');
          }

          if (payerWallet.balance < txn.amount) {
            throw ApiError.badRequest('Insufficient balance to approve');
          }

          await WalletService.debitWallet({
            walletId: payerWallet.id,
            amount: txn.amount,
            reference: `FUND_APPROVE_DEBIT:${txn.id}`,
          });
        }

        // CREDIT requester
        await WalletService.creditWallet({
          walletId: txn.walletId,
          amount: txn.amount,
          reference: `FUND_APPROVE_CREDIT:${txn.id}`,
        });
      }

      await tx
        .update(fundTransactionTable)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(fundTransactionTable.id, transactionId));
    });

    return { success: true };
  }

  // REFUND
  static async refund({ transactionId, actor }) {
    if (!actor.isTenantOwner && actor.roleLevel !== 0) {
      throw ApiError.forbidden('Not allowed');
    }

    await db.transaction(async (tx) => {
      const [txn] = await tx
        .select()
        .from(fundTransactionTable)
        .where(eq(fundTransactionTable.id, transactionId))
        .forUpdate()
        .limit(1);

      if (!txn || txn.status !== 'SUCCESS') {
        throw ApiError.badRequest('Not refundable');
      }

      await WalletService.debitWallet({
        walletId: txn.walletId,
        amount: txn.amount,
        reference: `FUND_REFUND:${txn.id}`,
      });

      await tx
        .update(fundTransactionTable)
        .set({
          status: 'REFUNDED',
          updatedAt: new Date(),
        })
        .where(eq(fundTransactionTable.id, transactionId));
    });

    return { success: true };
  }

  // get all by tenant id

  // FAIL HELPER
  static async _fail({ transactionId, reason }) {
    await db
      .update(fundTransactionTable)
      .set({
        status: 'FAILED',
        failureReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(fundTransactionTable.id, transactionId));
  }

  // get all txn
  static async getAll(actor) {
    //  Get direct child tenants only
    const children = await db
      .select({ id: tenantsTable.id })
      .from(tenantsTable)
      .where(eq(tenantsTable.parentId, actor.tenantId));

    if (!children.length) {
      return [];
    }

    const childTenantIds = children.map((c) => c.id);

    //  Fetch transactions where tenantId belongs to direct children
    const transactions = await db
      .select()
      .from(fundTransactionTable)
      .where(inArray(fundTransactionTable.tenantId, childTenantIds));

    return transactions;
  }
}

export default FundTransactionService;
