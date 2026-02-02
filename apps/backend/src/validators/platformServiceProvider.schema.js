import { z } from 'zod';

export const assignPlatformServiceProviderSchema = z.object({
  platformServiceId: z.string().uuid(),
  serviceProviderId: z.string().uuid(),
  config: z.record(z.string(), z.unknown()),
});
