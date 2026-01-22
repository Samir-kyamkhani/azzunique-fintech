import { and, eq, sql } from 'drizzle-orm';
import crypto from 'node:crypto';

import {
  serverDetailTable,
  employeesTable,
  usersTable,
  tenantsTable,
} from '../models/core/index.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';

class ServerDetailService {
  //  GET SERVER DETAIL BY TENANT
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
      .orderBy(serverDetailTable.createdAt)
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

  //  UPSERT SERVER DETAIL (TENANT SAFE)
  static async upsert(payload = {}, actor) {
    if (!actor?.tenantId || !actor?.type) {
      throw ApiError.unauthorized('Invalid actor');
    }

    if (!payload.recordType || !payload.hostname || !payload.value) {
      throw ApiError.badRequest('Missing required server detail fields');
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
          sql`${serverDetailTable.deletedAt} IS NULL`,
        ),
      )
      .limit(1);

    /* ================= UPDATE ================= */
    if (existingRecord) {
      const updatedFields = {};

      if (
        payload.value !== undefined &&
        payload.value !== existingRecord.value
      ) {
        updatedFields.value = payload.value;
      }

      if (payload.status && payload.status !== existingRecord.status) {
        updatedFields.status = payload.status;
      }

      if (Object.keys(updatedFields).length === 0) {
        return { id: existingRecord.id };
      }

      updatedFields.updatedAt = new Date();

      await db
        .update(serverDetailTable)
        .set(updatedFields)
        .where(
          and(
            eq(serverDetailTable.id, existingRecord.id),
            eq(serverDetailTable.tenantId, actor.tenantId),
          ),
        );

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

  //  GET ALL SERVER DETAILS (TENANT SAFE)
  static async getAll(actor) {
    if (!actor?.tenantId) {
      throw ApiError.unauthorized('Invalid actor');
    }

    const rows = await db
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
      .where(
        and(
          eq(serverDetailTable.tenantId, actor.tenantId),
          sql`${serverDetailTable.deletedAt} IS NULL`,
        ),
      )
      .orderBy(serverDetailTable.createdAt);

    if (!rows.length) {
      return [];
    }

    return rows.map((row) => ({
      ...row.server,
      createdBy: row.userNumber
        ? {
            type: 'USER',
            userNumber: row.userNumber,
          }
        : row.employeeNumber
          ? {
              type: 'EMPLOYEE',
              employeeNumber: row.employeeNumber,
            }
          : null,
      tenantNumber: row.tenantNumber,
    }));
  }

  //  SOFT DELETE SERVER DETAIL (OPTIONAL BUT SAFE)
  static async delete(id, actor) {
    if (!actor?.tenantId || !actor?.isTenantOwner) {
      throw ApiError.forbidden('Only tenant owner can delete server details');
    }

    const [existing] = await db
      .select({ id: serverDetailTable.id })
      .from(serverDetailTable)
      .where(
        and(
          eq(serverDetailTable.id, id),
          eq(serverDetailTable.tenantId, actor.tenantId),
          sql`${serverDetailTable.deletedAt} IS NULL`,
        ),
      )
      .limit(1);

    if (!existing) {
      throw ApiError.notFound('Server detail not found');
    }

    await db
      .update(serverDetailTable)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(serverDetailTable.id, id));

    return true;
  }
}

export { ServerDetailService };
