import { db } from '../../database/core/core-db.js';
import { rechargeCircleMapTable } from '../../models/recharge/index.js';
import { ApiError } from '../../lib/ApiError.js';
import crypto from 'node:crypto';

class CircleMapService {
  async upsert(data, actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only AZZUNIQUE allowed');
    }

    await db
      .insert(rechargeCircleMapTable)
      .values({ id: crypto.randomUUID(), ...data })
      .onDuplicateKeyUpdate({ set: data });

    return { success: true };
  }

  async list() {
    return db.select().from(rechargeCircleMapTable);
  }

  async resolve({ internalCircleCode, platformServiceId, serviceProviderId }) {
    const [row] = await db
      .select()
      .from(rechargeCircleMapTable)
      .where(
        and(
          eq(rechargeCircleMapTable.internalCircleCode, internalCircleCode),
          eq(rechargeCircleMapTable.platformServiceId, platformServiceId),
          eq(rechargeCircleMapTable.serviceProviderId, serviceProviderId),
        ),
      )
      .limit(1);

    if (!row) {
      throw ApiError.badRequest(
        `Circle mapping not found for ${internalCircleCode}`,
      );
    }

    return row.providerCircleCode;
  }
}

export default new CircleMapService();
