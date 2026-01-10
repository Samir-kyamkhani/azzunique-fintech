import { db } from '../database/core/core-db.js';
import { usersTable } from '../models/core/index.js';
import { eq, isNull, and } from 'drizzle-orm';

export async function deriveTenantOwnership(actor) {
  if (!actor?.id || !actor?.tenantId) {
    return {
      isTenantOwner: false,
      ownedTenantId: null,
    };
  }

  const [owner] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(
      and(
        eq(usersTable.id, actor.id),
        eq(usersTable.tenantId, actor.tenantId),
        isNull(usersTable.ownerUserId),
      ),
    )
    .limit(1);

  return {
    isTenantOwner: !!owner,
    ownedTenantId: owner ? actor.tenantId : null,
  };
}
