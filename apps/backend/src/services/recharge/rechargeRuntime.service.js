import { db } from '../../database/core/core-db.js';
import { eq, and } from 'drizzle-orm';
import {
  tenantServiceTable,
  platformServiceProviderTable,
  platformServiceTable,
  serviceProviderTable,
} from '../../models/core/index.js';
import { ApiError } from '../../lib/ApiError.js';

import { rechargeDb } from '../../database/recharge/recharge-db.js';
import { rechargeTransactionTable } from '../../models/recharge/index.js';

import { getRechargePlugin } from '../../plugin_registry/pluginRegistry.js';
import OperatorMapService from '../recharge-admin/operatorMap.service.js';
import CircleMapService from '../recharge-admin/circleMap.service.js';

// RULE: User → WL → Reseller → AZZUNIQUE (sab ke liye service enabled honi chahiye)

/*
 * RechargeRuntimeService.resolve() ka sirf ek kaam hai:
 * Runtime pe ye decide karna:
 * Recharge service allowed hai ya nahi (hierarchy ke har level pe)
 * Kaunsa provider use hoga (WL / Reseller / AZZUNIQUE)
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

    // 2️⃣ Hierarchy enable check
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

    // 3️⃣ Provider resolve WITH CODE
    const [row] = await db
      .select({
        providerId: platformServiceProviderTable.serviceProviderId,
        providerCode: serviceProviderTable.code, // ✅ IMPORTANT
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
        config: row.config,
      },
    };
  }

  static async execute({ transactionId, isRetry = false }) {
    // 1️⃣ Load transaction
    const [txn] = await rechargeDb
      .select()
      .from(rechargeTransactionTable)
      .where(eq(rechargeTransactionTable.id, transactionId))
      .limit(1);

    if (!txn) {
      throw ApiError.notFound('Recharge transaction not found');
    }

    // 2️⃣ Only retry-safe states
    if (!['FAILED', 'PENDING'].includes(txn.status)) {
      throw ApiError.badRequest('Transaction not retryable');
    }

    // 3️⃣ Resolve provider plugin (FROZEN PROVIDER)
    const plugin = getRechargePlugin(
      txn.providerCode,
      txn.providerConfig, // 👉 recommended: store providerConfig snapshot
    );

    // 4️⃣ Operator / circle mapping
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

    // 5️⃣ Call provider (NO WALLET TOUCH)
    const response = await plugin.recharge({
      opcode: providerOperatorCode,
      number: txn.mobileNumber,
      amount: txn.amount,
      transid: txn.id, // SAME TXN ID
      circle: providerCircleCode,
      isRetry,
    });

    // 6️⃣ Update status → PENDING (callback will finalize)
    await rechargeDb
      .update(rechargeTransactionTable)
      .set({
        status: 'PENDING',
        updatedAt: new Date(),
      })
      .where(eq(rechargeTransactionTable.id, txn.id));

    return {
      status: 'RETRIED',
      providerResponse: response,
    };
  }
}

export default RechargeRuntimeService;
