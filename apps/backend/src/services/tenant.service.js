import { and, count, desc, eq, like, or } from 'drizzle-orm';
import { tenantsTable } from '../models/core/tenant.schema.js';
import { ApiError } from '../lib/ApiError.js';
import { db } from '../database/core/core-db.js';
import { generateNumber } from '../lib/lib.js';
import { employeesTable } from '../models/core/employee.schema.js';

class TenantService {
  // ================= CREATE =================
  static async create(payload, actor) {
    const [actorTenant] = await db
      .select({
        id: tenantsTable.id,
        userType: tenantsTable.userType,
        parentTenantId: tenantsTable.parentTenantId,
      })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, actor.tenantId))
      .limit(1);

    if (!actorTenant) {
      throw ApiError.notFound('Actor tenant not found');
    }

    const actorTenantType = actorTenant.userType;
    const targetUserType = payload.userType?.toUpperCase();

    const allowedMap = {
      AZZUNIQUE: ['RESELLER'],
      RESELLER: ['WHITELABEL'],
      WHITELABEL: [],
    };

    if (!allowedMap[actorTenantType]?.includes(targetUserType)) {
      throw ApiError.forbidden(
        `${actorTenantType} cannot create ${targetUserType} tenant`,
      );
    }

    let parentTenantId;

    if (actorTenantType === 'AZZUNIQUE') {
      parentTenantId = actorTenant.id;
    } else if (actorTenantType === 'RESELLER') {
      parentTenantId = actorTenant.id;
    } else {
      throw ApiError.forbidden('WHITELABEL cannot create tenants');
    }

    const [existingTenant] = await db
      .select()
      .from(tenantsTable)
      .where(
        and(
          eq(tenantsTable.parentTenantId, parentTenantId),
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
        'Tenant with this email, mobile number or WhatsApp already exists in this group',
      );
    }

    const id = crypto.randomUUID();

    await db.insert(tenantsTable).values({
      id,
      ...payload,
      userType: targetUserType,
      tenantType: payload.tenantType.toUpperCase(),
      parentTenantId,
      tenantNumber: generateNumber('TNT'),
      actionedAt: ['INACTIVE', 'SUSPENDED', 'DELETED'].includes(
        payload.tenantStatus,
      )
        ? new Date()
        : null,
      createdByUserId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const [createdTenant] = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, id))
      .limit(1);

    return createdTenant;
  }

  // ================= GET OWN CHILDREN =================
  static async getAllChildren(actor, query = {}) {
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
    const { search = '', status = 'all', limit = 20, page = 1 } = query;
    limit = Number(limit);
    page = Number(page);
    search = search.trim();

    const offset = (page - 1) * limit;

    // ----------------- STEP 0: Fetch tenant itself -----------------
    const [tenant] = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, tenantId));

    if (!tenant) {
      throw ApiError.notFound('Tenant not found');
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
  static async getById(id) {
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

    return {
      ...result.tenant,
      employee: {
        employeeNumber: result.employeeNumber,
      },
    };
  }

  // ================= UPDATE =================
  static async update(id, payload) {
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
