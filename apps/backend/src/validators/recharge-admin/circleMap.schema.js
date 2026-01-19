import { z } from 'zod';

export const upsertCircleMapSchema = z.object({
  internalCircleCode: z.string().min(1),
  mplanCircleCode: z.string().min(1),
});
