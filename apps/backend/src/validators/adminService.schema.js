import { z } from 'zod';

/* PARAMS */

export const serviceIdParamSchema = z.object({
  serviceId: z.string().uuid(),
});

export const serviceIdOnlyParamSchema = z.object({
  id: z.string().uuid(),
});

export const featureIdParamSchema = z.object({
  serviceId: z.string().uuid(),
  featureId: z.string().uuid(),
});

export const providerIdParamSchema = z.object({
  providerId: z.string().uuid(),
});

export const providerIdOnlyParamSchema = z.object({
  providerId: z.string().uuid(),
});

export const providerFeatureParamSchema = z.object({
  serviceId: z.string().uuid(),
  providerId: z.string().uuid(),
  featureId: z.string().uuid(),
});

/* SERVICE BODY */

export const createServiceSchema = z.object({
  code: z.string().min(2).max(40),
  name: z.string().min(2).max(100),
  isActive: z.boolean().optional(),
});

export const updateServiceSchema = z.object({
  name: z.string().optional(),
  isActive: z.boolean().optional(),
});

/* FEATURE BODY */

export const createFeatureSchema = z.object({
  code: z.string(),
  name: z.string(),
  isActive: z.boolean().optional(),
});

export const updateFeatureSchema = z.object({
  name: z.string().optional(),
  isActive: z.boolean().optional(),
});

/* PROVIDER BODY */

export const createProviderSchema = z.object({
  code: z.string(),
  providerName: z.string(),
  handler: z.string(),
  isActive: z.boolean().optional(),
});

export const updateProviderSchema = z.object({
  code: z.string().optional(),
  providerName: z.string().optional(),
  handler: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const assignProviderToServiceSchema = z.object({
  providerId: z.string().uuid(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const updateProviderConfigSchema = z.object({
  config: z.record(z.string(), z.unknown()),
});

/* PROVIDER FEATURE */

export const mapProviderFeatureSchema = z.object({
  platformServiceFeatureId: z.string().uuid(),
});
