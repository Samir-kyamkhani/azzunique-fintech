import { and, desc, eq, or } from 'drizzle-orm';
import { employeesTable } from '../models/core/employee.schema.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import { randomUUID } from 'node:crypto';
import { departmentTable } from '../models/core/department.schema.js';
import { tenantsTable } from '../models/core/tenant.schema.js';
import { encrypt, generateNumber, generatePassword } from '../lib/lib.js';
import { eventBus } from '../events/events.js';
import { EVENTS } from '../events/events.constants.js';
import S3Service from '../lib/S3Service.js';

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

    const sentMail = eventBus.emit(EVENTS.EMPLOYEE_CREATED, {
      employeeId: employeePayload.id,
      employeeNumber: employeePayload.employeeNumber,
      email: employeePayload.email,
      password: generatedPassword,
      tenantId: actor.tenantId,
    });

    if (sentMail) {
      await db.insert(employeesTable).values(employeePayload);
    } else {
      throw ApiError.internal('Failed to send employee credentials.');
    }

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

    return {
      ...employee,
      profilePictureUrl: employee.profilePicture
        ? S3Service.buildS3Url(employee.profilePicture)
        : null,
    };
  }

  // GET ALL EMPLOYEES
  static async findAll(query = {}, actor) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const offset = (page - 1) * limit;

    const [tenant] = await db
      .select({ id: tenantsTable.id })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, actor.tenantId))
      .limit(1);

    if (!tenant) {
      throw ApiError.badRequest('Invalid tenant ID');
    }

    const conditions = [eq(employeesTable.tenantId, actor.tenantId)];

    if (query.status) {
      conditions.push(eq(employeesTable.employeeStatus, query.status));
    }

    if (query.search) {
      const searchTerm = `%${query.search}%`;
      conditions.push(
        or(
          like(employeesTable.email, searchTerm),
          like(employeesTable.mobileNumber, searchTerm),
          like(employeesTable.employeeNumber, searchTerm),
        ),
      );
    }

    const rows = await db
      .select()
      .from(employeesTable)
      .where(and(...conditions))
      .orderBy(desc(employeesTable.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      ...rows,
      profilePictureUrl: employee.profilePicture
        ? S3Service.buildS3Url(employee.profilePicture)
        : null,
    };
  }

  // UPDATE EMPLOYEE
  static async update(id, payload, actor, file) {
    if (!id) {
      throw ApiError.badRequest('Employee id is missing');
    }

    const existing = await this.getById(id, actor);

    // ================= PROFILE PICTURE =================
    let profilePicture = existing.profilePicture;

    if (file) {
      const uploaded = await S3Service.upload(file.path, 'employee-profile');

      if (existing.profilePicture) {
        await S3Service.deleteByKey(existing.profilePicture);
      }

      profilePicture = uploaded.key;
    }

    // ================= UPDATE DB =================
    await db
      .update(employeesTable)
      .set({
        ...payload,
        profilePicture,
        employeeStatus: payload.employeeStatus ?? existing.employeeStatus,
        tenantId: actor.tenantId,
        actionReason: payload.actionReason,
        actionedAt: payload.employeeStatus ? new Date() : existing.actionedAt,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(employeesTable.id, id),
          eq(employeesTable.tenantId, actor.tenantId),
        ),
      );

    // ================= STATUS CHANGE EVENT =================
    if (
      payload.employeeStatus &&
      payload.employeeStatus !== existing.employeeStatus
    ) {
      eventBus.emit(EVENTS.EMPLOYEE_STATUS_CHANGED, {
        tenantId: actor.tenantId,
        employeeId: id,
        email: existing.email,
        oldStatus: existing.employeeStatus,
        newStatus: payload.employeeStatus,
        actionReason: payload.actionReason,
      });
    }

    return this.getById(id, actor);
  }

  // DELETE
  static async delete(id, actor) {
    if (!id) {
      throw ApiError.badRequest('Employee id is missing');
    }

    const employee = await this.getById(id, actor);

    if (employee.profilePicture) {
      try {
        await S3Service.deleteByKey(employee.profilePicture);
      } catch (err) {
        console.error(
          'Failed to delete employee profile picture from S3:',
          err.message,
        );
      }
    }

    // 3️⃣ Delete employee record
    await db
      .delete(employeesTable)
      .where(
        and(
          eq(employeesTable.id, id),
          eq(employeesTable.tenantId, actor.tenantId),
        ),
      );

    return true;
  }
}

export { EmployeeService };
