import { z } from 'zod';

export const createTenantSchema = z.object({
  tenantName: z.string().min(3, 'Tenant name must be at least 3 characters'),

  tenantLegalName: z
    .string()
    .min(3, 'Tenant legal name must be at least 3 characters'),

  tenantType: z.enum(['PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED']),

  userType: z.enum(['AZZUNIQUE', 'RESELLER', 'WHITELABEL']),

  tenantEmail: z.string().email('Invalid tenant email'),

  tenantWhatsapp: z.string().regex(/^[0-9]{10,15}$/, 'Invalid WhatsApp number'),

  tenantMobileNumber: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'Invalid mobile number'),
});

export const updateTenantSchema = z.object({
  tenantName: z
    .string()
    .min(3, 'Tenant name must be at least 3 characters')
    .optional(),

  tenantLegalName: z
    .string()
    .min(3, 'Tenant legal name must be at least 3 characters')
    .optional(),

  tenantType: z
    .enum(['PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED'])
    .optional(),

  userType: z.enum(['AZZUNIQUE', 'RESELLER', 'WHITELABEL']).optional(),

  tenantEmail: z.string().email('Invalid tenant email').optional(),

  tenantWhatsapp: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'Invalid WhatsApp number')
    .optional(),

  tenantMobileNumber: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'Invalid mobile number')
    .optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid tenant id'),
});

export const statusSchema = z
  .object({
    tenantStatus: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
    actionReason: z.string().max(255).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.tenantStatus === 'INACTIVE' || data.tenantStatus === 'SUSPENDED') &&
      !data.actionReason
    ) {
      ctx.addIssue({
        path: ['actionReason'],
        message:
          'Action reason is required when status is INACTIVE or SUSPENDED',
        code: z.ZodIssueCode.custom,
      });
    }
  });
