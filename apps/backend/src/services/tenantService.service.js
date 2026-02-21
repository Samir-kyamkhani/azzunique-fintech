import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import tenantServiceEffective from '../lib/tenantService.effective.js';
import {
  tenantsTable,
  tenantServiceTable,
  platformServiceTable,
} from '../models/core/index.js';
import { eq, inArray, sql } from 'drizzle-orm';

class TenantService {
  /* ENABLE / DISABLE SERVICE                          */
  async enable(data, actor) {
    const { tenantId, platformServiceId } = data;

    if (!tenantId || !platformServiceId) {
      throw ApiError.badRequest('tenantId and platformServiceId required');
    }

    // Only top hierarchy roles
    if (![0, 1, 2].includes(actor.roleLevel)) {
      throw ApiError.forbidden(
        'You are not allowed to enable/disable services',
      );
    }

    // Validate target tenant exists
    const [targetTenant] = await db
      .select({ id: tenantsTable.id })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, tenantId))
      .limit(1);

    if (!targetTenant) {
      throw ApiError.notFound('Target tenant not found');
    }

    // 🔥 AZZUNIQUE → full control
    if (actor.roleLevel === 0) {
      return this.upsert(tenantId, platformServiceId, data.isEnabled);
    }

    // Must be tenant owner
    if (!actor.isTenantOwner) {
      throw ApiError.forbidden('Only tenant owner allowed');
    }

    // 🔥 Hierarchy validation (recursive CTE)
    const hierarchyQuery = sql`
      WITH RECURSIVE tenant_tree AS (
        SELECT id, parent_tenant_id
        FROM tenants
        WHERE id = ${tenantId}

        UNION ALL

        SELECT t.id, t.parent_tenant_id
        FROM tenants t
        INNER JOIN tenant_tree tt
          ON t.id = tt.parent_tenant_id
      )
      SELECT id FROM tenant_tree
    `;

    const hierarchy = await db.execute(hierarchyQuery);
    const tenantIds = hierarchy.map((r) => r.id);

    if (!tenantIds.includes(actor.tenantId)) {
      throw ApiError.forbidden(
        'You can enable service only for your child tenants',
      );
    }

    // 🔥 Parent effective enable check
    const parentEnabled =
      await tenantServiceEffective.isServiceEffectivelyEnabled(
        actor.tenantId,
        platformServiceId,
      );

    if (!parentEnabled) {
      throw ApiError.forbidden('Parent tenant has disabled this service');
    }

    const [service] = await db
      .select({ id: platformServiceTable.id })
      .from(platformServiceTable)
      .where(eq(platformServiceTable.id, platformServiceId))
      .limit(1);

    if (!service) {
      throw ApiError.notFound('Platform service not found');
    }

    return this.upsert(tenantId, platformServiceId, data.isEnabled);
  }

  /* UPSERT                                             */
  async upsert(tenantId, platformServiceId, isEnabled = true) {
    await db
      .insert(tenantServiceTable)
      .values({
        tenantId,
        platformServiceId,
        isEnabled,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: {
          isEnabled,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  }

  /* LIST SERVICES (SCOPED)                            */
  async listAll(actor) {
    if (![0, 1, 2].includes(actor.roleLevel)) {
      throw ApiError.forbidden('Not allowed to view services');
    }

    let allowedTenantIds = [];

    if (actor.roleLevel === 0) {
      // All tenants
      const tenants = await db
        .select({ id: tenantsTable.id })
        .from(tenantsTable);

      allowedTenantIds = tenants.map((t) => t.id);
    } else {
      // Recursive CTE for full subtree
      const subtreeQuery = sql`
        WITH RECURSIVE tenant_tree AS (
          SELECT id
          FROM tenants
          WHERE id = ${actor.tenantId}

          UNION ALL

          SELECT t.id
          FROM tenants t
          INNER JOIN tenant_tree tt
            ON t.parent_tenant_id = tt.id
        )
        SELECT id FROM tenant_tree
      `;

      const subtree = await db.execute(subtreeQuery);
      allowedTenantIds = subtree.map((r) => r.id);
    }

    if (!allowedTenantIds.length) {
      return [];
    }

    return db
      .select({
        id: tenantServiceTable.id,
        tenantId: tenantServiceTable.tenantId,
        tenantName: tenantsTable.tenantName,
        platformServiceId: tenantServiceTable.platformServiceId,
        platformServiceName: platformServiceTable.name,
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

  /* DISABLE                                            */
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
