import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Identifier is required')
    .max(255, 'Identifier too long'),

  password: z.string().min(8, 'Password must be at least 8 characters'),

  type: z.enum(['USER', 'EMPLOYEE'], {
    errorMap: () => ({ message: 'Type must be USER or EMPLOYEE' }),
  }),
});
