import { z } from 'zod';

export const tenantServiceParamsSchema = z.object({
  tenantId: z.string().uuid(),
});

export const enableTenantServiceSchema = z.object({
  platformServiceId: z.string().uuid(),
  isEnabled: z.boolean().optional(),
});
