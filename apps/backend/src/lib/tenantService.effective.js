import { db } from '../database/core/core-db.js';
import { sql } from 'drizzle-orm';

class TenantServiceEffective {
  async isServiceEffectivelyEnabled(tenantId, serviceId) {
    const result = await db.execute(sql`
      WITH RECURSIVE tenant_tree AS (
        SELECT id, parent_tenant_id
        FROM tenants
        WHERE id = ${tenantId}

        UNION ALL

        SELECT t.id, t.parent_tenant_id
        FROM tenants t
        INNER JOIN tenant_tree tt ON t.id = tt.parent_tenant_id
      )

      SELECT COUNT(*) AS disabled_count
      FROM tenant_tree tt
      LEFT JOIN tenant_services ts
        ON ts.tenant_id = tt.id
        AND ts.platform_service_id = ${serviceId}
      WHERE ts.is_enabled = false
    `);

    const disabledCount = Number(result[0]?.disabled_count ?? 0);

    return disabledCount === 0;
  }
}

export default new TenantServiceEffective();
