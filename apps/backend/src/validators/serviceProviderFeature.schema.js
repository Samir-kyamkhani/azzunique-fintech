import { z } from 'zod';

export const serviceProviderFeatureIdParamSchema = z.object({
  id: z.string().uuid('Invalid mapping id'),
});

export const mapServiceProviderFeatureSchema = z.object({
  serviceProviderId: z.string().uuid(),
  platformServiceFeatureId: z.string().uuid(),
});
