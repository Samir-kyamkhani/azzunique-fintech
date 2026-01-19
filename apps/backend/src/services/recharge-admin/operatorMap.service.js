import { db } from '../../database/core/core-db.js';
import { rechargeOperatorMapTable } from '../../models/recharge/index.js';
import { ApiError } from '../../lib/ApiError.js';
import crypto from 'crypto';

class OperatorMapService {
  async upsert(data, actor) {
    if (actor.roleLevel !== 0) {
      throw ApiError.forbidden('Only AZZUNIQUE allowed');
    }

    await db
      .insert(rechargeOperatorMapTable)
      .values({ id: crypto.randomUUID(), ...data })
      .onDuplicateKeyUpdate({ set: data });

    return { success: true };
  }

  async list() {
    return db.select().from(rechargeOperatorMapTable);
  }

  async resolve({ internalOperatorCode, platformServiceId, providerCode }) {
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
        ),
      )
      .limit(1);

    if (!row) {
      throw ApiError.badRequest(
        `Operator mapping not found for ${internalOperatorCode}`,
      );
    }

    if (providerCode === 'MPLAN') {
      if (!row.mplanOperatorCode) {
        throw ApiError.badRequest('MPLAN operator code missing');
      }
      return row.mplanOperatorCode;
    }

    if (providerCode === 'RECHARGE_EXCHANGE') {
      if (!row.rechargeExchangeOperatorCode) {
        throw ApiError.badRequest('RechargeExchange operator code missing');
      }
      return row.rechargeExchangeOperatorCode;
    }

    throw ApiError.internal('Unsupported provider');
  }
}

export default new OperatorMapService();
