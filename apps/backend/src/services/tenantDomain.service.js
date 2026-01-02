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

    if (!domain || domain.status === 'DELETED') {
      throw ApiError.notFound('Domain not found');
    }

    return domain;
  }

  // GET ALL (exclude deleted)
  static async getAll() {
    return db
      .select()
      .from(tenantsDomainsTable)
      .where(eq(tenantsDomainsTable.status, 'ACTIVE'));
  }

  // CREATE
  static async create(payload) {
    const id = crypto.randomUUID();

    await db.insert(tenantsDomainsTable).values({
      id,
      ...payload,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.getById(id);
  }

  // UPDATE
  static async update(id, payload) {
    const domain = await this.getById(id);

    if (domain.status === 'DELETED') {
      throw ApiError.badRequest('Cannot update a deleted domain');
    }

    await db
      .update(tenantsDomainsTable)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(tenantsDomainsTable.id, id));

    return this.getById(id);
  }

  // SOFT DELETE
  static async softDelete(id, actionReason) {
    const domain = await this.getById(id);

    await db
      .update(tenantsDomainsTable)
      .set({
        status: 'DELETED',
        actionReason,
        actionedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tenantsDomainsTable.id, id));

    return true;
  }

  // STATUS CHANGE (ACTIVE / INACTIVE / SUSPENDED)
  static async updateStatus(id, payload) {
    const domain = await this.getById(id);

    await db
      .update(tenantsDomainsTable)
      .set({
        status: payload.status,
        actionReason: payload.status === 'ACTIVE' ? null : payload.actionReason,
        actionedAt: new Date(),
      })
      .where(eq(tenantsDomainsTable.id, id));

    return this.getById(id);
  }
}

export { TenantDomainService };
