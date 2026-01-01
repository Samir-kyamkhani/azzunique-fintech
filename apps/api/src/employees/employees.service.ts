import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, like, or, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

import { CoreDbService } from 'src/db/core/drizzle';
import {
  employeesTable,
  departmentTable,
  tenantsTable,
  tenantsDomainsTable,
} from 'src/db/core/schema';

import { GetEmployeesDto } from './dto/get-employees-dto';
import { CreateEmployeeDto } from './dto/create-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employees.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';
import { AuthUtilsService } from 'src/lib/utils/auth-utils';
import { S3UtilsService } from 'src/lib/utils/s3-utils';
import { EventBusService } from 'src/events/event-bus';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly db: CoreDbService,
    private readonly authUtils: AuthUtilsService,
    private readonly s3Utils: S3UtilsService,
    private readonly eventBus: EventBusService,
  ) {}

  // ==============================
  // GET ALL
  // ==============================
  async getAll(query: GetEmployeesDto, actor: { tenantId: string }) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const offset = (page - 1) * limit;

    const conditions = [eq(employeesTable.tenantId, actor.tenantId)];

    if (query.employeeStatus) {
      conditions.push(eq(employeesTable.employeeStatus, query.employeeStatus));
    }

    if (query.departmentId) {
      conditions.push(eq(employeesTable.departmentId, query.departmentId));
    }

    if (query.search) {
      const search = `%${query.search}%`;

      const searchCondition = or(
        like(employeesTable.firstName, search),
        like(employeesTable.lastName, search),
        like(employeesTable.email, search),
      );

      if (searchCondition) {
        // only push if it's defined
        conditions.push(searchCondition);
      }
    }

    const data = await this.db
      .select()
      .from(employeesTable)
      .where(and(...conditions))
      .orderBy(sql`${employeesTable.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    //  strip password
    const safeData = data.map((emp) =>
      this.authUtils.stripSensitive(emp, ['passwordHash', 'refreshTokenHash']),
    );

    const [{ count = 0 } = {}] = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(employeesTable)
      .where(and(...conditions));

    return {
      data: safeData,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  // ==============================
  // CREATE
  // ==============================
  async create(
    dto: CreateEmployeeDto,
    actor: { tenantId: string },
    filePath?: string,
  ) {
    // validate department
    const [dept] = await this.db
      .select({ id: departmentTable.id })
      .from(departmentTable)
      .where(
        and(
          eq(departmentTable.id, dto.departmentId),
          eq(departmentTable.tenantId, actor.tenantId),
        ),
      )
      .limit(1);

    if (!dept) {
      throw new BadRequestException('Invalid department');
    }

    const [emp] = await this.db
      .select()
      .from(employeesTable)
      .where(and(eq(employeesTable.email, dto.email)))
      .limit(1);

    if (emp) {
      throw new NotFoundException('Employee already exists');
    }

    const [tenant] = await this.db
      .select({
        tenantId: tenantsTable.id,
        tenantName: tenantsTable.tenantName,
        tenantEmail: tenantsTable.tenantEmail,
        domainName: tenantsDomainsTable.domainName,
      })
      .from(tenantsTable)
      .leftJoin(
        tenantsDomainsTable,
        and(
          eq(tenantsDomainsTable.tenantId, tenantsTable.id),
          eq(tenantsDomainsTable.status, 'ACTIVE'),
        ),
      )
      .where(eq(tenantsTable.id, actor.tenantId))
      .limit(1);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const employeeId = randomUUID();
    const employeeNumber = this.generateEmployeeNumber();

    //  RANDOM PASSWORD
    const plainPassword = this.authUtils.generateRandomPassword(12);

    //  ENCRYPT PASSWORD
    const encryptedPassword = this.authUtils.encrypt(plainPassword);

    // UPLOAD IMAGE (IF ANY)
    let profilePictureUrl: string | null;

    if (filePath) {
      profilePictureUrl = await this.s3Utils.upload(
        filePath,
        `employees/${actor.tenantId}`,
      );
    }

    await this.db.insert(employeesTable).values({
      id: employeeId,
      employeeNumber,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      mobileNumber: dto.mobileNumber,
      profilePicture: profilePictureUrl! ?? null,
      passwordHash: encryptedPassword,
      employeeStatus: dto.employeeStatus ?? 'INACTIVE',
      departmentId: dto.departmentId,
      tenantId: actor.tenantId,
    });

    this.eventBus.emit('employee.created', {
      email: dto.email,
      firstName: dto.firstName,
      employeeNumber,
      password: plainPassword,
      tenantId: actor.tenantId,
      tenantName: tenant.tenantName,
      domain: tenant.domainName,
    });

    console.log('Event Success send');

    //  password sirf first time return karo (email / SMS ke liye)
    return {
      id: employeeId,
      employeeNumber,
      temporaryPassword: plainPassword,
    };
  }

  // ==============================
  // GET ONE
  // ==============================
  async findOne(employeeId: string, actor: { tenantId: string }) {
    const emp = await this.findByIdOrThrow(employeeId, actor.tenantId);

    return this.authUtils.stripSensitive(emp, [
      'passwordHash',
      'refreshTokenHash',
    ]);
  }

  // ==============================
  // UPDATE
  // ==============================
  async update(
    employeeId: string,
    dto: UpdateEmployeeDto,
    actor: { tenantId: string },
    filePath?: string,
  ) {
    const existing = await this.findByIdOrThrow(employeeId, actor.tenantId);

    let profilePicture = existing.profilePicture;

    // 📸 NEW IMAGE UPLOAD
    if (filePath) {
      // delete old image
      if (profilePicture) {
        await this.s3Utils.delete({ fileUrl: profilePicture });
      }

      profilePicture = await this.s3Utils.upload(
        filePath,
        `employees/${actor.tenantId}`,
      );
    }

    await this.db
      .update(employeesTable)
      .set({
        ...dto,
        profilePicture,
        updatedAt: new Date(),
      })
      .where(eq(employeesTable.id, employeeId));

    return { ...existing, ...dto, profilePicture, updatedAt: new Date() };
  }

  // ==============================
  // UPDATE STATUS
  // ==============================
  async updateStatus(
    employeeId: string,
    dto: UpdateEmployeeStatusDto,
    actor: { tenantId: string },
  ) {
    await this.findByIdOrThrow(employeeId, actor.tenantId);

    await this.db
      .update(employeesTable)
      .set({
        employeeStatus: dto.employeeStatus,
        actionReason: dto.actionReason ?? null,
        actionedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(employeesTable.id, employeeId));

    return {
      id: employeeId,
      employeeStatus: dto.employeeStatus,
    };
  }

  // ==============================
  // VERIFY PASSWORD (LOGIN USE)
  // ==============================
  async verifyEmployeePassword(email: string, plainPassword: string) {
    const [emp] = await this.db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.email, email))
      .limit(1);

    if (!emp) return null;

    const isValid = this.authUtils.verifyPassword(
      plainPassword,
      emp.passwordHash,
    );

    if (!isValid) return null;

    return this.authUtils.stripSensitive(emp, ['passwordHash']);
  }

  // ==============================
  // DELETE
  // ==============================
  async delete(employeeId: string, actor: { tenantId: string }) {
    const existing = await this.findByIdOrThrow(employeeId, actor.tenantId);

    // 🧹 DELETE IMAGE FROM S3
    if (existing.profilePicture) {
      await this.s3Utils.delete({ fileUrl: existing.profilePicture });
    }

    await this.db
      .delete(employeesTable)
      .where(eq(employeesTable.id, employeeId));

    return { id: employeeId, deleted: true };
  }

  // ==============================
  // HELPERS
  // ==============================
  private async findByIdOrThrow(id: string, tenantId: string) {
    const [emp] = await this.db
      .select()
      .from(employeesTable)
      .where(
        and(eq(employeesTable.id, id), eq(employeesTable.tenantId, tenantId)),
      )
      .limit(1);

    if (!emp) {
      throw new NotFoundException('Employee not found');
    }

    return emp;
  }

  private generateEmployeeNumber() {
    const num = Math.floor(100000 + Math.random() * 900000);
    return `EMP-${num}`;
  }
}
