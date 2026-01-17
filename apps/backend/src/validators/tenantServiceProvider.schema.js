import { z } from 'zod';

export const assignTenantServiceProviderSchema = z.object({
  platformServiceId: z.string().uuid(),
  serviceProviderId: z.string().uuid(),
  config: z.record(z.any()),
});
