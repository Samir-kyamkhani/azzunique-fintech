import { db } from '../database/core/core-db.js';
import { tenantsWebsitesTable } from '../models/core/index.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { ApiError } from '../lib/ApiError.js';
import S3Service from '../lib/S3Service.js';

export class TenantWebsiteService {
  // ================= GET BY TENANT =================
  static async getByTenantId(tenantId) {
    const [website] = await db
      .select()
      .from(tenantsWebsitesTable)
      .where(eq(tenantsWebsitesTable.tenantId, tenantId))
      .limit(1);

    if (!website) return null;

    return {
      ...website,
      logoUrl: website.logoUrl ? S3Service.buildS3Url(website.logoUrl) : null,
      favIconUrl: website.favIconUrl
        ? S3Service.buildS3Url(website.favIconUrl)
        : null,
    };
  }

  // ================= UPSERT =================
  static async upsert(payload, actor, files = {}) {
    if (!actor.tenantId) {
      throw ApiError.badRequest('Tenant context missing');
    }

    const [existing] = await db
      .select()
      .from(tenantsWebsitesTable)
      .where(eq(tenantsWebsitesTable.tenantId, actor.tenantId))
      .limit(1);

    let logoKey = existing?.logoUrl ?? null;
    let favIconKey = existing?.favIconUrl ?? null;

    // ---------- LOGO UPLOAD ----------
    if (files.logo) {
      const uploaded = await S3Service.upload(files.logo.path, 'logos');

      if (existing?.logoUrl) {
        await S3Service.deleteByKey(existing.logoUrl);
      }

      logoKey = uploaded.key;
    }

    // ---------- FAVICON UPLOAD ----------
    if (files.favicon) {
      const uploaded = await S3Service.upload(files.favicon.path, 'favicons');

      if (existing?.favIconUrl) {
        await S3Service.deleteByKey(existing.favIconUrl);
      }

      favIconKey = uploaded.key;
    }

    // ---------- CREATE ----------
    if (!existing) {
      const id = randomUUID();

      await db.insert(tenantsWebsitesTable).values({
        id,
        tenantId: actor.tenantId,

        brandName: payload.brandName,
        tagLine: payload.tagLine,

        logoUrl: logoKey,
        favIconUrl: favIconKey,

        primaryColor: payload.primaryColor,
        secondaryColor: payload.secondaryColor,

        supportEmail: payload.supportEmail,
        supportPhone: payload.supportPhone,

        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return this.getByTenantId(actor.tenantId);
    }

    // ---------- UPDATE ----------
    await db
      .update(tenantsWebsitesTable)
      .set({
        ...payload,
        logoUrl: logoKey,
        favIconUrl: favIconKey,
        updatedAt: new Date(),
      })
      .where(eq(tenantsWebsitesTable.tenantId, actor.tenantId));

    return this.getByTenantId(actor.tenantId);
  }
}
