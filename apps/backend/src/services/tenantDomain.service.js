import { eq } from 'drizzle-orm';
import { tenantsDomainsTable } from '../models/core/tenantDomain.schema.js';
import { db } from '../database/core/core-db.js';
import { ApiError } from '../lib/ApiError.js';

class TenantDomainService {
  // GET BY ID
  static async getById(id) {
    const [domain] = await db
      .select()
      .from(tenantsDomainsTable)
      .where(eq(tenantsDomainsTable.id, id))
      .limit(1);

    if (!domain) {
      throw ApiError.notFound('Domain not found');
    }

    return domain;
  }

  // GET ALL
  static async getAll(payload = {}, actor) {
    const { search, status, limit = 20, page = 1 } = payload;

    const parentTenantId = actor.tenantId;
    const offset = (page - 1) * limit;

    const conditions = [eq(tenantsDomainsTable.parentTenantId, parentTenantId)];

    if (status) {
      conditions.push(eq(tenantsDomainsTable.tenantStatus, status));
    }

    if (search) {
      conditions.push(
        or(
          like(tenantsDomainsTable.domainName, `%${search}%`),
          like(tenantsTable.tenantName, `%${search}%`),
        ),
      );
    }

    const tenants = await db
      .select({
        domainName: tenantsDomainsTable.domainName,
        tenantId: tenantsTable.id,
        tenantName: tenantsTable.tenantName,
        tenantStatus: tenantsDomainsTable.tenantStatus,
        createdAt: tenantsDomainsTable.createdAt,
      })
      .from(tenantsDomainsTable)
      .innerJoin(
        tenantsTable,
        eq(tenantsDomainsTable.tenantId, tenantsTable.id),
      )
      .where(and(...conditions))
      .orderBy(tenantsDomainsTable.createdAt)
      .limit(limit)
      .offset(offset);

    if (!tenants.length) {
      throw ApiError.notFound('No tenants found');
    }

    return tenants;
  }

  // CREATE
  static async create(payload) {
    const id = crypto.randomUUID();

    await db.insert(tenantsDomainsTable).values({
      id,
      ...payload,
      actionReason: payload.status === 'ACTIVE' ? null : payload.actionReason,
      actionedAt: payload.status ? actionedAt : null,
      status: payload.status ? payload.status : 'ACTIVE',
      createdByUserId: actor.type === 'USER' ? actor.id : null,
      createdByEmployeeId: actor.type === 'EMPLOYEE' ? actor.id : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.getById(id);
  }

  // UPDATE
  static async update(id, payload) {
    const domain = await this.getById(id);

    await db
      .update(tenantsDomainsTable)
      .set({
        ...payload,
        actionReason: payload.status === 'ACTIVE' ? null : payload.actionReason,
        actionedAt: payload.status ? actionedAt : null,
        status: payload.status ? payload.status : 'ACTIVE',
        updatedAt: new Date(),
      })
      .where(eq(tenantsDomainsTable.id, id));

    return this.getById(id);
  }
}

export { TenantDomainService };
