import { z } from 'zod';

export const tenantServiceParamsSchema = z.object({
  tenantId: z.string().uuid(),
});

export const tenantServiceWithPlatformParamsSchema = z.object({
  tenantId: z.string().uuid(),
  platformServiceId: z.string().uuid(),
});

export const enableTenantServiceSchema = z.object({
  tenantId: z.string().uuid(),
  platformServiceId: z.string().uuid(),
});
