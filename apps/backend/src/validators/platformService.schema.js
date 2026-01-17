import { z } from 'zod';

export const createPlatformServiceSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  isActive: z.boolean().optional(),
});
