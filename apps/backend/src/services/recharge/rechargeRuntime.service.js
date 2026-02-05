import { db } from '../../database/core/core-db.js';
import { rechargeDb } from '../../database/recharge/recharge-db.js';
import { eq, and } from 'drizzle-orm';

import {
  tenantServiceTable,
  platformServiceProviderTable,
  platformServiceTable,
  serviceProviderTable,
} from '../../models/core/index.js';

import { rechargeTransactionTable } from '../../models/recharge/index.js';

import { ApiError } from '../../lib/ApiError.js';
import { getRechargePlugin } from '../../plugin_registry/pluginRegistry.js';
import OperatorMapService from '../recharge-admin/operatorMap.service.js';
import CircleMapService from '../recharge-admin/circleMap.service.js';

/**
 * RechargeRuntimeService
 *
 * Responsibilities:
 * 1. Resolve service + provider (INITIATE FLOW)
 * 2. Execute recharge again (RETRY / CRON FLOW)
 *
 * ❗ Wallet handling is NOT done here
 * ❗ Finalization always happens via CALLBACK or STATUS CRON
 */
class RechargeRuntimeService {
  static async resolve({ tenantChain, platformServiceCode }) {
    // 1️⃣ Platform service
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

    // 2️⃣ Hierarchy enable check (BOTTOM → TOP)
    for (const tenantId of tenantChain) {
      const [enabled] = await db
        .select()
        .from(tenantServiceTable)
        .where(
          and(
            eq(tenantServiceTable.tenantId, tenantId),
            eq(tenantServiceTable.platformServiceId, service.id),
            eq(tenantServiceTable.isEnabled, true),
          ),
        )
        .limit(1);

      if (!enabled) {
        throw ApiError.forbidden(
          'Recharge service disabled for this hierarchy',
        );
      }
    }

    // 3️⃣ Provider resolve (TOP MOST ACTIVE)
    const [row] = await db
      .select({
        providerId: platformServiceProviderTable.id,
        providerCode: serviceProviderTable.code,
        config: platformServiceProviderTable.config,
      })
      .from(platformServiceProviderTable)
      .innerJoin(
        serviceProviderTable,
        eq(
          serviceProviderTable.id,
          platformServiceProviderTable.serviceProviderId,
        ),
      )
      .where(
        and(
          eq(platformServiceProviderTable.platformServiceId, service.id),
          eq(platformServiceProviderTable.isActive, true),
        ),
      )
      .limit(1);

    if (!row) {
      throw ApiError.internal('Recharge provider not configured');
    }

    return {
      service,
      provider: {
        providerId: row.providerId,
        code: row.providerCode, // ✅ IMPORTANT
        config: row.config, // 🔐 snapshot this
      },
    };
  }

  static async execute({ transactionId, isRetry = false }) {
    return rechargeDb.transaction(async (tx) => {
      // 1️⃣ Lock transaction (RACE SAFE)
      const [txn] = await tx
        .select()
        .from(rechargeTransactionTable)
        .where(eq(rechargeTransactionTable.id, transactionId))
        .forUpdate()
        .limit(1);

      if (!txn) {
        throw ApiError.notFound('Recharge transaction not found');
      }

      // Retry only PENDING
      if (txn.status !== 'PENDING') {
        throw ApiError.badRequest('Transaction not retryable');
      }

      // 3️⃣ Retry limit guard
      if (txn.retryCount >= 3) {
        throw ApiError.badRequest('Retry limit exceeded');
      }

      // 4️⃣ Provider must be frozen
      if (!txn.providerCode || !txn.providerConfig) {
        throw ApiError.internal('Frozen provider data missing');
      }

      // 5️⃣ Provider plugin (SNAPSHOT CONFIG)
      const plugin = getRechargePlugin(txn.providerCode, txn.providerConfig);

      // 6️⃣ Operator / Circle mapping
      const providerOperatorCode = await OperatorMapService.resolve({
        internalOperatorCode: txn.operatorCode,
        platformServiceId: txn.platformServiceId,
        providerCode: txn.providerCode,
      });

      const providerCircleCode = txn.circleCode
        ? await CircleMapService.resolve({
            internalCircleCode: txn.circleCode,
            providerCode: txn.providerCode,
          })
        : null;

      // 7️⃣ Provider call (NO WALLET TOUCH)
      await plugin.recharge({
        opcode: providerOperatorCode,
        number: txn.mobileNumber,
        amount: txn.amount,
        transid: txn.id, // SAME TXN ID
        circle: providerCircleCode,
        isRetry,
      });

      // 8️⃣ Update retry metadata
      await tx
        .update(rechargeTransactionTable)
        .set({
          retryCount: txn.retryCount + 1,
          lastRetryAt: new Date(),
          status: 'PENDING',
          updatedAt: new Date(),
        })
        .where(eq(rechargeTransactionTable.id, txn.id));

      return {
        success: true,
        transactionId: txn.id,
        retryCount: txn.retryCount + 1,
      };
    });
  }
}

export default RechargeRuntimeService;
