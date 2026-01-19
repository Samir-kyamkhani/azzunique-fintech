import { z } from 'zod';

export const dateRangeSchema = z.object({
  from: z.string().optional(), // ISO date
  to: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});
