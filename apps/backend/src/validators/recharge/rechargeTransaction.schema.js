import { z } from 'zod';

export const rechargeTransactionSchema = z.object({
  mobileNumber: z.string().regex(/^[0-9]{10}$/),
  operatorCode: z.string().min(1),
  circleCode: z.string().optional(),
  amount: z.number().positive(),
});
