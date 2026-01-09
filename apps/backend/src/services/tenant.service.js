import { and, count, desc, eq, like, or } from 'drizzle-orm';
import { tenantsTable } from '../models/core/tenant.schema.js';
import { ApiError } from '../lib/ApiError.js';
import { db } from '../database/core/core-db.js';
import { generateNumber } from '../lib/lib.js';

class TenantService {
  // ================= CREATE =================
  static async create(payload, actor) {
    const [currentTenant] = await db
      .select({
        id: tenantsTable.id,
        parentTenantId: tenantsTable.parentTenantId,
      })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, actor.tenantId))
      .limit(1);

    if (!currentTenant) {
      throw ApiError.notFound('Actor tenant not found');
    }

    const scopeTenantId = currentTenant.parentTenantId ?? currentTenant.id;

    const [existingTenant] = await db
      .select()
      .from(tenantsTable)
      .where(
        and(
          or(
            eq(tenantsTable.tenantEmail, payload.tenantEmail),
            eq(tenantsTable.tenantMobileNumber, payload.tenantMobileNumber),
            eq(tenantsTable.tenantWhatsapp, payload.tenantWhatsapp),
          ),
          eq(tenantsTable.parentTenantId, scopeTenantId),
        ),
      )
      .limit(1);

    if (existingTenant) {
      throw ApiError.conflict(
        'Tenant with this email, mobile number or whatsapp already exists in this tenant group',
      );
    }

    if (payload.userType.toUpperCase() === 'AZZUNIQUE') {
      const existingAzzunique = await db
        .select()
        .from(tenantsTable)
        .where(eq(tenantsTable.userType, 'AZZUNIQUE'))
        .limit(1);

      if (existingAzzunique.length) {
        throw ApiError.conflict('There can be only one AZZUNIQUE tenant');
      }
    }

    await db.insert(tenantsTable).values({
      ...payload,
      userType: payload.userType.toUpperCase(),
      tenantType: payload.tenantType.toUpperCase(),
      actionedAt: ['INACTIVE', 'SUSPENDED', 'DELETED'].includes(
        payload.tenantStatus,
      )
        ? new Date()
        : null,
      tenantNumber: generateNumber('TNT'),
      parentTenantId: scopeTenantId,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
    const [tenant] = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, id))
      .limit(1);

    if (!tenant) {
      throw ApiError.notFound('Tenant not found');
    }

    return tenant;
  }

  // ================= UPDATE =================
  static async update(id, payload) {
    const tenant = await this.getById(id);

    await db
      .update(tenantsTable)
      .set({
        ...payload,
        tenantStatus: payload.tenantStatus,
        actionReason:
          payload.tenantStatus === 'ACTIVE' ? null : payload.actionReason,
        actionedAt: payload.tenantStatus === 'ACTIVE' ? null : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tenantsTable.id, id));

    return this.getById(id);
  }
}

export { TenantService };
