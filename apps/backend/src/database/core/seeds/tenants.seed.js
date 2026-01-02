import { randomUUID } from 'node:crypto';
import { db } from '../core-db.js';
import { tenantsTable } from '../../../models/core/tenant.schema.js';
import { generateNumber } from '../../../lib/lib.js';
import { eq } from 'drizzle-orm'; // <- eq function import karna zaruri hai

export async function seedTenants() {
  const tenantEmail = 'admin@azzunique.com';

  // Check if tenant already exists
  const existingTenant = await db
    .select()
    .from(tenantsTable)
    .where(eq(tenantsTable.tenantEmail, tenantEmail));

  if (existingTenant.length > 0) {
    console.log(`Tenant ${tenantEmail} already exists, skipping seed.`);
    return existingTenant[0].id; // return id so we can link users
  }

  const tenantId = randomUUID();

  await db.insert(tenantsTable).values({
    id: tenantId,
    tenantNumber: generateNumber('TEN-'),
    tenantName: 'Azzunique',
    tenantLegalName: 'Azzunique Private Limited',
    tenantType: 'PRIVATE_LIMITED',
    userType: 'AZZUNIQUE',
    tenantEmail,
    tenantWhatsapp: '9999999999',
    tenantMobileNumber: '9999999999',
    tenantStatus: 'ACTIVE',
  });

  console.log(`Tenant ${tenantEmail} created successfully.`);
  return tenantId;
}
