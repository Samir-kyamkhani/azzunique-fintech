import { z } from 'zod';

export const kycTypeParamSchema = z.object({
  type: z.enum(['aadhaar', 'pan', 'ai']), // future ready
});

export const sendOtpSchema = z.object({
  aadhaarNumber: z
    .string()
    .regex(/^[0-9]{12}$/, 'Aadhaar must be 12 digits')
    .optional(),

  panNumber: z.string().optional(), // future
});

export const verifyOtpSchema = z
  .object({
    transactionId: z.string().uuid(),

    providerType: z.enum(['API', 'MANUAL']),

    otp: z.string().min(4).max(6).optional(),

    formData: z.any().optional(),

    // 👇 Files added
    profilePhoto: z.any().optional(),
    aadhaarPhoto: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    // API case
    if (data.providerType === 'API') {
      if (!data.otp) {
        ctx.addIssue({
          path: ['otp'],
          message: 'OTP is required for API verification',
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // MANUAL case
    if (data.providerType === 'MANUAL') {
      if (!data.formData) {
        ctx.addIssue({
          path: ['formData'],
          message: 'Form data is required for manual verification',
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
