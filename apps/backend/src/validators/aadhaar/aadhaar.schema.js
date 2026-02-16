import { z } from 'zod';

export const sendOtpSchema = z.object({
  aadhaarNumber: z.string().regex(/^[0-9]{12}$/, 'Invalid Aadhaar number'),
  idempotencyKey: z.string().min(8),
});

export const verifyOtpSchema = z.object({
  sessionId: z.string().uuid(),
  otp: z.string().regex(/^[0-9]{4,8}$/),
});
