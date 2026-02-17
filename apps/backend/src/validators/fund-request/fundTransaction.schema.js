import { z } from 'zod';

export const createFundTransactionSchema = z.object({
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .int()
    .positive()
    .min(10000, 'Minimum fund request is ₹100')
    .max(100000000, 'Maximum fund limit is ₹10,00,000'),

  idempotencyKey: z.string().min(8),
});

export const changeFundStatusSchema = z.object({
  status: z.enum(['SUCCESS', 'REJECTED']),
});

export const fundTransactionIdParamSchema = z.object({
  id: z.string().uuid(),
});
