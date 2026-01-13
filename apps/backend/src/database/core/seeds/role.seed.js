import { roleTable } from '../../../models/core/role.schema.js';
import { db } from '../core-db.js';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export async function seedRoles(tenantId) {
  const roles = [
    {
      roleCode: 'AZZUNIQUE',
      roleName: 'Azzunique System Admin',
      roleDescription: 'System administrator with full access',
      isSystem: true,
    },
  ];

  for (const role of roles) {
    const [existing] = await db
      .select({ id: roleTable.id })
      .from(roleTable)
      .where(
        and(
          eq(roleTable.roleCode, role.roleCode),
          eq(roleTable.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (existing) {
      console.log(`⚠️ Role ${role.roleCode} already exists`);
      continue;
    }

    await db.insert(roleTable).values({
      id: randomUUID(),
      roleCode: role.roleCode,
      roleName: role.roleName,
      roleDescription: role.roleDescription,
      tenantId,
      isSystem: true,
      createdByUserId: null,
      createdByEmployeeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Role ${role.roleCode} seeded`);
  }
}
