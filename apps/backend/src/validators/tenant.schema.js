import { z } from 'zod';

export const createTenantSchema = z
  .object({
    tenantName: z.string().min(3, 'Tenant name must be at least 3 characters'),

    tenantLegalName: z
      .string()
      .min(3, 'Tenant legal name must be at least 3 characters'),

    tenantType: z.enum(['PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED']),

    userType: z.enum(['AZZUNIQUE', 'RESELLER', 'WHITELABEL']),

    tenantStatus: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']),
    actionReason: z.string().max(255).optional(),

    tenantEmail: z.string().email('Invalid tenant email'),

    tenantWhatsapp: z
      .string()
      .regex(/^[0-9]{10,15}$/, 'Invalid WhatsApp number'),

    tenantMobileNumber: z
      .string()
      .regex(/^[0-9]{10,15}$/, 'Invalid mobile number'),
  })
  .superRefine((data, ctx) => {
    if (
      (data.tenantStatus === 'INACTIVE' ||
        data.tenantStatus === 'SUSPENDED' ||
        data.tenantStatus === 'DELETED') &&
      !data.actionReason
    ) {
      ctx.addIssue({
        path: ['actionReason'],
        message:
          'Action reason is required when status is INACTIVE or SUSPENDED or DELETED',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const updateTenantSchema = z
  .object({
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

    tenantStatus: z
      .enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'])
      .optional(),
    actionReason: z.string().max(255).optional(),

    tenantEmail: z.string().email('Invalid tenant email').optional(),

    tenantWhatsapp: z
      .string()
      .regex(/^[0-9]{10,15}$/, 'Invalid WhatsApp number')
      .optional(),

    tenantMobileNumber: z
      .string()
      .regex(/^[0-9]{10,15}$/, 'Invalid mobile number')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.tenantStatus === 'INACTIVE' ||
        data.tenantStatus === 'SUSPENDED' ||
        data.tenantStatus === 'DELETED') &&
      !data.actionReason
    ) {
      ctx.addIssue({
        path: ['actionReason'],
        message:
          'Action reason is required when status is INACTIVE or SUSPENDED or DELETED',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid tenant id'),
});

// ================= GET ALL TENANTS / CHILDREN-GRANDCHILDREN QUERY SCHEMA =================
export const getChildrenGrandchildrenSchema = z.object({
  search: z.string().optional(), // tenantNumber, tenantName, tenantMobileNumber, tenantWhatsapp
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  page: z.coerce.number().min(1).optional().default(1),
});
