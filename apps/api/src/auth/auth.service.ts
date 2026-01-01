import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response, CookieOptions } from 'express';
import { LoginDto } from './dtos/login-auth.dto';
import { UserAuthResolver } from './resolvers/user.resolver';
import { EmployeeAuthResolver } from './resolvers/employee.resolver';
import { TokenPair } from 'src/lib/types/auth.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly accessTokenCookieOptions: CookieOptions;
  private readonly refreshTokenCookieOptions: CookieOptions;

  private static readonly ACCESS_TOKEN_COOKIE_NAME = 'access_token';
  private static readonly REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

  constructor(
    private readonly configService: ConfigService,
    private readonly userResolver: UserAuthResolver,
    private readonly employeeResolver: EmployeeAuthResolver,
  ) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    const baseCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      path: '/',
    };

    this.accessTokenCookieOptions = {
      ...baseCookieOptions,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    };

    this.refreshTokenCookieOptions = {
      ...baseCookieOptions,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    };
  }

  setAuthCookies(res: Response, tokens: TokenPair): void {
    res.cookie(
      AuthService.ACCESS_TOKEN_COOKIE_NAME,
      tokens.accessToken,
      this.accessTokenCookieOptions,
    );

    res.cookie(
      AuthService.REFRESH_TOKEN_COOKIE_NAME,
      tokens.refreshToken,
      this.refreshTokenCookieOptions,
    );
  }

  clearAuthCookies(res: Response): void {
    const clearOptions = {
      path: '/',
      sameSite: this.accessTokenCookieOptions.sameSite,
      secure: this.accessTokenCookieOptions.secure,
    };

    res.clearCookie(AuthService.ACCESS_TOKEN_COOKIE_NAME, clearOptions);
    res.clearCookie(AuthService.REFRESH_TOKEN_COOKIE_NAME, clearOptions);
  }

  async login(
    dto: LoginDto,
    req: Request,
  ): Promise<{
    tokens: TokenPair;
    actorType: 'USER' | 'EMPLOYEE';
    actorId: string;
  }> {
    // Tenant must be resolved before login
    const tenant = (req as any).tenant;
    if (!tenant) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    switch (dto.actorType) {
      case 'USER': {
        return this.userResolver.login(dto, req);
      }

      case 'EMPLOYEE': {
        return this.employeeResolver.login(dto, req);
      }

      default:
        throw new UnauthorizedException('Invalid actor type');
    }
  }
}
