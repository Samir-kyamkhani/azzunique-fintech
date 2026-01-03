import { and, eq, or } from 'drizzle-orm';
import { tenantsTable } from '../models/core/tenant.schema.js';
import { ApiError } from '../lib/ApiError.js';
import { db } from '../database/core/core-db.js';
import { generateNumber } from '../lib/lib.js';

class TenantService {
  // ================= CREATE =================
  static async create(payload, actor) {
    console.log(payload);

    const [existingEmail] = await db
      .select()
      .from(tenantsTable)
      .where(
        and(
          or(
            eq(tenantsTable.tenantEmail, payload.tenantEmail),
            eq(tenantsTable.tenantMobileNumber, payload.tenantMobileNumber),
            eq(tenantsTable.tenantWhatsapp, payload.tenantWhatsapp),
          ),
          eq(tenantsTable.parentTenantId, actor.tenantId),
        ),
      )
      .limit(1);

    if (existingEmail) {
      throw ApiError.conflict(
        'Tenant with this email, mobile number and whatsapp already exists',
      );
    }

    // Enforce single AZZUNIQUE tenant
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
    console.log(actor);

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
      parentTenantId: actor.tenantId,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Fetch inserted tenant
    const [insertedTenant] = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.tenantEmail, payload.tenantEmail))
      .limit(1);

    return insertedTenant;
  }

  // ================= GET ALL =================
  static async getAll(payload = {}, actor) {
    const { search, status, limit = 20, page = 1 } = payload;

    const parentTenantId = payload?.tenantId ?? actor.tenantId;
    const offset = (page - 1) * limit;

    const conditions = [eq(tenantsTable.parentTenantId, parentTenantId)];

    if (search) {
      conditions.push(
        or(
          like(tenantsTable.tenantName, `%${search}%`),
          like(tenantsTable.tenantEmail, `%${search}%`),
        ),
      );
    }

    if (status) {
      conditions.push(eq(tenantsTable.tenantStatus, status));
    }

    const tenants = await db
      .select()
      .from(tenantsTable)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(tenantsTable.createdAt);

    if (tenants.length === 0) {
      throw ApiError.notFound('No tenants found');
    }

    return tenants;
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
