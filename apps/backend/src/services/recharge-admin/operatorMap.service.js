import { db } from '../../database/core/core-db.js';
import { rechargeOperatorMapTable } from '../../models/recharge/index.js';
import { ApiError } from '../../lib/ApiError.js';
import crypto from 'crypto';
import { and, eq } from 'drizzle-orm';
import { serviceProviderTable } from '../../models/core/serviceProvider.schema.js';

class OperatorMapService {
  async upsert(data, actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only AZZUNIQUE allowed');
    }

    /**
     * Expected data:
     * {
     *   platformServiceId,
     *   platformServiceFeatureId
     *   serviceProviderId,
     *   internalOperatorCode,
     *   providerOperatorCode
     * }
     */

    await db
      .insert(rechargeOperatorMapTable)
      .values({
        id: crypto.randomUUID(),
        ...data,
      })
      .onDuplicateKeyUpdate({
        set: {
          providerOperatorCode: data.providerOperatorCode,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  }

  async list() {
    return db
      .select({
        id: rechargeOperatorMapTable.id,
        internalOperatorCode: rechargeOperatorMapTable.internalOperatorCode,
        providerOperatorCode: rechargeOperatorMapTable.providerOperatorCode,
        providerName: serviceProviderTable.providerName,
      })
      .from(rechargeOperatorMapTable)
      .leftJoin(
        serviceProviderTable,
        eq(rechargeOperatorMapTable.serviceProviderId, serviceProviderTable.id),
      );
  }

  async resolve({
    internalOperatorCode,
    platformServiceId,
    platformServiceFeatureId,
    serviceProviderId,
  }) {
    console.log('internalOperatorCode', internalOperatorCode);
    console.log('platformServiceId', platformServiceId);
    console.log('serviceProviderId', serviceProviderId);

    const [row] = await db
      .select()
      .from(rechargeOperatorMapTable)
      .where(
        and(
          eq(
            rechargeOperatorMapTable.internalOperatorCode,
            internalOperatorCode,
          ),
          eq(rechargeOperatorMapTable.platformServiceId, platformServiceId),
          eq(
            rechargeOperatorMapTable.platformServiceFeatureId,
            platformServiceFeatureId,
          ),
          eq(rechargeOperatorMapTable.serviceProviderId, serviceProviderId),
        ),
      )
      .limit(1);

    if (!row) {
      throw ApiError.badRequest(
        `Operator mapping not found for ${internalOperatorCode}`,
      );
    }

    return row.providerOperatorCode;
  }

  // List operator mappings for a given service and provider. Used in recharge flow to show operator options.
  async listForRecharge({ platformServiceId, serviceProviderId }) {
    return db
      .select({
        id: rechargeOperatorMapTable.id,
        internalOperatorCode: rechargeOperatorMapTable.internalOperatorCode,
        providerOperatorCode: rechargeOperatorMapTable.providerOperatorCode,
      })
      .from(rechargeOperatorMapTable)
      .where(
        and(
          eq(rechargeOperatorMapTable.platformServiceId, platformServiceId),
          eq(rechargeOperatorMapTable.serviceProviderId, serviceProviderId),
        ),
      );
  }
}

export default new OperatorMapService();
