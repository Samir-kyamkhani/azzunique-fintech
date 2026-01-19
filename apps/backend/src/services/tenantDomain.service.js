import { and, eq, sql } from 'drizzle-orm';
import {
  tenantsDomainsTable,
  tenantsTable,
  usersTable,
  employeesTable,
} from '../models/core/index.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import crypto from 'node:crypto';

class TenantDomainService {
  static async getByTenant(actor) {
    if (!actor?.tenantId) {
      throw ApiError.unauthorized('Invalid actor');
    }

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
      .where(
        and(
          eq(tenantsDomainsTable.tenantId, actor.tenantId),
          sql`${tenantsDomainsTable.deletedAt} IS NULL`,
        ),
      )
      .limit(1);

    if (!result) {
      throw ApiError.notFound('Domain not found');
    }

    return {
      ...result.domain,
      createdBy: result.userNumber
        ? { type: 'USER', userNumber: result.userNumber }
        : result.employeeNumber
          ? { type: 'EMPLOYEE', employeeNumber: result.employeeNumber }
          : null,
      tenantNumber: result.tenantNumber,
    };
  }

  static async upsert(payload, actor) {
    if (!actor?.tenantId) {
      throw ApiError.unauthorized('Invalid actor');
    }

    const domainName = payload.domainName?.trim().toLowerCase();
    if (!domainName) {
      throw ApiError.badRequest('Domain name required');
    }

    const [existing] = await db
      .select()
      .from(tenantsDomainsTable)
      .where(
        and(
          eq(tenantsDomainsTable.tenantId, actor.tenantId),
          sql`${tenantsDomainsTable.deletedAt} IS NULL`,
        ),
      )
      .limit(1);

    const now = new Date();

    if (existing) {
      await db
        .update(tenantsDomainsTable)
        .set({
          domainName,
          serverDetailId: payload.serverDetailId,
          status: payload.status ?? existing.status,
          actionReason: payload.actionReason ?? null,
          actionedAt:
            payload.status && payload.status !== 'ACTIVE' ? now : null,
          updatedAt: now,
        })
        .where(eq(tenantsDomainsTable.id, existing.id));

      return { id: existing.id };
    }

    const id = crypto.randomUUID();

    await db.insert(tenantsDomainsTable).values({
      id,
      tenantId: actor.tenantId,
      domainName,
      serverDetailId: payload.serverDetailId,
      status: payload.status ?? 'ACTIVE',
      createdByUserId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  }
}

export { TenantDomainService };
