import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import { tenantsDomainsTable } from '../models/core/tenantDomain.schema.js';
import { tenantsTable } from '../models/core/tenant.schema.js';
import { eq } from 'drizzle-orm';

export async function tenantContextMiddleware(req, res, next) {
  try {
    const host = extractTenantHost(req);

    if (!host) {
      return next(ApiError.badRequest('Invalid host'));
    }

    // Platform owner
    if (host === process.env.CLIENT_URL) {
      req.context = { role: 'OWNER' };
      return next();
    }

    const [domain] = await db
      .select()
      .from(tenantsDomainsTable)
      .where(eq(tenantsDomainsTable.domainName, host))
      .limit(1);m

    if (!domain) {
      return next(ApiError.notFound('Tenant not found'));
    }

    const [tenant] = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, domain.tenantId))
      .limit(1);

    if (!tenant || tenant.tenantStatus !== 'ACTIVE') {
      return next(ApiError.forbidden('Tenant inactive'));
    }

    req.context = { tenant, domain };
    next();
  } catch (err) {
    next(err);
  }
}
