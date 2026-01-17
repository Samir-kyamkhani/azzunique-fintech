import { z } from 'zod';

export const createPlatformServiceFeatureSchema = z.object({
  platformServiceId: z.string().uuid(),
  code: z.string().min(2),
  name: z.string().min(2),
  isActive: z.boolean().optional(),
});
