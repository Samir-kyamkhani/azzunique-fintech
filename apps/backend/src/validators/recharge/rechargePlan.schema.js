import { z } from 'zod';

export const rechargePlanSchema = z.object({
  operatorCode: z.string().min(1),
  circleCode: z.string().min(1),
});
