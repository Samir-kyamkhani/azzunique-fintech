import { and, eq } from 'drizzle-orm';
import { tenantsDomainsTable } from '../models/core/tenantDomain.schema.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import { tenantsTable } from '../models/core/tenant.schema.js';
import { usersTable } from '../models/core/user.schema.js';
import { employeesTable } from '../models/core/employee.schema.js';

class TenantDomainService {
  // GET BY ID
  static async getById(id) {
    const [domain] = await db
      .select()
      .from(tenantsDomainsTable)
      .where(eq(tenantsDomainsTable.id, id))
      .limit(1);

    if (!domain) {
      throw ApiError.notFound('Domain not found');
    }

    return domain;
  }

  // ================= GET TENANT ID DOMAIN =================

  static async getByTenantId(tenantId) {
    if (!tenantId) {
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
      .where(eq(tenantsDomainsTable.tenantId, tenantId))
      .limit(1);

    if (!result) {
      throw ApiError.notFound('Domain not found');
    }

    return {
      ...result.domain,

      createdBy: result.userNumber
        ? {
            type: 'USER',
            userNumber: result.userNumber,
          }
        : result.employeeNumber
          ? {
              type: 'EMPLOYEE',
              employeeNumber: result.employeeNumber,
            }
          : null,

      tenantNumber: result.tenantNumber,
    };
  }

  // ================= UPSERT TENANT DOMAIN =================
  static async upsertByTenant(payload = {}, actor) {
    const tenantId = payload.tenantId;
    const now = new Date();

    const normalizedDomain = payload.domainName
      ? payload.domainName.trim().toLowerCase()
      : null;

    const [existingRecord] = await db
      .select()
      .from(tenantsDomainsTable)
      .where(eq(tenantsDomainsTable.tenantId, tenantId))
      .limit(1);

    /* ================= UPDATE ================= */
    if (existingRecord) {
      const updatedFields = {};

      if (normalizedDomain && normalizedDomain !== existingRecord.domainName) {
        updatedFields.domainName = normalizedDomain;
      }

      if (
        payload.serverDetailId &&
        payload.serverDetailId !== existingRecord.serverDetailId
      ) {
        updatedFields.serverDetailId = payload.serverDetailId;
      }

      if (payload.status && payload.status !== existingRecord.status) {
        updatedFields.status = payload.status;

        if (payload.status !== 'ACTIVE') {
          updatedFields.actionReason = payload.actionReason ?? null;
          updatedFields.actionedAt = now;
        } else {
          updatedFields.actionReason = null;
          updatedFields.actionedAt = null;
        }
      }

      if (Object.keys(updatedFields).length === 0) {
        return {
          id: existingRecord.id,
        };
      }

      updatedFields.updatedAt = now;

      await db
        .update(tenantsDomainsTable)
        .set(updatedFields)
        .where(eq(tenantsDomainsTable.id, existingRecord.id));

      return {
        id: existingRecord.id,
        ...updatedFields,
      };
    }

    /* ================= CREATE ================= */
    const id = crypto.randomUUID();

    const data = {
      id,
      tenantId,
      domainName: normalizedDomain,
      serverDetailId: payload.serverDetailId,
      status: payload.status ?? 'ACTIVE',

      actionReason:
        payload.status && payload.status !== 'ACTIVE'
          ? payload.actionReason
          : null,

      actionedAt: payload.status && payload.status !== 'ACTIVE' ? now : null,

      createdByUserId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,

      createdAt: now,
      updatedAt: now,
    };

    await db.insert(tenantsDomainsTable).values(data);

    return data;
  }
}

export { TenantDomainService };
