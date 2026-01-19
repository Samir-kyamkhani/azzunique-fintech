import crypto from 'node:crypto';
import { rechargeDb as db } from '../../database/recharge/recharge-db.js';
import { eq } from 'drizzle-orm';

import { rechargeTransactionTable } from '../../models/recharge/index.js';

import { ApiError } from '../../lib/ApiError.js';
import RechargeRuntimeService from './rechargeRuntime.service.js';
import { getRechargePlugin } from '../../plugin_registry/pluginRegistry.js';

import WalletService from '../wallet.service.js';
import CommissionEngine from '../../lib/commission.engine.js';
import MultiLevelCommission from '../../lib/multilevel-commission.engine.js';

import OperatorMapService from '../recharge-admin/operatorMap.service.js';
import CircleMapService from '../recharge-admin/circleMap.service.js';

class RechargeTransactionService {
  // MAIN ENTRY
  static async initiateRecharge({ payload, actor }) {
    const { mobileNumber, operatorCode, circleCode, amount } = payload;

    // 1️⃣ Build tenant hierarchy (BOTTOM → TOP)
    const tenantChain = [
      actor.tenantId,
      actor.whiteLabelTenantId,
      actor.resellerTenantId,
      actor.azzuniqueTenantId,
    ].filter(Boolean);

    // 2️⃣ Resolve service + provider
    const { service, provider } = await RechargeRuntimeService.resolve({
      tenantChain,
      platformServiceCode: 'RECHARGE',
    });

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
    await WalletService.debitWallet({
      walletId: mainWallet.id,
      amount,
      transactionId,
    });

    // 6️⃣ Insert INITIATED transaction
    await db.insert(rechargeTransactionTable).values({
      id: transactionId,
      tenantId: actor.tenantId,
      userId: actor.id,
      walletId: mainWallet.id,

      mobileNumber,
      operatorCode,
      circleCode,

      amount,
      platformServiceId: service.id,
      platformServiceFeatureId: null, // recharge has single feature
      providerCode: provider.serviceProviderId,

      status: 'INITIATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 7️⃣ Call provider
    const plugin = getRechargePlugin(
      provider.serviceProviderId,
      provider.config,
    );

    let providerResponse;

    try {
      const providerOperatorCode = await OperatorMapService.resolve({
        internalOperatorCode: operatorCode,
        platformServiceId: service.id,
        providerCode: provider.serviceProviderId,
      });

      const providerCircleCode = circleCode
        ? await CircleMapService.resolve({
            internalCircleCode: circleCode,
            providerCode: provider.serviceProviderId,
          })
        : null;

      providerResponse = await plugin.recharge({
        opcode: providerOperatorCode,
        number: mobileNumber,
        amount,
        transid: transactionId,
        circle: providerCircleCode, // safe if null
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

  // PROVIDER RESPONSE HANDLER
  static async _handleProviderResponse({
    transactionId,
    providerResponse,
    walletId,
    actor,
    service,
    amount,
  }) {
    const status = providerResponse.status;

    // SUCCESS
    if (status === 'SUCCESS') {
      await db
        .update(rechargeTransactionTable)
        .set({
          status: 'SUCCESS',
          providerTxnId: providerResponse.optransid,
          referenceId: providerResponse.referenceid,
          updatedAt: new Date(),
        })
        .where(eq(rechargeTransactionTable.id, transactionId));

      // 🔥 COMMISSION
      await CommissionEngine.calculateAndCredit({
        transaction: {
          id: transactionId,
          tenantId: actor.tenantId,
          platformServiceId: service.id,
          platformServiceFeatureId: null,
          amount,
        },
        user: actor,
      });

      await MultiLevelCommission.process({
        transaction: {
          id: transactionId,
          tenantId: actor.tenantId,
          platformServiceId: service.id,
          platformServiceFeatureId: null,
          amount,
        },
        user: actor,
      });

      return { status: 'SUCCESS', transactionId };
    }

    // FAIL
    if (status === 'FAIL') {
      await this._failAndRefund({
        transactionId,
        walletId,
        amount,
        reason: providerResponse.message,
      });

      return { status: 'FAILED', transactionId };
    }

    // PENDING
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
      await WalletService.creditWallet({
        walletId,
        amount,
        transactionId,
      });
    });
  }
}

export default RechargeTransactionService;
