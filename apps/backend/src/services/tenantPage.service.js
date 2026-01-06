import { db } from '../database/core/core-db.js';
import { tenantPagesTable } from '../models/core/tenantPage.schema.js';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { ApiError } from '../lib/ApiError.js';

export class TenantPageService {
  // ================= CREATE =================
  static async create(payload, actor) {
    const id = randomUUID();

    await db.insert(tenantPagesTable).values({
      id,
      tenantId: actor.tenantId,
      pageTitle: payload.pageTitle,
      pageContent: payload.pageContent,
      pageUrl: payload.pageUrl,
      status: payload.status ?? 'DRAFT',
      createdByUserId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.getById(id, actor);
  }

  // ================= UPDATE =================
  static async update(id, payload, actor) {
    await this.getById(id, actor);

    await db
      .update(tenantPagesTable)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tenantPagesTable.id, id),
          eq(tenantPagesTable.tenantId, actor.tenantId),
        ),
      );

    return this.getById(id, actor);
  }

  // ================= DELETE =================
  static async delete(id, actor) {
    await this.getById(id, actor);

    await db
      .delete(tenantPagesTable)
      .where(
        and(
          eq(tenantPagesTable.id, id),
          eq(tenantPagesTable.tenantId, actor.tenantId),
        ),
      );

    return true;
  }

  // ================= GET BY ID (AUTH) =================
  static async getById(id, actor) {
    const [page] = await db
      .select()
      .from(tenantPagesTable)
      .where(
        and(
          eq(tenantPagesTable.id, id),
          eq(tenantPagesTable.tenantId, actor.tenantId),
        ),
      )
      .limit(1);

    if (!page) {
      throw ApiError.notFound('Page not found');
    }

    return page;
  }

  // ================= PUBLIC GET ALL =================
  static async getPublicPages(tenantId) {
    return db
      .select({
        pageTitle: tenantPagesTable.pageTitle,
        pageContent: tenantPagesTable.pageContent,
        pageUrl: tenantPagesTable.pageUrl,
      })
      .from(tenantPagesTable)
      .where(
        and(
          eq(tenantPagesTable.tenantId, tenantId),
          eq(tenantPagesTable.status, 'PUBLISHED'),
        ),
      );
  }
}
