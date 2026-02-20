import { z } from 'zod';

export const sendOtpSchema = z.object({
  aadhaarNumber: z.string().regex(/^[0-9]{12}$/, 'Aadhaar must be 12 digits'),
});

export const verifyOtpSchema = z.object({
  transactionId: z.string().uuid(),
  otp: z.string().min(4).max(6).optional(),
  formData: z.any().optional(), // manual flow
});

export const transactionIdParamSchema = z.object({
  transactionId: z.string().uuid(),
});
