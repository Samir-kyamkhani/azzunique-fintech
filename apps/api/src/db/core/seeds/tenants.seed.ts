import { CoreDbService } from '../drizzle';
import { tenantsTable } from '../schema';
import { randomUUID } from 'node:crypto';

export async function seedTenants(db: CoreDbService) {
  const tenantId = randomUUID();

  await db.insert(tenantsTable).values({
    id: tenantId,

    tenantNumber: `TEN-${Math.floor(1000 + Math.random() * 9000)}`,

    tenantName: 'Azzunique',
    tenantLegalName: 'Azzunique Private Limited',

    tenantType: 'PRIVATE_LIMITED',
    userType: 'AZZUNIQUE',

    tenantEmail: 'admin@azzunique.com',
    tenantWhatsapp: '9999999999',
    tenantMobileNumber: '9999999999',

    tenantStatus: 'ACTIVE',

    parentTenantId: null,
    createdByEmployeeId: null,
  });
}
