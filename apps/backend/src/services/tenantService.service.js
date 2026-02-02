import { eq, and } from 'drizzle-orm';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import { tenantServiceTable } from '../models/core/index.js';

class TenantService {
  //   AZZUNIQUE → can enable for ANY tenant
  //   TenantOwner → can enable ONLY for child tenant

  async enable(targetTenantId, data, actor) {
    // 🔐 PERMISSION
    if (actor.roleLevel === 0) {
      // AZZUNIQUE → allowed
    } else {
      // tenant owner
      if (!actor.isTenantOwner) {
        throw ApiError.forbidden('Only tenant owner allowed');
      }

      if (actor.tenantId !== targetTenantId) {
        // enabling for child tenant
        // 🔥 MUST HAVE SERVICE ENABLED ON SELF
        const parentHasService = await db
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

        if (!parentHasService.length) {
          throw ApiError.forbidden('Service not enabled for parent tenant');
        }
      }
    }

    // UPSERT
    await db
      .insert(tenantServiceTable)
      .values({
        tenantId: targetTenantId,
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

  async list(tenantId) {
    return db
      .select()
      .from(tenantServiceTable)
      .where(eq(tenantServiceTable.tenantId, tenantId));
  }

  async disable(tenantId, platformServiceId, actor) {
    return this.enable(
      tenantId,
      { platformServiceId, isEnabled: false },
      actor,
    );
  }
}

export default new TenantService();
