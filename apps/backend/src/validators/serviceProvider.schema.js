import { z } from 'zod';

export const serviceProviderIdParamSchema = z.object({
  id: z.string().uuid('Invalid service provider id'),
});

export const createServiceProviderSchema = z.object({
  platformServiceId: z.string().uuid(),
  code: z.string().min(2).max(40),
  providerName: z.string().min(2).max(100),
  handler: z.string().min(3).max(200),
  isActive: z.boolean().optional(),
});

export const updateServiceProviderSchema = z.object({
  providerName: z.string().min(2).max(100).optional(),
  handler: z.string().min(3).max(200).optional(),
  isActive: z.boolean().optional(),
});
