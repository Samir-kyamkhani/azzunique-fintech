import { eq } from 'drizzle-orm';
import { tenantsTable } from '../models/core/tenant.schema.js';
import { ApiError } from '../lib/ApiError.js';
import { db } from '../database/core/core-db.js';

class TenantService {
  // ================= CREATE =================
  static async create(payload) {
    const existing = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.tenantEmail, payload.tenantEmail))
      .limit(1);

    if (existing.length) {
      throw ApiError.conflict('Tenant with this email already exists');
    }

    const tenantNumber = `TN-${Math.floor(100000 + Math.random() * 900000)}`;

    // 🔹 INSERT
    const result = await db.insert(tenantsTable).values({
      ...payload,
      tenantNumber,
      tenantStatus: 'ACTIVE',
    });

    // 🔹 MySQL insertId
    const insertId = result[0]?.insertId;

    // 🔹 Fetch inserted row
    const [tenant] = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, insertId))
      .limit(1);

    return tenant;
  }

  // ================= GET ALL =================
  static async getAll() {
    return db.select().from(tenantsTable);
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
    const [existing] = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, id))
      .limit(1);

    if (!existing) {
      throw ApiError.notFound('Tenant not found');
    }

    await db
      .update(tenantsTable)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(tenantsTable.id, id));

    return this.getById(id);
  }

  // ================= DELETE (SOFT) =================
  static async remove(id) {
    const [existing] = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, id))
      .limit(1);

    if (!existing) {
      throw ApiError.notFound('Tenant not found');
    }

    await db
      .update(tenantsTable)
      .set({
        tenantStatus: 'DELETED',
        updatedAt: new Date(),
      })
      .where(eq(tenantsTable.id, id));

    return true;
  }
}

export { TenantService };
