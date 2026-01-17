import { z } from 'zod';

export const mapServiceProviderFeatureSchema = z.object({
  serviceProviderId: z.string().uuid(),
  platformServiceFeatureId: z.string().uuid(),
});
