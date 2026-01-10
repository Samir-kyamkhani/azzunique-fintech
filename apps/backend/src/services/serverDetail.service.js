import { and, eq } from 'drizzle-orm';
import { serverDetailTable } from '../models/core/serverDetails.schema.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import crypto from 'node:crypto';
import { employeesTable } from '../models/core/employee.schema.js';
import { usersTable } from '../models/core/user.schema.js';
import { tenantsTable } from '../models/core/tenant.schema.js';

class ServerDetailService {
  // GET BY ID
  static async getByTenantId(actor) {
    if (!actor?.tenantId) {
      throw ApiError.unauthorized('Invalid actor');
    }

    const [result] = await db
      .select({
        server: serverDetailTable,

        userNumber: usersTable.userNumber,
        employeeNumber: employeesTable.employeeNumber,
        tenantNumber: tenantsTable.tenantNumber,
      })
      .from(serverDetailTable)
      .leftJoin(tenantsTable, eq(tenantsTable.id, serverDetailTable.tenantId))
      .leftJoin(
        usersTable,
        eq(usersTable.id, serverDetailTable.createdByUserId),
      )
      .leftJoin(
        employeesTable,
        eq(employeesTable.id, serverDetailTable.createdByEmployeeId),
      )
      .where(eq(serverDetailTable.tenantId, actor.tenantId))
      .limit(1);

    if (!result) {
      throw ApiError.notFound('Server detail not found');
    }

    return {
      ...result.server,
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

  // ================= UPSERT SERVER DETAIL =================
  static async upsert(payload = {}, actor) {
    if (!actor?.tenantId) {
      throw ApiError.unauthorized('Invalid actor');
    }

    const normalizedHostname = payload.hostname.trim().toLowerCase();

    const [existingRecord] = await db
      .select()
      .from(serverDetailTable)
      .where(
        and(
          eq(serverDetailTable.tenantId, actor.tenantId),
          eq(serverDetailTable.recordType, payload.recordType),
          eq(serverDetailTable.hostname, normalizedHostname),
        ),
      )
      .limit(1);

    /* ================= UPDATE ================= */
    if (existingRecord) {
      const updatedFields = {};

      if (payload.value && payload.value !== existingRecord.value) {
        updatedFields.value = payload.value;
      }

      if (payload.status && payload.status !== existingRecord.status) {
        updatedFields.status = payload.status;
      }

      if (Object.keys(updatedFields).length === 0) {
        return {
          id: existingRecord.id,
        };
      }

      updatedFields.updatedAt = new Date();

      await db
        .update(serverDetailTable)
        .set(updatedFields)
        .where(eq(serverDetailTable.id, existingRecord.id));

      return {
        id: existingRecord.id,
        ...updatedFields,
      };
    }

    /* ================= CREATE ================= */
    const id = crypto.randomUUID();

    const data = {
      id,
      tenantId: actor.tenantId,
      recordType: payload.recordType,
      hostname: normalizedHostname,
      value: payload.value,
      status: payload.status ?? 'ACTIVE',
      createdByUserId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(serverDetailTable).values(data);

    return data;
  }
}

export { ServerDetailService };
