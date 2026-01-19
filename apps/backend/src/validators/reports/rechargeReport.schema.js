import { z } from 'zod';
import { dateRangeSchema } from './common.schema.js';

export const rechargeReportSchema = dateRangeSchema.extend({
  status: z.enum(['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED']).optional(),
});
