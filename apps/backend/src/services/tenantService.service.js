import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import tenantServiceEffective from '../lib/tenantService.effective.js';
import {
  tenantsTable,
  tenantServiceTable,
  platformServiceTable,
} from '../models/core/index.js';
import { and, eq, inArray, sql } from 'drizzle-orm';

class TenantService {
  /* ENABLE / DISABLE SERVICE                          */
  async enable(data, actor) {
    const { tenantId, platformServiceId } = data;

    if (!tenantId || !platformServiceId) {
      throw ApiError.badRequest('tenantId and platformServiceId required');
    }

    // Only allowed hierarchy roles
    if (![0, 1, 2].includes(actor.roleLevel)) {
      throw ApiError.forbidden(
        'You are not allowed to enable/disable services',
      );
    }

    // Validate target tenant
    const [targetTenant] = await db
      .select({
        id: tenantsTable.id,
        parentTenantId: tenantsTable.parentTenantId,
      })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, tenantId))
      .limit(1);

    if (!targetTenant) {
      throw ApiError.notFound('Target tenant not found');
    }

    // Validate platform service
    const [service] = await db
      .select({
        id: platformServiceTable.id,
        isActive: platformServiceTable.isActive,
      })
      .from(platformServiceTable)
      .where(eq(platformServiceTable.id, platformServiceId))
      .limit(1);

    if (!service) {
      throw ApiError.notFound('Platform service not found');
    }

    if (!service.isActive) {
      throw ApiError.badRequest('Platform service is inactive');
    }

    if (actor.roleLevel === 0) {
      return this.upsert(tenantId, platformServiceId, data.isEnabled);
    }

    // Must be tenant owner
    if (!actor.isTenantOwner) {
      throw ApiError.forbidden('Only tenant owner allowed');
    }

    //  Hierarchy validation (Direct Parent Only) RESELLER → WHITELABEL
    if (targetTenant.parentTenantId !== actor.tenantId) {
      throw ApiError.forbidden(
        'You can enable service only for your direct child tenants',
      );
    }

    //  Parent service effective check
    const parentEnabled =
      await tenantServiceEffective.isServiceEffectivelyEnabled(
        actor.tenantId,
        platformServiceId,
      );

    if (!parentEnabled) {
      throw ApiError.forbidden('Parent tenant has disabled this service');
    }

    //  UPSERT SERVICE ENABLE/DISABLE
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

    if (actor.roleLevel === 0 || actor.roleLevel === 1) {
      // AZZUNIQUE / Reseller → direct children
      const tenants = await db
        .select({ id: tenantsTable.id })
        .from(tenantsTable)
        .where(eq(tenantsTable.parentTenantId, actor.tenantId));

      allowedTenantIds = tenants.map((t) => t.id);
    } else if (actor.roleLevel === 2) {
      // WhiteLabel → self only
      allowedTenantIds = [actor.tenantId];
    }

    if (!allowedTenantIds.length) {
      return [];
    }

    return db
      .select({
        tenantId: tenantServiceTable.tenantId,
        tenantName: tenantsTable.tenantName,
        platformServiceId: tenantServiceTable.platformServiceId,
        platformServiceName: platformServiceTable.name,
        isEnabled: tenantServiceTable.isEnabled,
        createdAt: tenantServiceTable.createdAt,
        updatedAt: tenantServiceTable.updatedAt,
      })
      .from(tenantServiceTable)
      .innerJoin(tenantsTable, eq(tenantServiceTable.tenantId, tenantsTable.id))
      .innerJoin(
        platformServiceTable,
        eq(tenantServiceTable.platformServiceId, platformServiceTable.id),
      )
      .where(inArray(tenantServiceTable.tenantId, allowedTenantIds));
  }

  async listEnabledForTenant(actor) {
    const tenantId = actor.tenantId;

    return db
      .select({
        id: platformServiceTable.id,
        code: platformServiceTable.code,
        name: platformServiceTable.name,
        isActive: platformServiceTable.isActive,
      })
      .from(platformServiceTable)
      .innerJoin(
        tenantServiceTable,
        eq(platformServiceTable.id, tenantServiceTable.platformServiceId),
      )
      .where(
        and(
          eq(tenantServiceTable.tenantId, tenantId),
          eq(tenantServiceTable.isEnabled, true),
          eq(platformServiceTable.isActive, true),
        ),
      );
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
