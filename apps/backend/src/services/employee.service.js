import { and, count, desc, eq, like, or, inArray } from 'drizzle-orm';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import { randomUUID } from 'node:crypto';
import { encrypt, generateNumber, generatePassword } from '../lib/lib.js';
import { eventBus } from '../events/events.js';
import { EVENTS } from '../events/events.constants.js';
import s3Service from '../lib/S3Service.js';
import {
  employeesTable,
  permissionTable,
  departmentTable,
  tenantsTable,
  smtpConfigTable,
} from '../models/core/index.js';
import { resolvePermissions } from './permission.resolver.js';

class EmployeeService {
  static async create(payload, actor) {
    if (!actor?.tenantId) {
      throw ApiError.badRequest('Tenant context missing');
    }

    const [tenant] = await db
      .select({ id: tenantsTable.id })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, actor.tenantId))
      .limit(1);

    if (!tenant) {
      throw ApiError.badRequest('Invalid tenant');
    }

    const [department] = await db
      .select({ id: departmentTable.id })
      .from(departmentTable)
      .where(
        and(
          eq(departmentTable.id, payload.departmentId),
          eq(departmentTable.tenantId, actor.tenantId),
        ),
      )
      .limit(1);

    if (!department) {
      throw ApiError.badRequest('Invalid department');
    }

    const [smtp] = await db
      .select({ id: smtpConfigTable.id })
      .from(smtpConfigTable)
      .where(eq(smtpConfigTable.tenantId, actor.tenantId))
      .limit(1);

    if (!smtp) {
      throw ApiError.badRequest('SMTP must be configured first');
    }

    const [existing] = await db
      .select({ id: employeesTable.id })
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.tenantId, actor.tenantId),
          or(
            eq(employeesTable.email, payload.email),
            eq(employeesTable.mobileNumber, payload.mobileNumber),
          ),
        ),
      )
      .limit(1);

    if (existing) {
      throw ApiError.conflict('Employee already exists');
    }

    const password = generatePassword();
    const passwordHash = encrypt(password);

    const employeeId = randomUUID();

    const employeePayload = {
      id: employeeId,
      employeeNumber: generateNumber('EMP'),
      ...payload,
      passwordHash,
      employeeStatus: 'INACTIVE',
      tenantId: actor.tenantId,
      emailVerifiedAt: new Date(),
      actionReason: 'Kindly contact the administrator to activate your account',
      actionedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const sent = eventBus.emit(EVENTS.EMPLOYEE_CREATED, {
      employeeId,
      employeeNumber: employeePayload.employeeNumber,
      email: payload.email,
      password,
      tenantId: actor.tenantId,
    });

    if (!sent) {
      throw ApiError.internal('Failed to send employee credentials');
    }

    await db.insert(employeesTable).values(employeePayload);

    return this.findOne(employeeId, actor);
  }

  static async findOne(id, actor) {
    if (!id || !actor?.tenantId) {
      throw ApiError.badRequest('Invalid request');
    }

    const [row] = await db
      .select()
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.id, id),
          eq(employeesTable.tenantId, actor.tenantId),
        ),
      )
      .limit(1);

    if (!row) {
      throw ApiError.notFound('Employee not found');
    }

    return {
      ...row,
      profilePictureUrl: row.profilePicture
        ? s3Service.buildS3Url(row.profilePicture)
        : null,
    };
  }

  static async findAll(query = {}, actor) {
    if (!actor?.tenantId) {
      throw ApiError.badRequest('Tenant context missing');
    }

    let { search = '', status = 'all', limit = 20, page = 1 } = query;
    limit = Number(limit);
    page = Number(page);

    const offset = (page - 1) * limit;
    const conditions = [eq(employeesTable.tenantId, actor.tenantId)];

    if (search) {
      const term = `%${search}%`;
      conditions.push(
        or(
          like(employeesTable.firstName, term),
          like(employeesTable.lastName, term),
          like(employeesTable.email, term),
          like(employeesTable.employeeNumber, term),
        ),
      );
    }

    if (status !== 'all') {
      conditions.push(eq(employeesTable.employeeStatus, status));
    }

    const data = await db
      .select()
      .from(employeesTable)
      .where(and(...conditions))
      .orderBy(desc(employeesTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(employeesTable)
      .where(and(...conditions));

    return {
      data: data.map((e) => ({
        ...e,
        profilePictureUrl: e.profilePicture
          ? s3Service.buildS3Url(e.profilePicture)
          : null,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async update(id, payload, actor, file) {
    const existing = await this.findOne(id, actor);

    const UPDATABLE = [
      'firstName',
      'lastName',
      'email',
      'mobileNumber',
      'departmentId',
      'employeeStatus',
      'actionReason',
    ];

    const updates = {};
    for (const key of UPDATABLE) {
      if (payload[key] !== undefined) updates[key] = payload[key];
    }

    let profilePicture = existing.profilePicture;

    if (file) {
      const uploaded = await s3Service.upload(file.path, 'employee-profile');
      profilePicture = uploaded.key;

      if (existing.profilePicture) {
        await s3Service.deleteByKey(existing.profilePicture);
      }
    }

    await db
      .update(employeesTable)
      .set({
        ...updates,
        profilePicture,
        updatedAt: new Date(),
        actionedAt: updates.employeeStatus ? new Date() : existing.actionedAt,
      })
      .where(eq(employeesTable.id, id));

    if (
      updates.employeeStatus &&
      updates.employeeStatus !== existing.employeeStatus
    ) {
      eventBus.emit(EVENTS.EMPLOYEE_STATUS_CHANGED, {
        tenantId: actor.tenantId,
        employeeId: id,
        oldStatus: existing.employeeStatus,
        newStatus: updates.employeeStatus,
        actionReason: updates.actionReason,
      });
    }

    return this.findOne(id, actor);
  }

  static async delete(id, actor) {
    const employee = await this.findOne(id, actor);

    if (employee.profilePicture) {
      await s3Service.deleteByKey(employee.profilePicture).catch(() => {});
    }

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

  static async assignPermissions(employeeId, permissions, actor) {
    if (!actor?.tenantId || !actor?.id || !actor?.type) {
      throw ApiError.unauthorized('Invalid actor context');
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw ApiError.badRequest('Permissions array is required');
    }

    // 1️⃣ Target employee (TENANT SAFE)
    const [employee] = await db
      .select({
        id: employeesTable.id,
        tenantId: employeesTable.tenantId,
      })
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.id, employeeId),
          eq(employeesTable.tenantId, actor.tenantId),
        ),
      )
      .limit(1);

    if (!employee) {
      throw ApiError.notFound('Employee not found');
    }

    // 2️⃣ Optional: self-permission modification block
    if (actor.type === 'EMPLOYEE' && actor.id === employeeId) {
      throw ApiError.forbidden('You cannot modify your own permissions');
    }

    // 3️⃣ Collect permission IDs
    const permissionIds = permissions.map((p) => p.permissionId);

    // 4️⃣ Validate permission IDs
    const existing = await db
      .select({ id: permissionTable.id })
      .from(permissionTable)
      .where(inArray(permissionTable.id, permissionIds));

    if (existing.length !== permissionIds.length) {
      throw ApiError.badRequest('Invalid permission IDs');
    }

    // 5️⃣ Actor permission enforcement (CRITICAL)
    const actorPermissions = await resolvePermissions(actor);

    if (!actorPermissions.includes('*')) {
      const forbidden = permissionIds.filter(
        (pid) => !actorPermissions.includes(pid),
      );

      if (forbidden.length) {
        throw ApiError.forbidden(
          'You cannot assign permissions you do not have',
        );
      }
    }

    // 6️⃣ Replace permissions (CLEAR → INSERT)
    await db
      .delete(employeePermissionTable)
      .where(eq(employeePermissionTable.employeeId, employeeId));

    await db.insert(employeePermissionTable).values(
      permissions.map((p) => ({
        id: randomUUID(),
        employeeId,
        permissionId: p.permissionId,
        effect: p.effect ?? 'ALLOW', // ALLOW | DENY
      })),
    );

    return true;
  }
}

export { EmployeeService };
