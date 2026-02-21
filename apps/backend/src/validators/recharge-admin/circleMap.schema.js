import { z } from 'zod';

export const upsertCircleMapSchema = z.object({
  platformServiceId: z.string().uuid(),
  serviceProviderId: z.string().uuid(),
  internalCircleCode: z.string().min(1),
  providerCircleCode: z.string().min(1),
});
