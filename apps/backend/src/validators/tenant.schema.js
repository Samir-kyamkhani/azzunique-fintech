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

  parentTenantId: z.string().uuid('Invalid parent tenant id').optional(),

  createdByEmployeeId: z.string().uuid('Invalid employee id').optional(),
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

  parentTenantId: z.string().uuid('Invalid parent tenant id').optional(),

  createdByEmployeeId: z.string().uuid('Invalid employee id').optional(),
});
