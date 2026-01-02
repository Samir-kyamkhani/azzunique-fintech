import { randomUUID } from 'node:crypto';
import { roleTable } from '../../../models/core/role.schema.js';
import { sql } from 'drizzle-orm';
import { db } from '../core-db.js';

export async function seedRoles() {
  const roles = [
    {
      roleCode: 'AZZUNIQUE',
      roleName: 'Azzunique',
      roleDescription: 'System administrator with full access',
    },
    {
      roleCode: 'RESELLER',
      roleName: 'Reseller',
      roleDescription: 'Reseller under a white label program',
    },
    {
      roleCode: 'WHITE_LABEL',
      roleName: 'White Label',
      roleDescription: 'White label partner with branding rights',
    },
    {
      roleCode: 'STATE_HEAD',
      roleName: 'State Head',
      roleDescription: 'Manager overseeing operations within a state',
    },
    {
      roleCode: 'MASTER_DISTRIBUTOR',
      roleName: 'Master Distributor',
      roleDescription: 'Manages multiple distributors',
    },
    {
      roleCode: 'DISTRIBUTOR',
      roleName: 'Distributor',
      roleDescription: 'Distributes products to retailers',
    },
    {
      roleCode: 'RETAILER',
      roleName: 'Retailer',
      roleDescription: 'Sells products directly to customers',
    },
  ];

  for (const role of roles) {
    const existingRole = await db
      .select()
      .from(roleTable)
      .where(sql`${roleTable.roleCode} = ${role.roleCode}`)
      .limit(1);

    if (existingRole.length > 0) {
      console.log(`Role ${role.roleCode} already exists, skipping.`);
      continue;
    }

    await db.insert(roleTable).values({
      id: randomUUID(),
      roleCode: role.roleCode,
      roleName: role.roleName,
      roleDescription: role.roleDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Role ${role.roleCode} seeded successfully.`);
  }
}
