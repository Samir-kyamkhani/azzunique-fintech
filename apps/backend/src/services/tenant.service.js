import { and, count, desc, eq, like, or } from 'drizzle-orm';
import { tenantsTable } from '../models/core/tenant.schema.js';
import { ApiError } from '../lib/ApiError.js';
import { db } from '../database/core/core-db.js';
import { generateNumber } from '../lib/lib.js';
import { employeesTable } from '../models/core/employee.schema.js';

class TenantService {
  // ================= CREATE =================
  static async create(payload, actor) {
    if (!actor.isTenantOwner) {
      throw ApiError.forbidden('Only tenant owner can create tenants');
    }

    // 1️⃣ Actor tenant fetch
    const [currentTenant] = await db
      .select({
        id: tenantsTable.id,
        parentTenantId: tenantsTable.parentTenantId,
        userType: tenantsTable.userType,
      })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, actor.tenantId))
      .limit(1);

    if (!currentTenant) {
      throw ApiError.notFound('Actor tenant not found');
    }

    // 2️⃣ Hierarchy check
    const allowedChildMap = {
      AZZUNIQUE: ['RESELLER'],
      RESELLER: ['WHITELABEL'],
      WHITELABEL: [],
    };

    if (!allowedChildMap[currentTenant.userType]?.includes(payload.userType)) {
      throw ApiError.forbidden(
        `You cannot create ${payload.userType} under ${currentTenant.userType}`,
      );
    }

    if (
      currentTenant.userType === 'AZZUNIQUE' &&
      payload.userType === 'WHITELABEL'
    ) {
      throw ApiError.forbidden(
        'AZZUNIQUE cannot directly create WHITELABEL. Create RESELLER first.',
      );
    }

    const scopeTenantId = currentTenant.id;

    // 4️⃣ Duplicate tenant check
    const [existingTenant] = await db
      .select({ id: tenantsTable.id })
      .from(tenantsTable)
      .where(
        and(
          eq(tenantsTable.parentTenantId, scopeTenantId),
          or(
            eq(tenantsTable.tenantEmail, payload.tenantEmail),
            eq(tenantsTable.tenantMobileNumber, payload.tenantMobileNumber),
            eq(tenantsTable.tenantWhatsapp, payload.tenantWhatsapp),
          ),
        ),
      )
      .limit(1);

    if (existingTenant) {
      throw ApiError.conflict(
        'Tenant with this email, mobile number or whatsapp already exists',
      );
    }

    // 5️⃣ AZZUNIQUE singleton
    if (payload.userType === 'AZZUNIQUE') {
      const [azz] = await db
        .select({ id: tenantsTable.id })
        .from(tenantsTable)
        .where(eq(tenantsTable.userType, 'AZZUNIQUE'))
        .limit(1);

      if (azz) {
        throw ApiError.conflict('There can be only one AZZUNIQUE tenant');
      }
    }

    // 6️⃣ INSERT
    await db.insert(tenantsTable).values({
      ...payload,
      tenantNumber: generateNumber('TNT'),
      parentTenantId: scopeTenantId,
      createdByUserId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      actionedAt: ['INACTIVE', 'SUSPENDED', 'DELETED'].includes(
        payload.tenantStatus,
      )
        ? new Date()
        : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 7️⃣ RETURN
    const [insertedTenant] = await db
      .select()
      .from(tenantsTable)
      .where(
        and(
          eq(tenantsTable.tenantEmail, payload.tenantEmail),
          eq(tenantsTable.parentTenantId, scopeTenantId),
        ),
      )
      .limit(1);

    return insertedTenant;
  }

  // ================= GET OWN CHILDREN =================
  static async getAllChildren(actor, query = {}) {
    if (!actor.isTenantOwner) {
      throw ApiError.forbidden('Only tenant owner can view child tenants');
    }

    let { search = '', status = 'all', limit = 20, page = 1 } = query;
    limit = Number(limit);
    page = Number(page);
    search = search.trim();
    const offset = (page - 1) * limit;

    const conditions = [eq(tenantsTable.parentTenantId, actor.tenantId)];

    if (search.length > 0) {
      conditions.push(
        or(
          like(tenantsTable.tenantNumber, `%${search}%`),
          like(tenantsTable.tenantName, `%${search}%`),
          like(tenantsTable.tenantMobileNumber, `%${search}%`),
          like(tenantsTable.tenantWhatsapp, `%${search}%`),
        ),
      );
    }

    if (status && status !== 'all') {
      conditions.push(eq(tenantsTable.tenantStatus, status));
    }

    const data = await db
      .select()
      .from(tenantsTable)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tenantsTable.createdAt));

    /* ---------------- COUNT ---------------- */
    const [{ total }] = await db
      .select({ total: count() })
      .from(tenantsTable)
      .where(and(...conditions));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ================= GET CHILDREN + GRANDCHILDREN =================
  static async getTenantDescendants(params, actor, query = {}) {
    const { tenantId } = params;
    let { search = '', status = 'all', limit = 20, page = 1 } = query;
    limit = Number(limit);
    page = Number(page);
    search = search.trim();

    const offset = (page - 1) * limit;

    // ----------------- STEP 0: Fetch tenant itself -----------------
    const [tenant] = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw ApiError.notFound('Tenant not found');
    }

    if (
      tenant.id !== actor.tenantId &&
      tenant.parentTenantId !== actor.tenantId
    ) {
      throw ApiError.forbidden('You are not allowed to view this tenant');
    }

    // ----------------- STEP 1: Fetch direct children -----------------
    const childConditions = [eq(tenantsTable.parentTenantId, tenantId)];

    if (search.length > 0) {
      childConditions.push(
        or(
          like(tenantsTable.tenantNumber, `%${search}%`),
          like(tenantsTable.tenantName, `%${search}%`),
          like(tenantsTable.tenantMobileNumber, `%${search}%`),
          like(tenantsTable.tenantWhatsapp, `%${search}%`),
        ),
      );
    }

    if (status && status !== 'all') {
      childConditions.push(eq(tenantsTable.tenantStatus, status));
    }

    const children = await db
      .select()
      .from(tenantsTable)
      .where(and(...childConditions))
      .limit(limit)
      .offset(offset)
      .orderBy(tenantsTable.createdAt);

    return {
      tenant,
      children,
    };
  }

  // ================= GET BY ID =================
  static async getById(id, actor) {
    const [result] = await db
      .select({
        tenant: tenantsTable,
        employeeNumber: employeesTable.employeeNumber,
      })
      .from(tenantsTable)
      .leftJoin(
        employeesTable,
        eq(employeesTable.id, tenantsTable.createdByEmployeeId),
      )
      .where(eq(tenantsTable.id, id))
      .limit(1);

    if (!result) {
      throw ApiError.notFound('Tenant not found');
    }

    if (
      result.tenant.id !== actor.tenantId &&
      result.tenant.parentTenantId !== actor.tenantId
    ) {
      throw ApiError.forbidden('Access denied');
    }

    return {
      ...result.tenant,
      employee: {
        employeeNumber: result.employeeNumber,
      },
    };
  }

  // ================= UPDATE =================
  static async update(id, payload) {
    if (!actor.isTenantOwner || actor.tenantId !== id) {
      throw ApiError.forbidden('Only tenant owner can update tenant');
    }

    const tenant = await this.getById(id);

    const updatedFields = {};

    Object.keys(payload).forEach((key) => {
      if (payload[key] !== tenant[key]) {
        updatedFields[key] = payload[key];
      }
    });

    if (payload.tenantStatus) {
      updatedFields.tenantStatus = payload.tenantStatus;
      updatedFields.actionReason =
        payload.tenantStatus === 'ACTIVE' ? null : payload.actionReason;
      updatedFields.actionedAt =
        payload.tenantStatus === 'ACTIVE' ? null : new Date();
    }

    updatedFields.updatedAt = new Date();

    await db
      .update(tenantsTable)
      .set(updatedFields)
      .where(eq(tenantsTable.id, id));

    return {
      id,
      ...updatedFields,
    };
  }
}

export { TenantService };
