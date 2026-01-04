import { and, eq } from 'drizzle-orm';
import { departmentTable } from '../models/core/department.schema.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import crypto from 'crypto';

class DepartmentService {
  // CREATE DEPARTMENT
  static async create(payload, actor) {
    // Check if department already exists for this tenant with the same department code
    if (!actor.tenantId) {
      throw ApiError.badRequest('Tenant context is missing');
    }

    const [existing] = await db
      .select()
      .from(departmentTable)
      .where(
        and(
          eq(
            departmentTable.departmentCode,
            payload.departmentCode.toUpperCase(),
          ),
          eq(departmentTable.tenantId, actor.tenantId),
        ),
      )
      .limit(1);

    if (existing) {
      throw ApiError.conflict('department code already in this tenant');
    }

    const id = crypto.randomUUID();
    const normalizedCode = payload.departmentCode.toUpperCase();
    await db.insert(departmentTable).values({
      id,
      ...payload,
      tenantId: actor.tenantId,
      departmentCode: normalizedCode,
      createdByUserId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      createdAt: new Date(),
    });

    return this.getById(id);
  }

  // GET DEPARTMENT BY ID
  static async getById(id) {
    const [department] = await db
      .select()
      .from(departmentTable)
      .where(eq(departmentTable.id, id))
      .limit(1);

    if (!department) {
      throw ApiError.notFound('Department not found');
    }

    return department;
  }

  // GET ALL DEPARTMENTS
  static async getAll(actor) {
    if (!actor.tenantId) {
      throw ApiError.badRequest('Tenant context is missing');
    }

    return db
      .select()
      .from(departmentTable)
      .where(eq(departmentTable.tenantId, actor.tenantId));
  }

  // UPDATE DEPARTMENT
  static async update(id, payload) {
    const department = await this.getById(id);

    await db
      .update(departmentTable)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(departmentTable.id, id));

    return this.getById(id);
  }

  // DELETE
  static async delete(id) {
    const department = await this.getById(id);

    await db.delete(departmentTable).where(eq(departmentTable.id, id));

    return this.getById(id);
  }
}

export { DepartmentService };
