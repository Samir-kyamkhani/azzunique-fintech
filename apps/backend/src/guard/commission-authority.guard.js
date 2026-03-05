import { db } from '../database/core/core-db.js';
import { tenantsTable } from '../models/core/index.js';
import { eq } from 'drizzle-orm';

/**
 * Resolve rule owner according to system rules
 *
 * AZZUNIQUE -> sets rule for RESELLER
 * RESELLER -> sets rule for WHITELABEL
 * WHITELABEL -> sets rule for SH / MD / D / R
 */

export async function resolveCommissionAuthorityTenant(userTenantId) {
  let currentTenantId = userTenantId;

  while (currentTenantId) {
    const [tenant] = await db
      .select({
        id: tenantsTable.id,
        userType: tenantsTable.userType,
        parentTenantId: tenantsTable.parentTenantId,
      })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, currentTenantId))
      .limit(1);

    if (!tenant) return null;

    if (
      tenant.userType === 'AZZUNIQUE' ||
      tenant.userType === 'RESELLER' ||
      tenant.userType === 'WHITELABEL'
    ) {
      return tenant.id;
    }

    currentTenantId = tenant.parentTenantId;
  }

  return null;
}
