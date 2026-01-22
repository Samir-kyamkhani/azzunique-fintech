import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import { tenantsDomainsTable } from '../models/core/tenantDomain.schema.js';
import { tenantsTable } from '../models/core/tenant.schema.js';
import { eq } from 'drizzle-orm';

const TENANT_BYPASS_ROUTES = ['/api/v1/auth/login', '/api/v1/health'];

export async function tenantContextMiddleware(req, res, next) {
  if (TENANT_BYPASS_ROUTES.includes(req.path)) {
    return next();
  }

  const host = req.headers.host?.split(':')[0];

  if (!host) {
    throw ApiError.badRequest('Invalid host');
  }

  const [domain] = await db
    .select()
    .from(tenantsDomainsTable)
    .where(eq(tenantsDomainsTable.domainName, host))
    .limit(1);

  if (!domain) {
    throw ApiError.badRequest('Tenant not found');
  }

  const [tenant] = await db
    .select()
    .from(tenantsTable)
    .where(eq(tenantsTable.id, domain.tenantId))
    .limit(1);

  if (!tenant || tenant.tenantStatus !== 'ACTIVE') {
    throw ApiError.conflict('Tenant inactive');
  }

  req.tenant = tenant;
  next();
}
