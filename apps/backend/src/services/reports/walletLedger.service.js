import { db } from '../../database/core/core-db.js';
import { ledgerTable } from '../../models/core/index.js';
import { and, eq, gte, lte, desc } from 'drizzle-orm';

class WalletLedgerService {
  async list(query, actor) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(ledgerTable.walletId, query.walletId)];

    if (query.from) {
      conditions.push(gte(ledgerTable.createdAt, new Date(query.from)));
    }

    if (query.to) {
      conditions.push(lte(ledgerTable.createdAt, new Date(query.to)));
    }

    const rows = await db
      .select()
      .from(ledgerTable)
      .where(and(...conditions))
      .orderBy(desc(ledgerTable.createdAt))
      .limit(limit)
      .offset(offset);

    return { data: rows, meta: { page, limit } };
  }
}

export default new WalletLedgerService();
