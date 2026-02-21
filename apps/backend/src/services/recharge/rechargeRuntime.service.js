import { db } from '../../database/core/core-db.js';
import { rechargeDb } from '../../database/recharge/recharge-db.js';
import { eq, and } from 'drizzle-orm';

import {
  platformServiceFeatureTable,
  platformServiceProviderTable,
  platformServiceTable,
  serviceProviderFeatureTable,
  serviceProviderTable,
} from '../../models/core/index.js';

import { rechargeTransactionTable } from '../../models/recharge/index.js';

import { ApiError } from '../../lib/ApiError.js';
import { getRechargePlugin } from '../../plugin_registry/recharge/pluginRegistry.js';
import OperatorMapService from '../recharge-admin/operatorMap.service.js';
import tenantServiceEffective from '../../lib/tenantService.effective.js';

class RechargeRuntimeService {
  /* RESOLVE SERVICE + PROVIDER (INITIATE FLOW)           */
  static async resolve({ tenantChain, platformServiceCode, featureCode }) {
    const currentTenantId = tenantChain?.[0];

    if (!currentTenantId) {
      throw ApiError.internal('Invalid tenant chain');
    }

    // 1️⃣ Fetch platform service
    const [service] = await db
      .select({
        id: platformServiceTable.id,
        code: platformServiceTable.code,
        name: platformServiceTable.name,
      })
      .from(platformServiceTable)
      .where(eq(platformServiceTable.code, platformServiceCode))
      .limit(1);

    if (!service) {
      throw ApiError.notFound('Recharge service not configured');
    }

    // 2️⃣ Effective hierarchy enable check
    const isEnabled = await tenantServiceEffective.isServiceEffectivelyEnabled(
      currentTenantId,
      service.id,
    );

    if (!isEnabled) {
      throw ApiError.forbidden('Recharge service disabled');
    }

    // 3️⃣ Resolve provider by FEATURE
    const [row] = await db
      .select({
        providerId: serviceProviderTable.id,
        providerCode: serviceProviderTable.code,
        config: platformServiceProviderTable.config,
      })
      .from(platformServiceProviderTable)

      .innerJoin(
        platformServiceTable,
        eq(
          platformServiceTable.id,
          platformServiceProviderTable.platformServiceId,
        ),
      )

      .innerJoin(
        serviceProviderTable,
        eq(
          serviceProviderTable.id,
          platformServiceProviderTable.serviceProviderId,
        ),
      )

      .innerJoin(
        serviceProviderFeatureTable,
        eq(
          serviceProviderFeatureTable.serviceProviderId,
          serviceProviderTable.id,
        ),
      )

      .innerJoin(
        platformServiceFeatureTable,
        eq(
          platformServiceFeatureTable.id,
          serviceProviderFeatureTable.platformServiceFeatureId,
        ),
      )
      .where(
        and(
          eq(platformServiceProviderTable.platformServiceId, service.id),

          // FEATURE MATCH
          eq(platformServiceFeatureTable.code, featureCode),

          // SERVICE ACTIVE
          eq(platformServiceTable.isActive, true),

          // PROVIDER ACTIVE
          eq(serviceProviderTable.isActive, true),

          // FEATURE ACTIVE
          eq(platformServiceFeatureTable.isActive, true),

          // SERVICE ↔ PROVIDER ACTIVE
          eq(platformServiceProviderTable.isActive, true),
        ),
      )
      .limit(1);

    if (!row) {
      throw ApiError.internal(
        `No active provider configured for feature ${featureCode}`,
      );
    }

    return {
      service,
      provider: {
        providerId: row.providerId,
        code: row.providerCode,
        config: row.config,
      },
    };
  }

  /* EXECUTE RECHARGE (RETRY / CRON FLOW)                 */
  static async execute({ transactionId, isRetry = false }) {
    // 1️⃣ LOCK + VALIDATE (SHORT TRANSACTION)
    const txn = await rechargeDb.transaction(async (tx) => {
      const [lockedTxn] = await tx
        .select()
        .from(rechargeTransactionTable)
        .where(eq(rechargeTransactionTable.id, transactionId))
        .forUpdate()
        .limit(1);

      if (!lockedTxn) {
        throw ApiError.notFound('Recharge transaction not found');
      }

      if (lockedTxn.status !== 'PENDING') {
        throw ApiError.badRequest('Transaction not retryable');
      }

      if (lockedTxn.retryCount >= 3) {
        throw ApiError.badRequest('Retry limit exceeded');
      }

      if (!lockedTxn.providerCode || !lockedTxn.providerConfig) {
        throw ApiError.internal('Frozen provider data missing');
      }

      // 🔥 Effective service check (retry safe)
      const isEnabled =
        await tenantServiceEffective.isServiceEffectivelyEnabled(
          lockedTxn.tenantId,
          lockedTxn.platformServiceId,
        );

      if (!isEnabled) {
        throw ApiError.forbidden('Recharge service disabled for this tenant');
      }

      return lockedTxn;
    });

    // 2️⃣ OUTSIDE TRANSACTION → CALL PROVIDER
    const plugin = getRechargePlugin(txn.providerCode, txn.providerConfig);

    const providerOperatorCode = await OperatorMapService.resolve({
      internalOperatorCode: txn.operatorCode,
      platformServiceId: txn.platformServiceId,
      serviceProviderId: txn.providerId,
    });

    await plugin.recharge({
      opcode: providerOperatorCode,
      number: txn.mobileNumber,
      amount: txn.amount,
      transid: txn.id,
      isRetry,
    });

    // 3️⃣ UPDATE RETRY METADATA (SHORT TX AGAIN)
    await rechargeDb
      .update(rechargeTransactionTable)
      .set({
        retryCount: txn.retryCount + 1,
        lastRetryAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(rechargeTransactionTable.id, txn.id));

    return {
      success: true,
      transactionId: txn.id,
      retryCount: txn.retryCount + 1,
    };
  }
}

export default RechargeRuntimeService;
