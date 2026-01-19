import { and, desc, eq, like, or, inArray, ne, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';
import {
  encrypt,
  generateNumber,
  generatePassword,
  generatePrefix,
} from '../lib/lib.js';
import { eventBus } from '../events/events.js';
import { EVENTS } from '../events/events.constants.js';
import s3Service from '../lib/S3Service.js';
import { resolvePermissions } from './permission.resolver.js';

import {
  employeesTable,
  employeePermissionTable,
  permissionTable,
  departmentTable,
  tenantsTable,
  smtpConfigTable,
} from '../models/core/index.js';

class EmployeeService {
  //  CREATE EMPLOYEE
  static async create(payload, actor) {
    if (!actor?.tenantId) {
      throw ApiError.badRequest('Tenant context missing');
    }

    // Tenant check
    const [tenant] = await db
      .select({ id: tenantsTable.id })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, actor.tenantId))
      .limit(1);

    if (!tenant) {
      throw ApiError.badRequest('Invalid tenant');
    }

    // Department check
    const [department] = await db
      .select({
        id: departmentTable.id,
        departmentCode: departmentTable.departmentCode,
      })
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

    // SMTP must exist
    const [smtp] = await db
      .select({ id: smtpConfigTable.id })
      .from(smtpConfigTable)
      .where(eq(smtpConfigTable.tenantId, actor.tenantId))
      .limit(1);

    if (!smtp) {
      throw ApiError.badRequest('SMTP must be configured first');
    }

    // Duplicate check
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

    // Credentials
    const password = generatePassword();
    const passwordHash = encrypt(password);

    const employeeId = randomUUID();
    const prefix = generatePrefix(department.departmentCode);

    const employeePayload = {
      id: employeeId,
      employeeNumber: generateNumber(prefix),

      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      departmentId: payload.departmentId,

      passwordHash,
      tenantId: actor.tenantId,

      employeeStatus: 'INACTIVE',
      emailVerifiedAt: new Date(),
      actionReason: 'Kindly contact the administrator to activate your account',

      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,

      createdAt: new Date(),
      updatedAt: new Date(),
      actionedAt: new Date(),
    };

    // DB INSERT FIRST
    await db.insert(employeesTable).values(employeePayload);

    // EVENT AFTER DB SUCCESS
    eventBus.emit(EVENTS.EMPLOYEE_CREATED, {
      employeeId,
      employeeNumber: employeePayload.employeeNumber,
      email: payload.email,
      password,
      tenantId: actor.tenantId,
    });

    return this.findOne(employeeId, actor);
  }

  //  FIND ONE
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
          sql`${employeesTable.deletedAt} IS NULL`,
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

  //  FIND ALL
  static async findAll(query = {}, actor) {
    if (!actor?.tenantId) {
      throw ApiError.badRequest('Tenant context missing');
    }

    let { search = '', status = 'all', limit = 20, page = 1 } = query;
    limit = Number(limit);
    page = Number(page);

    const offset = (page - 1) * limit;

    const conditions = [
      eq(employeesTable.tenantId, actor.tenantId),
      sql`${employeesTable.deletedAt} IS NULL`,
    ];

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
      .select({ total: sql`COUNT(*)`.mapWith(Number) })
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

  //  UPDATE EMPLOYEE (USER-LEVEL SAFE)
  static async update(id, payload, actor, file) {
    const [existing] = await db
      .select({
        id: employeesTable.id,
        tenantId: employeesTable.tenantId,
        email: employeesTable.email,
        mobileNumber: employeesTable.mobileNumber,
        employeeStatus: employeesTable.employeeStatus,
        profilePicture: employeesTable.profilePicture,
      })
      .from(employeesTable)
      .where(eq(employeesTable.id, id))
      .limit(1);

    if (!existing) {
      throw ApiError.notFound('Employee not found');
    }

    if (existing.tenantId !== actor.tenantId) {
      throw ApiError.forbidden('Cross-tenant update denied');
    }

    // Self-status change block
    if (
      actor.type === 'EMPLOYEE' &&
      actor.id === id &&
      payload.employeeStatus
    ) {
      throw ApiError.forbidden('You cannot change your own status');
    }

    // Email duplicate
    if (payload.email && payload.email !== existing.email) {
      const [emailExists] = await db
        .select({ id: employeesTable.id })
        .from(employeesTable)
        .where(
          and(
            eq(employeesTable.email, payload.email),
            eq(employeesTable.tenantId, actor.tenantId),
            ne(employeesTable.id, id),
          ),
        )
        .limit(1);

      if (emailExists) {
        throw ApiError.badRequest('Email already exists');
      }
    }

    // Mobile duplicate
    if (
      payload.mobileNumber &&
      payload.mobileNumber !== existing.mobileNumber
    ) {
      const [mobileExists] = await db
        .select({ id: employeesTable.id })
        .from(employeesTable)
        .where(
          and(
            eq(employeesTable.mobileNumber, payload.mobileNumber),
            eq(employeesTable.tenantId, actor.tenantId),
            ne(employeesTable.id, id),
          ),
        )
        .limit(1);

      if (mobileExists) {
        throw ApiError.badRequest('Mobile number already exists');
      }
    }

    const UPDATABLE = [
      'firstName',
      'lastName',
      'email',
      'mobileNumber',
      'departmentId',
      'employeeStatus',
      'actionReason',
    ];

    const updates = { updatedAt: new Date() };

    for (const key of UPDATABLE) {
      if (payload[key] !== undefined) {
        updates[key] = payload[key];
      }
    }

    // Profile image
    if (file) {
      const uploaded = await s3Service.upload(file.path, 'employee-profile');

      if (existing.profilePicture) {
        await s3Service.deleteByKey(existing.profilePicture);
      }

      updates.profilePicture = uploaded.key;
    }

    // Status event
    if (
      payload.employeeStatus &&
      payload.employeeStatus !== existing.employeeStatus
    ) {
      eventBus.emit(EVENTS.EMPLOYEE_STATUS_CHANGED, {
        tenantId: actor.tenantId,
        employeeId: id,
        oldStatus: existing.employeeStatus,
        newStatus: payload.employeeStatus,
        actionReason: payload.actionReason || null,
      });

      updates.actionedAt = new Date();
    }

    await db
      .update(employeesTable)
      .set(updates)
      .where(eq(employeesTable.id, id));

    return this.findOne(id, actor);
  }

  //  SOFT DELETE
  static async delete(id, actor) {
    const employee = await this.findOne(id, actor);

    if (employee.profilePicture) {
      await s3Service.deleteByKey(employee.profilePicture).catch(() => {});
    }

    await db
      .update(employeesTable)
      .set({
        deletedAt: new Date(),
        employeeStatus: 'DELETED',
      })
      .where(
        and(
          eq(employeesTable.id, id),
          eq(employeesTable.tenantId, actor.tenantId),
        ),
      );

    return true;
  }

  //  ASSIGN PERMISSIONS (TRANSACTION SAFE)
  static async assignPermissions(employeeId, permissions, actor) {
    if (!actor?.tenantId || !actor?.id) {
      throw ApiError.unauthorized('Invalid actor context');
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw ApiError.badRequest('Permissions array is required');
    }

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

    if (actor.type === 'EMPLOYEE' && actor.id === employeeId) {
      throw ApiError.forbidden('You cannot modify your own permissions');
    }

    const permissionIds = permissions.map((p) => p.permissionId);

    const existingPermissions = await db
      .select({ id: permissionTable.id })
      .from(permissionTable)
      .where(inArray(permissionTable.id, permissionIds));

    if (existingPermissions.length !== permissionIds.length) {
      throw ApiError.badRequest('Invalid permission IDs');
    }

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

    await db.transaction(async (tx) => {
      await tx
        .delete(employeePermissionTable)
        .where(eq(employeePermissionTable.employeeId, employeeId));

      await tx.insert(employeePermissionTable).values(
        permissions.map((p) => ({
          id: randomUUID(),
          employeeId,
          permissionId: p.permissionId,
          effect: p.effect ?? 'ALLOW',
        })),
      );
    });

    return true;
  }
}

export { EmployeeService };
