import { db } from '../../database/core/core-db.js';
import { ApiError } from '../../lib/ApiError.js';
import { ledgerTable, walletTable } from '../../models/core/index.js';
import { and, eq, gte, lte, desc, sql } from 'drizzle-orm';

class WalletLedgerService {
  async list(query, actor) {
    // 1️⃣ Pagination
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, query.limit || 20);
    const offset = (page - 1) * limit;

    // 2️⃣ Date validation
    let fromDate;
    let toDate;

    if (query.from) {
      fromDate = new Date(query.from);
      if (isNaN(fromDate)) {
        throw ApiError.badRequest('Invalid from date');
      }
    }

    if (query.to) {
      toDate = new Date(query.to);
      if (isNaN(toDate)) {
        throw ApiError.badRequest('Invalid to date');
      }
      // optional UX improvement
      toDate.setHours(23, 59, 59, 999);
    }

    // 3️⃣ Wallet existence
    const [wallet] = await db
      .select()
      .from(walletTable)
      .where(eq(walletTable.id, query.walletId))
      .limit(1);

    if (!wallet) {
      throw ApiError.notFound('Wallet not found');
    }

    // 4️⃣ Authorization
    const isOwner = wallet.ownerType === 'USER' && wallet.ownerId === actor.id;

    const isTenantOwner =
      actor.isTenantOwner === true && wallet.tenantId === actor.tenantId;

    const isSuperAdmin = actor.roleLevel === 0;

    if (!isOwner && !isTenantOwner && !isSuperAdmin) {
      throw ApiError.forbidden('Access denied to wallet ledger');
    }

    // 5️⃣ Query conditions
    const conditions = [eq(ledgerTable.walletId, query.walletId)];

    if (fromDate) {
      conditions.push(gte(ledgerTable.createdAt, fromDate));
    }

    if (toDate) {
      conditions.push(lte(ledgerTable.createdAt, toDate));
    }

    // 6️⃣ Total count
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(ledgerTable)
      .where(and(...conditions));

    // 7️⃣ Ledger rows
    const rows = await db
      .select()
      .from(ledgerTable)
      .where(and(...conditions))
      .orderBy(desc(ledgerTable.createdAt))
      .limit(limit)
      .offset(offset);

    // 8️⃣ Response
    return {
      data: rows,
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

export default new WalletLedgerService();
