import crypto from 'node:crypto';
import { rechargeDb as db } from '../../database/recharge/recharge-db.js';
import { desc, and, eq, sql } from 'drizzle-orm';

import { rechargeTransactionTable } from '../../models/recharge/index.js';

import { ApiError } from '../../lib/ApiError.js';
import RechargeRuntimeService from './rechargeRuntime.service.js';
import { getRechargePlugin } from '../../plugin_registry/recharge/pluginRegistry.js';

import WalletService from '../wallet.service.js';

import OperatorMapService from '../recharge-admin/operatorMap.service.js';
import {
  RECHARGE_FEATURES,
  RECHARGE_SERVICE_CODE,
} from '../../config/constant.js';
import { buildTenantChain } from '../../lib/tenantHierarchy.util.js';

class RechargeTransactionService {
  // MAIN ENTRY
  static async initiateRecharge({ payload, actor }) {
    const { mobileNumber, operatorCode, amount } = payload;

    const tenantChain = await buildTenantChain(actor.tenantId);

    // 2️⃣ Resolve service + provider
    const { service, feature, provider } = await RechargeRuntimeService.resolve(
      {
        tenantChain,
        platformServiceCode: RECHARGE_SERVICE_CODE,
        featureCode: RECHARGE_FEATURES.INITIATE_RECHARGE,
      },
    );

    // ✅ IDEMPOTENCY CHECK (CRITICAL)
    const existing = await db
      .select()
      .from(rechargeTransactionTable)
      .where(
        and(
          eq(rechargeTransactionTable.tenantId, actor.tenantId),
          eq(rechargeTransactionTable.idempotencyKey, payload.idempotencyKey),
        ),
      )
      .limit(1);

    if (existing.length) {
      return {
        status: existing[0].status,
        transactionId: existing[0].id,
        duplicate: true,
      };
    }

    // 3️⃣ Generate transactionId
    const transactionId = crypto.randomUUID();

    // 4️⃣ Fetch MAIN wallet
    const [mainWallet] = await WalletService.getUserWallets(
      actor.id,
      actor.tenantId,
    ).then((w) => w.filter((x) => x.walletType === 'MAIN'));

    if (!mainWallet) {
      throw ApiError.notFound('Main wallet not found');
    }

    // 5️⃣ Debit wallet (BLOCKED FLOW)
    await WalletService.blockAmount({
      walletId: mainWallet.id,
      amount,
      transactionId,
      reference: `RECHARGE:${transactionId}:${actor.id}`,
    });

    // 6️⃣ Insert INITIATED transaction
    await db.insert(rechargeTransactionTable).values({
      id: transactionId,
      idempotencyKey: payload.idempotencyKey,
      tenantId: actor.tenantId,
      userId: actor.id,
      walletId: mainWallet.id,

      mobileNumber,
      operatorCode,

      amount,
      blockedAmount: amount,

      platformServiceId: service.id,
      platformServiceFeatureId: feature.id,

      providerCode: provider.code,
      providerId: provider.providerId,
      providerConfig: provider.config,

      status: 'PENDING',
      providerResponse: {},

      providerTxnId: null,
      referenceId: null,
      failureReason: null,
      retryCount: 0,
      lastRetryAt: null,

      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 7️⃣ Call provider
    const plugin = getRechargePlugin(provider.code, provider.config);

    let providerResponse;

    try {
      const providerOperatorCode = await OperatorMapService.resolve({
        internalOperatorCode: operatorCode,
        platformServiceId: service.id,
        platformServiceFeatureId: feature.id,
        serviceProviderId: provider.providerId,
      });

      // ✅ PROVIDER BALANCE CHECK (MANDATORY)
      if (typeof plugin.fetchBalance === 'function') {
        const providerBalance = await plugin.fetchBalance();

        if (providerBalance.balance < amount) {
          // unblock user money BEFORE failing
          await WalletService.releaseBlockedAmount({
            walletId: mainWallet.id,
            amount,
            transactionId,
            reference: `RECHARGE_FAILURE:${transactionId}`,
          });

          throw ApiError.badRequest('Provider balance insufficient');
        }
      }

      // 🔥 ACTUAL RECHARGE CALL
      providerResponse = await plugin.recharge({
        opcode: providerOperatorCode,
        number: mobileNumber,
        amount,
        transid: transactionId,
      });
    } catch (err) {
      await this._failAndRefund({
        transactionId,
        walletId: mainWallet.id,
        amount,
        reason: err.message,
      });

      throw err;
    }

    // 8️⃣ Handle response
    return this._handleProviderResponse({
      transactionId,
      providerResponse,
      walletId: mainWallet.id,
      actor,
      service,
      amount,
    });
  }

  static async fetchHistory({ actor, query }) {
    const { page, limit, status } = query;

    const offset = (page - 1) * limit;

    const conditions = [
      eq(rechargeTransactionTable.tenantId, actor.tenantId),
      eq(rechargeTransactionTable.userId, actor.id),
    ];

    if (status) {
      conditions.push(eq(rechargeTransactionTable.status, status));
    }

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(rechargeTransactionTable)
        .where(and(...conditions))
        .orderBy(desc(rechargeTransactionTable.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql`count(*)` })
        .from(rechargeTransactionTable)
        .where(and(...conditions)),
    ]);

    return {
      page,
      limit,
      total: Number(totalResult[0]?.count ?? 0),
      data,
    };
  }

  // PROVIDER RESPONSE HANDLER
  static async _handleProviderResponse({
    transactionId,
    providerResponse,
    walletId,
    amount,
  }) {
    const status = String(providerResponse.status).toUpperCase();

    /**
     * RULE:
     * - Immediate SUCCESS is NOT FINAL
     * - Wallet + commission ONLY via callback / cron
     */

    // ✅ SUCCESS → WAIT FOR CALLBACK
    if (status === 'SUCCESS') {
      await db
        .update(rechargeTransactionTable)
        .set({
          status: 'PENDING', // 👈 IMPORTANT
          providerTxnId: providerResponse.optransid,
          referenceId: providerResponse.referenceid,
          providerResponse: providerResponse,
          updatedAt: new Date(),
        })
        .where(eq(rechargeTransactionTable.id, transactionId));

      return { status: 'PENDING', transactionId };
    }

    //  FAIL → FINAL (refund immediately)
    if (status === 'FAIL') {
      await this._failAndRefund({
        transactionId,
        walletId,
        amount,
        reason: providerResponse.message,
      });

      return { status: 'FAILED', transactionId };
    }

    //  PENDING / UNKNOWN → KEEP WAITING
    await db
      .update(rechargeTransactionTable)
      .set({
        status: 'PENDING',
        providerTxnId: providerResponse.optransid,
        referenceId: providerResponse.referenceid,
        updatedAt: new Date(),
      })
      .where(eq(rechargeTransactionTable.id, transactionId));

    return { status: 'PENDING', transactionId };
  }

  // FAIL + REFUND (ATOMIC)
  static async _failAndRefund({ transactionId, walletId, amount, reason }) {
    await db.transaction(async () => {
      // Update transaction
      await db
        .update(rechargeTransactionTable)
        .set({
          status: 'FAILED',
          failureReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(rechargeTransactionTable.id, transactionId));

      // Refund wallet
      await WalletService.releaseBlockedAmount({
        walletId,
        amount,
        transactionId,
        reference: `RECHARGE_FAILURE:${transactionId}`,
      });
    });
  }
}

export default RechargeTransactionService;
