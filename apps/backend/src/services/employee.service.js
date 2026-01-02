import { eq } from 'drizzle-orm';
import { employeesTable } from '../models/core/employee.schema.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import crypto from 'crypto';

class EmployeeService {
  // CREATE EMPLOYEE
  static async create(payload) {
    const [existing] = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.email, payload.email))
      .limit(1);

    if (existing) {
      throw ApiError.conflict('Employee with this email already exists');
    }

    const id = crypto.randomUUID();
    await db.insert(employeesTable).values({
      id,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.getById(id);
  }

  // GET EMPLOYEE BY ID
  static async getById(id) {
    const [employee] = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.id, id))
      .limit(1);

    if (!employee) {
      throw ApiError.notFound('Employee not found');
    }

    return employee;
  }

  // GET ALL EMPLOYEES
  static async getAll(tenantId) {
    return db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.tenantId, tenantId))
      .where(eq(employeesTable.employeeStatus, 'ACTIVE'));
  }

  // UPDATE EMPLOYEE
  static async update(id, payload) {
    const employee = await this.getById(id);

    await db
      .update(employeesTable)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(employeesTable.id, id));

    return this.getById(id);
  }

  // STATUS CHANGE
  static async updateStatus(id, payload) {
    const employee = await this.getById(id);

    await db
      .update(employeesTable)
      .set({
        employeeStatus: payload.employeeStatus,
        actionReason:
          payload.employeeStatus === 'ACTIVE' ? null : payload.actionReason,
        actionedAt: payload.employeeStatus === 'ACTIVE' ? null : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(employeesTable.id, id));

    return this.getById(id);
  }

  // HARD DELETE
  static async hardDelete(id) {
    const employee = await this.getById(id);

    await db.delete(employeesTable).where(eq(employeesTable.id, id));

    return true;
  }
}

export { EmployeeService };
