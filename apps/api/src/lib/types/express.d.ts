import type { SessionUser } from './auth.type';

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
      tenant?: {
        tenantId: string;
        tenantType: 'BUSINESS';
      };
    }
  }
}

export {};
