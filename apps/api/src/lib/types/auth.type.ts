// ================= JWT =================

export interface JwtPayload {
  sub: string; // actorId
  principalType: 'USER' | 'EMPLOYEE';
  tenantId: string;
  roleId?: string;
  departmentId?: string;
}

// ================= SESSION =================

export interface SessionUser {
  id: string;
  principalType: 'USER' | 'EMPLOYEE';
  tenantId: string;

  roleId?: string | null;
  departmentId?: string | null;
  businessId?: string | null;
}

// ================= TOKENS =================

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ================= SECURITY =================

export interface SecurityConfig {
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  jwtSecret: string;
  bcryptSaltRounds: number;
  cookieDomain?: string;
  allowedOrigins: string[];
}

// ================= AUDIT =================

export interface AuditMetadata {
  [key: string]: unknown;
}
