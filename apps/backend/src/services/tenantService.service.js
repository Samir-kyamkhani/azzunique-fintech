import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import {
  tenantsTable,
  tenantServiceTable,
  platformServiceTable,
} from '../models/core/index.js';
import { eq, and, inArray } from 'drizzle-orm';

class TenantService {
  async enable(data, actor) {
    // 1️⃣ Only AZZUNIQUE / RESELLER / WHITELABEL
    if (![0, 1, 2].includes(actor.roleLevel)) {
      throw ApiError.forbidden(
        'You are not allowed to enable/disable services',
      );
    }

    // 2️⃣ Fetch target tenant
    const [targetTenant] = await db
      .select({
        id: tenantsTable.id,
        parentTenantId: tenantsTable.parentTenantId,
      })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, data.tenantId))
      .limit(1);

    if (!targetTenant) {
      throw ApiError.notFound('Target tenant not found');
    }

    // 3️⃣ AZZUNIQUE → full control
    if (actor.roleLevel === 0) {
      return this.upsert(data.tenantId, data);
    }

    // 4️⃣ Must be tenant owner
    if (!actor.isTenantOwner) {
      throw ApiError.forbidden('Only tenant owner allowed');
    }

    // 5️⃣ Hierarchy validation (recursive upward check)
    let currentParent = targetTenant.parentTenantId;
    let isAllowed = false;

    while (currentParent) {
      if (currentParent === actor.tenantId) {
        isAllowed = true;
        break;
      }

      const [parent] = await db
        .select({ parentTenantId: tenantsTable.parentTenantId })
        .from(tenantsTable)
        .where(eq(tenantsTable.id, currentParent))
        .limit(1);

      currentParent = parent?.parentTenantId;
    }

    if (!isAllowed) {
      throw ApiError.forbidden(
        'You can enable service only for your child tenants',
      );
    }

    // 6️⃣ Parent must have service enabled
    const [parentService] = await db
      .select()
      .from(tenantServiceTable)
      .where(
        and(
          eq(tenantServiceTable.tenantId, actor.tenantId),
          eq(tenantServiceTable.platformServiceId, data.platformServiceId),
          eq(tenantServiceTable.isEnabled, true),
        ),
      )
      .limit(1);

    if (!parentService) {
      throw ApiError.forbidden(
        'You must enable service on your own tenant first',
      );
    }

    return this.upsert(data.tenantId, data);
  }

  async upsert(tenantId, data) {
    await db
      .insert(tenantServiceTable)
      .values({
        tenantId,
        platformServiceId: data.platformServiceId,
        isEnabled: data.isEnabled ?? true,
      })
      .onDuplicateKeyUpdate({
        set: {
          isEnabled: data.isEnabled ?? true,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  }

  async listAll(actor) {
    // 1️⃣ Role check
    if (![0, 1, 2].includes(actor.roleLevel)) {
      throw ApiError.forbidden('Not allowed to view services');
    }

    // 2️⃣ Determine allowed tenants
    let allowedTenantIds = [];

    if (actor.roleLevel === 0) {
      // AZZUNIQUE → all tenants
      const allTenants = await db
        .select({ id: tenantsTable.id })
        .from(tenantsTable);

      allowedTenantIds = allTenants.map((t) => t.id);
    } else {
      // Reseller / Whitelabel → hierarchy scoped
      allowedTenantIds = [actor.tenantId];
      let queue = [actor.tenantId];

      while (queue.length) {
        const current = queue.shift();

        const children = await db
          .select({ id: tenantsTable.id })
          .from(tenantsTable)
          .where(eq(tenantsTable.parentTenantId, current));

        const childIds = children.map((c) => c.id);

        allowedTenantIds.push(...childIds);
        queue.push(...childIds);
      }
    }

    // 3️⃣ Join with tenant + platform service
    return db
      .select({
        id: tenantServiceTable.id,
        tenantId: tenantServiceTable.tenantId,
        tenantName: tenantsTable.tenantName, // 🔥 ADD THIS
        platformServiceId: tenantServiceTable.platformServiceId,
        platformServiceName: platformServiceTable.name, // 🔥 ADD THIS
        isEnabled: tenantServiceTable.isEnabled,
        createdAt: tenantServiceTable.createdAt,
        updatedAt: tenantServiceTable.updatedAt,
      })
      .from(tenantServiceTable)
      .leftJoin(tenantsTable, eq(tenantServiceTable.tenantId, tenantsTable.id))
      .leftJoin(
        platformServiceTable,
        eq(tenantServiceTable.platformServiceId, platformServiceTable.id),
      )
      .where(inArray(tenantServiceTable.tenantId, allowedTenantIds));
  }

  async disable(tenantId, platformServiceId, actor) {
    return this.enable(
      {
        tenantId,
        platformServiceId,
        isEnabled: false,
      },
      actor,
    );
  }
}

export default new TenantService();
