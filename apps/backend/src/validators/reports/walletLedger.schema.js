import z from 'zod';
import { dateRangeSchema } from './common.schema.js';

export const walletLedgerSchema = dateRangeSchema.extend({
  walletId: z.string().uuid(),
});
