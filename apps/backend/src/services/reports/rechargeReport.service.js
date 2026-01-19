import { rechargeDb as db } from '../../database/recharge/recharge-db.js';
import { rechargeTransactionTable } from '../../models/recharge/index.js';
import { and, eq, gte, lte, desc } from 'drizzle-orm';

class RechargeReportService {
  async list(query, actor) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(rechargeTransactionTable.tenantId, actor.tenantId)];

    if (query.status) {
      conditions.push(eq(rechargeTransactionTable.status, query.status));
    }

    if (query.from) {
      conditions.push(
        gte(rechargeTransactionTable.createdAt, new Date(query.from)),
      );
    }

    if (query.to) {
      conditions.push(
        lte(rechargeTransactionTable.createdAt, new Date(query.to)),
      );
    }

    const rows = await db
      .select()
      .from(rechargeTransactionTable)
      .where(and(...conditions))
      .orderBy(desc(rechargeTransactionTable.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: rows,
      meta: { page, limit },
    };
  }
}

export default new RechargeReportService();
