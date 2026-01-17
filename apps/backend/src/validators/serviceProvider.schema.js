import { z } from 'zod';

export const createServiceProviderSchema = z.object({
  platformServiceId: z.string().uuid(),
  code: z.string().min(2),
  providerName: z.string().min(2),
  handler: z.string().min(3),
  isActive: z.boolean().optional(),
});
