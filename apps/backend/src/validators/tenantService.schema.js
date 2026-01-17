import { z } from 'zod';

export const enableTenantServiceSchema = z.object({
  platformServiceId: z.string().uuid(),
  isEnabled: z.boolean().optional(),
});
