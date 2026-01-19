import { z } from 'zod';

export const rechargeOfferSchema = z.object({
  operatorCode: z.string().min(1),
  mobileNumber: z.string().regex(/^[0-9]{10}$/),
});
