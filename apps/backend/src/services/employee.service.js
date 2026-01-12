import { and, count, desc, eq, like, or, sql } from 'drizzle-orm';
import { employeesTable } from '../models/core/employee.schema.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import { randomUUID } from 'node:crypto';
import { departmentTable } from '../models/core/department.schema.js';
import { tenantsTable } from '../models/core/tenant.schema.js';
import { encrypt, generateNumber, generatePassword } from '../lib/lib.js';
import { eventBus } from '../events/events.js';
import { EVENTS } from '../events/events.constants.js';
import s3Service from '../lib/S3Service.js';
import { smtpConfigTable } from '../models/core/smtpConfig.schema.js';

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

    const [smtp] = await db
      .select()
      .from(smtpConfigTable)
      .where(eq(smtpConfigTable.tenantId, actor.tenantId))
      .limit(1);

    if (!smtp) {
      throw ApiError.badRequest(
        'Before creating an employee, please ensure that SMTP is configured.',
      );
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
        ? s3Service.buildS3Url(employee.profilePicture)
        : null,
    };
  }

  // GET ALL EMPLOYEES (Aligned with getAllChildren)
  static async findAll(query = {}, actor) {
    if (!actor?.tenantId) {
      throw ApiError.badRequest('Tenant context missing');
    }

    let { search = '', status = 'all', limit = 20, page = 1 } = query;

    limit = Number(limit);
    page = Number(page);
    search = search.trim();

    const offset = (page - 1) * limit;

    /* ================= CONDITIONS ================= */
    const conditions = [eq(employeesTable.tenantId, actor.tenantId)];

    if (search.length > 0) {
      conditions.push(
        or(
          like(employeesTable.firstName, `%${search}%`),
          like(employeesTable.lastName, `%${search}%`),
          like(employeesTable.email, `%${search}%`),
          like(employeesTable.mobileNumber, `%${search}%`),
          like(employeesTable.employeeNumber, `%${search}%`),
        ),
      );
    }

    if (status && status !== 'all' && status !== 'undefined') {
      conditions.push(eq(employeesTable.employeeStatus, status));
    }

    /* ================= DATA ================= */
    const data = await db
      .select()
      .from(employeesTable)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(employeesTable.createdAt));

    /* ================= COUNT ================= */
    const [{ total }] = await db
      .select({ total: count() })
      .from(employeesTable)
      .where(and(...conditions));

    /* ================= NORMALIZE ================= */
    const rows = data.map((emp) => ({
      ...emp,
      profilePictureUrl: emp.profilePicture
        ? s3Service.buildS3Url(emp.profilePicture)
        : null,
    }));

    return {
      data: rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // UPDATE EMPLOYEE
  static async update(id, payload, actor, file) {
    const existing = await this.getById(id, actor);

    // ================= PROFILE PICTURE =================
    let profilePicture = existing.profilePictureUrl;

    if (file) {
      const uploaded = await s3Service.upload(file.path, 'employee-profile');

      if (existing.profilePictureUrl) {
        await s3Service.deleteByKey(existing.profilePictureUrl);
      }

      profilePicture = uploaded.key;
    }

    // ================= DEPARTMENT VALIDATION =================
    let departmentId = existing.departmentId;

    if (payload.departmentId) {
      const [department] = await db
        .select()
        .from(departmentTable)
        .where(
          and(
            eq(departmentTable.id, payload.departmentId),
            eq(departmentTable.tenantId, actor.tenantId),
          ),
        )
        .limit(1);

      if (!department) {
        throw ApiError.badRequest('Invalid department ID');
      }

      departmentId = payload.departmentId;
    }

    // ================= UPDATE DB =================
    await db
      .update(employeesTable)
      .set({
        ...payload,
        profilePicture,
        departmentId,
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
    const employee = await this.getById(id, actor);

    if (employee.profilePicture) {
      try {
        await s3Service.deleteByKey(employee.profilePicture);
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
