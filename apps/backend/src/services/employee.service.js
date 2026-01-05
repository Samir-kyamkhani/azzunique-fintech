import { and, eq, or } from 'drizzle-orm';
import { employeesTable } from '../models/core/employee.schema.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import { randomUUID } from 'node:crypto';
import { departmentTable } from '../models/core/department.schema.js';
import { tenantsTable } from '../models/core/tenant.schema.js';
import { encrypt, generateNumber, generatePassword } from '../lib/lib.js';

class EmployeeService {
  // CREATE EMPLOYEE
  static async create(payload, actor) {
    const [tenant] = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, actor.tenantId))
      .limit(1);

    if (!tenant) {
      throw ApiError.badRequest('Invalid tenant ID');
    }

    const [department] = await db
      .select()
      .from(departmentTable)
      .where(eq(departmentTable.id, payload.departmentId))
      .limit(1);

    if (!department) {
      throw ApiError.badRequest('Invalid department ID');
    }

    const [existing] = await db
      .select()
      .from(employeesTable)
      .where(
        and(
          or(
            eq(employeesTable.email, payload.email),
            eq(employeesTable.mobileNumber, payload.mobileNumber),
          ),
          eq(employeesTable.tenantId, actor.tenantId),
        ),
      )
      .limit(1);

    if (existing) {
      throw ApiError.conflict(
        'User with this email or mobile number already exists',
      );
    }

    const generatedPassword = generatePassword();
    const passwordHash = encrypt(generatedPassword);

    console.log(generatedPassword);

    const employeePayload = {
      id: randomUUID(),
      employeeNumber: generateNumber('EMP'),
      ...payload,
      passwordHash,
      employeeStatus: 'INACTIVE',
      tenantId: actor.tenantId,
      emailVerifiedAt: new Date(),
      actionReason:
        'Kindly contact the administrator to have your account activated.',
      actionedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Send credentials email

    await db.insert(employeesTable).values(employeePayload);

    return this.getById(employeePayload.id, actor);
  }

  // GET EMPLOYEE BY ID
  static async getById(id, actor) {
    if (!id) {
      throw ApiError.badRequest('Employee id missing');
    }

    if (!actor.tenantId) {
      throw ApiError.badRequest('Tenant id missing');
    }

    const [employee] = await db
      .select()
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.id, id),
          eq(employeesTable.tenantId, actor.tenantId),
        ),
      )
      .limit(1);

    if (!employee) {
      throw ApiError.notFound('Employee not found');
    }

    return employee;
  }

  // GET ALL EMPLOYEES
  static async getAll(query, actor) {
    if (!actor.tenantId) {
      throw ApiError.badRequest('Tenant ID Missing');
    }

    return db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.tenantId, tenantId))
      .where(eq(employeesTable.employeeStatus, 'ACTIVE'));
  }

  // UPDATE EMPLOYEE
  static async update(id, payload, actor) {
    if (!id) {
      throw ApiError.badRequest('Employee id is missing');
    }

    await this.getById(id);
    // upload s3

    await db
      .update(employeesTable)
      .set({
        ...payload,
        employeeStatus: payload.employeeStatus,
        tenantId: actor.tenantId,
        actionReason: payload.actionReason,
        actionedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(employeesTable.id, id));

    return this.getById(id);
  }

  // DELETE
  static async delete(id) {
    const employee = await this.getById(id);

    await db.delete(employeesTable).where(eq(employeesTable.id, id));

    return true;
  }
}

export { EmployeeService };
