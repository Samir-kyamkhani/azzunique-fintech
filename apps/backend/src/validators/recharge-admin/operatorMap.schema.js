import { z } from 'zod';

export const upsertOperatorMapSchema = z.object({
  platformServiceId: z.string().uuid(),
  internalOperatorCode: z.string().min(1),
  mplanOperatorCode: z.string().optional(),
  rechargeExchangeOperatorCode: z.string().optional(),
});
