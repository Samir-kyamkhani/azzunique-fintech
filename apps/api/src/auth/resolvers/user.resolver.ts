import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dtos/login-auth.dto';
import type { Request } from 'express';
import { TokenPair } from 'src/lib/types/auth.type';
import { CoreDbService } from 'src/db/core/drizzle';
import { usersTable } from 'src/db/core/schema';
import { and, eq } from 'drizzle-orm';
import { AuthUtilsService } from 'src/lib/utils/auth-utils';

@Injectable()
export class UserAuthResolver {
  private readonly logger = new Logger(UserAuthResolver.name);

  constructor(
    private readonly db: CoreDbService,
    private readonly authutils: AuthUtilsService,
  ) {}

  async login(
    dto: LoginDto,
    req: Request,
  ): Promise<{
    tokens: TokenPair;
    actorType: 'USER';
    actorId: string;
  }> {
    const tenant = req.tenant;
    if (!tenant) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    const [user] = await this.db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.email, dto.email),
          eq(usersTable.tenantId, tenant.tenantId),
        ),
      )
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // password verify logic here
    const isPasswordValid = this.authutils.verifyPassword(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.authutils.generateTokens({
      sub: user.id,
      principalType: 'USER',
      tenantId: tenant.tenantId,
      roleId: user.roleId ?? undefined,
    });

    return {
      tokens,
      actorType: 'USER',
      actorId: user.id,
    };
  }
}
