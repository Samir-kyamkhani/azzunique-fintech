import { roleTable } from '../../../models/core/role.schema.js';
import { db } from '../core-db.js';
import { and, eq } from 'drizzle-orm';

export async function seedRoles(tenantId) {
  const roles = [
    {
      roleCode: 'AZZUNIQUE',
      roleName: 'Azzunique',
      roleDescription: 'System administrator with full access',
      isSystem: true,
    },
  ];

  for (const role of roles) {
    const existingRole = await db
      .select({ id: roleTable.id })
      .from(roleTable)
      .where(
        and(
          eq(roleTable.roleCode, role.roleCode),
          eq(roleTable.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (existingRole.length > 0) {
      console.log(`⚠️ Role ${role.roleCode} already exists, skipping.`);
      continue;
    }

    await db.insert(roleTable).values({
      roleCode: role.roleCode,
      roleName: role.roleName,
      roleDescription: role.roleDescription,
      tenantId,
      isSystem: true,
    });

    console.log(`✅ System role ${role.roleCode} seeded successfully.`);
  }
}
