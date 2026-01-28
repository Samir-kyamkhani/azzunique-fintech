import { tenantMasterPagesTable } from '../models/core/index.js';
import { and, eq, ne } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';

class MasterPageService {
  async upsert(payload) {
    // SLUG CHECK
    if (payload.slug && payload.pageType) {
      const slugExists = await db
        .select()
        .from(tenantMasterPagesTable)
        .where(
          and(
            eq(tenantMasterPagesTable.slug, payload.slug),
            eq(tenantMasterPagesTable.pageType, payload.pageType),
            payload.id ? ne(tenantMasterPagesTable.id, payload.id) : undefined,
          ),
        );

      if (slugExists.length)
        throw ApiError.badRequest('Slug, page Type  already exists');
    }

    // PAGETYPE CHECK
    if (payload.pageType) {
      const typeExists = await db
        .select()
        .from(tenantMasterPagesTable)
        .where(
          and(
            eq(tenantMasterPagesTable.pageType, payload.pageType),
            payload.id ? ne(tenantMasterPagesTable.id, payload.id) : undefined,
          ),
        );

      if (typeExists.length)
        throw ApiError.badRequest(
          `${payload.pageType} template already exists`,
        );
    }

    if (payload.id) {
      const [existing] = await db
        .select()
        .from(tenantMasterPagesTable)
        .where(eq(tenantMasterPagesTable.id, payload.id));

      if (!existing) throw ApiError.notFound('Master page not found');

      await db
        .update(tenantMasterPagesTable)
        .set({
          pageType: payload.pageType ?? existing.pageType,
          title: payload.title ?? existing.title,
          slug: payload.slug ?? existing.slug,
          status: payload.status ?? existing.status,
          isHomePage: payload.isHomePage ?? existing.isHomePage,
          version: existing.version + 1,
        })
        .where(eq(tenantMasterPagesTable.id, payload.id));

      return this.findOne(payload.id);
    }

    const id = crypto.randomUUID();

    await db.insert(tenantMasterPagesTable).values({
      id,
      pageType: payload.pageType,
      title: payload.title,
      slug: payload.slug,
      status: payload.status ?? 'DRAFT',
      isHomePage: payload.isHomePage || false,
      version: 1,
      createdAt: new Date(),
    });

    return this.findOne(id);
  }

  async findAll() {
    return db.select().from(tenantMasterPagesTable);
  }

  async findOne(id) {
    const [page] = await db
      .select()
      .from(tenantMasterPagesTable)
      .where(eq(tenantMasterPagesTable.id, id));

    if (!page) throw ApiError.notFound('Master page not found');
    return page;
  }

  async delete(id) {
    await this.findOne(id);
    await db
      .delete(tenantMasterPagesTable)
      .where(eq(tenantMasterPagesTable.id, id));
  }
}

export default new MasterPageService();
