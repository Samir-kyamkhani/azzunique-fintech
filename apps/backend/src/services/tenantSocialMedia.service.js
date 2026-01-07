import { db } from '../database/core/core-db.js';
import { tenantSocialMediaTable } from '../models/core/tenantSocialMedia.schema.js';
import { tenantsWebsitesTable } from '../models/core/tenantWebsite.schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { ApiError } from '../lib/ApiError.js';

export class TenantSocialMediaService {
  // ================= GET BY WEBSITE =================
  static async getById(tenantId) {
    const [tenantsWebsites] = await db
      .select()
      .from(tenantsWebsitesTable)
      .where(eq(tenantsWebsitesTable.tenantId, tenantId))
      .limit(1);

    if (!tenantsWebsites) {
      throw ApiError('Not Found Tenant website');
    }

    const [row] = await db
      .select()
      .from(tenantSocialMediaTable)
      .where(eq(tenantSocialMediaTable.tenantWebsiteId, tenantsWebsites.id))
      .limit(1);

    return row ?? null;
  }

  // ================= UPSERT =================
  static async upsert(payload, actor) {
    if (!actor.tenantId) {
      throw ApiError.badRequest('Tenant context missing');
    }

    // ensure website belongs to tenant
    const [website] = await db
      .select()
      .from(tenantsWebsitesTable)
      .where(eq(tenantsWebsitesTable.tenantId, actor.tenantId))
      .limit(1);

    if (!website) {
      throw ApiError.notFound('Tenant website not found');
    }

    const [existing] = await db
      .select()
      .from(tenantSocialMediaTable)
      .where(eq(tenantSocialMediaTable.tenantWebsiteId, website.id))
      .limit(1);

    // ---------- CREATE ----------
    if (!existing) {
      const id = randomUUID();

      await db.insert(tenantSocialMediaTable).values({
        id,
        tenantWebsiteId: website.id,
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return this.getById(website.id);
    }

    // ---------- UPDATE ----------
    await db
      .update(tenantSocialMediaTable)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(tenantSocialMediaTable.tenantWebsiteId, website.id));

    return this.getById(website.id);
  }
}
