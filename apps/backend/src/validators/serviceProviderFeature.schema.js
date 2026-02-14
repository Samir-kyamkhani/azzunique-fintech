import { z } from 'zod';

export const serviceProviderFeatureIdParamSchema = z.object({
  id: z.string().uuid('Invalid mapping id'),
});

export const mapServiceProviderFeatureSchema = z.object({
  platformServiceFeatureId: z.string().uuid(),
});
