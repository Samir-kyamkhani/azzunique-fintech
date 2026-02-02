import { z } from 'zod';

export const platformServiceIdParamSchema = z.object({
  id: z.string().uuid('Invalid platform service id'),
});

export const createPlatformServiceSchema = z.object({
  code: z.string().min(2).max(40),
  name: z.string().min(2).max(100),
  isActive: z.boolean().optional(),
});

export const updatePlatformServiceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  isActive: z.boolean().optional(),
});
