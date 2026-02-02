import { and, eq } from 'drizzle-orm';
import crypto from 'node:crypto';

import {
  tenantsDomainsTable,
  tenantsTable,
  usersTable,
  employeesTable,
  serverDetailTable,
} from '../models/core/index.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';

class TenantDomainService {
  static async upsert(payload, actor) {
    if (!actor) {
      throw ApiError.unauthorized('Invalid actor');
    }

    const tenantId = payload?.tenantId ?? actor?.tenantId;
    if (!tenantId) {
      throw ApiError.badRequest('TenantId missing');
    }

    const domainName = payload.domainName?.trim().toLowerCase();
    if (!domainName) {
      throw ApiError.badRequest('Domain name required');
    }

    const now = new Date();

    const [existing] = await db
      .select()
      .from(tenantsDomainsTable)
      .where(
        and(
          eq(tenantsDomainsTable.tenantId, tenantId),
          eq(tenantsDomainsTable.domainName, domainName),
        ),
      )
      .limit(1);

    if (existing) {
      return { id: existing.id, updated: true };
    }

    const server = await resolveServerForTenant(tenantId);

    const id = crypto.randomUUID();

    await db.insert(tenantsDomainsTable).values({
      id,
      tenantId,
      domainName,
      serverDetailId: server.id, // 👈 AUTO
      status: 'PENDING',
      createdByUserId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  }

  static async findByTenantId(tenantId) {
    const [result] = await db
      .select({
        domain: tenantsDomainsTable,
        userNumber: usersTable.userNumber,
        employeeNumber: employeesTable.employeeNumber,
        tenantNumber: tenantsTable.tenantNumber,
      })
      .from(tenantsDomainsTable)
      .leftJoin(tenantsTable, eq(tenantsTable.id, tenantsDomainsTable.tenantId))
      .leftJoin(
        usersTable,
        eq(usersTable.id, tenantsDomainsTable.createdByUserId),
      )
      .leftJoin(
        employeesTable,
        eq(employeesTable.id, tenantsDomainsTable.createdByEmployeeId),
      )
      .where(eq(tenantsDomainsTable.tenantId, tenantId))
      .limit(1);

    return result
      ? {
          ...result.domain,
          createdBy: result.userNumber
            ? { type: 'USER', userNumber: result.userNumber }
            : result.employeeNumber
              ? { type: 'EMPLOYEE', employeeNumber: result.employeeNumber }
              : null,
          tenantNumber: result.tenantNumber,
        }
      : null;
  }
}
async function resolveServerForTenant(tenantId) {
  // 1️⃣ own server
  const [server] = await db
    .select()
    .from(serverDetailTable)
    .where(eq(serverDetailTable.tenantId, tenantId))
    .limit(1);

  if (server) return server;

  // 2️⃣ parent fallback
  const [tenant] = await db
    .select({ parentTenantId: tenantsTable.parentTenantId })
    .from(tenantsTable)
    .where(eq(tenantsTable.id, tenantId))
    .limit(1);

  if (!tenant?.parentTenantId) {
    throw ApiError.notFound('No server available for tenant');
  }

  return resolveServerForTenant(tenant.parentTenantId);
}

export { TenantDomainService };
