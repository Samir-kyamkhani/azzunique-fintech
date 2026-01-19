import { db } from '../../database/core/core-db.js';
import { rechargeCircleMapTable } from '../../models/recharge/index.js';
import { ApiError } from '../../lib/ApiError.js';
import crypto from 'crypto';

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

  async resolve({ internalCircleCode, providerCode }) {
    const [row] = await db
      .select()
      .from(rechargeCircleMapTable)
      .where(eq(rechargeCircleMapTable.internalCircleCode, internalCircleCode))
      .limit(1);

    if (!row) {
      throw ApiError.badRequest(
        `Circle mapping not found for ${internalCircleCode}`,
      );
    }

    if (providerCode === 'MPLAN') {
      if (!row.mplanCircleCode) {
        throw ApiError.badRequest('MPLAN circle code missing');
      }
      return row.mplanCircleCode;
    }

    // RechargeExchange does NOT require circle
    return null;
  }
}

export default new CircleMapService();
