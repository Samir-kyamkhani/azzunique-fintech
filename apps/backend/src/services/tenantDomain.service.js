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
  static async upsert(payload, actor) {
    // 1. actor validation
    if (!actor) {
      throw ApiError.unauthorized('Invalid actor');
    }

    // 2. tenantId resolution (payload > actor)
    const tenantId = payload?.tenantId ?? actor?.tenantId;
    if (!tenantId) {
      throw ApiError.badRequest('TenantId missing');
    }

    // 3. domain validation
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
      await db
        .update(tenantsDomainsTable)
        .set({
          serverDetailId: payload.serverDetailId ?? existing.serverDetailId,
          status: payload.status ?? existing.status,
          actionReason: payload.actionReason ?? existing.actionReason,
          actionedAt:
            payload.status && payload.status !== 'ACTIVE'
              ? now
              : existing.actionedAt,
          updatedAt: now,
        })
        .where(eq(tenantsDomainsTable.id, existing.id));

      return { id: existing.id, updated: true };
    }

    const id = crypto.randomUUID();

    await db.insert(tenantsDomainsTable).values({
      id,
      tenantId,
      domainName,
      serverDetailId: payload.serverDetailId ?? null,
      status: payload.status ?? 'ACTIVE',
      actionReason: payload.actionReason ?? null,
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
      .where(and(eq(tenantsDomainsTable.tenantId, tenantId)))
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

export { TenantDomainService };
