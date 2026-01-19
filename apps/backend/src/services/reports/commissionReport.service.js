// services/reports/commissionReport.service.js
import { db } from '../../database/core/core-db.js';
import { commissionEarningTable } from '../../models/core/index.js';
import { and, eq, gte, lte, desc, sql } from 'drizzle-orm';

class CommissionReportService {
  async list(query, actor) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(commissionEarningTable.tenantId, actor.tenantId)];

    if (query.from) {
      conditions.push(
        gte(commissionEarningTable.createdAt, new Date(query.from)),
      );
    }

    if (query.to) {
      conditions.push(
        lte(commissionEarningTable.createdAt, new Date(query.to)),
      );
    }

    const rows = await db
      .select({
        id: commissionEarningTable.id,
        transactionId: commissionEarningTable.transactionId,
        grossAmount: commissionEarningTable.grossAmount,
        gstAmount: commissionEarningTable.gstAmount,
        netAmount: commissionEarningTable.netAmount,
        createdAt: commissionEarningTable.createdAt,
      })
      .from(commissionEarningTable)
      .where(and(...conditions))
      .orderBy(desc(commissionEarningTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [summary] = await db
      .select({
        gross: sql`SUM(${commissionEarningTable.grossAmount})`,
        gst: sql`SUM(${commissionEarningTable.gstAmount})`,
        net: sql`SUM(${commissionEarningTable.netAmount})`,
      })
      .from(commissionEarningTable)
      .where(and(...conditions));

    return {
      data: rows,
      summary,
      meta: { page, limit },
    };
  }
}

export default new CommissionReportService();
