import { z } from 'zod';

export const platformServiceFeatureIdParamSchema = z.object({
  id: z.string().uuid('Invalid feature id'),
});

export const createPlatformServiceFeatureSchema = z.object({
  platformServiceId: z.string().uuid(),
  code: z.string().min(2).max(40),
  name: z.string().min(2).max(100),
  isActive: z.boolean().optional(),
});

export const updatePlatformServiceFeatureSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  isActive: z.boolean().optional(),
});
