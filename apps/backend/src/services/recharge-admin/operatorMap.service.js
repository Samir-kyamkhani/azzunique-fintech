import { db } from '../../database/core/core-db.js';
import { rechargeOperatorMapTable } from '../../models/recharge/index.js';
import { ApiError } from '../../lib/ApiError.js';
import crypto from 'crypto';
import { and, eq } from 'drizzle-orm';

class OperatorMapService {
  async upsert(data, actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only AZZUNIQUE allowed');
    }

    /**
     * Expected data:
     * {
     *   platformServiceId,
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
    serviceProviderId,
  }) {
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
}

export default new OperatorMapService();
