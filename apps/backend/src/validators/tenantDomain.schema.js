import { z } from 'zod';

export const createTenantDomainSchema = z
  .object({
    domainName: z.string().min(3, 'Domain name is too short').max(255),
    tenantId: z.string().uuid(),
    serverDetailId: z.string().uuid(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']),
    actionReason: z.string().max(255).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status !== 'ACTIVE' && !data.actionReason) {
      ctx.addIssue({
        path: ['actionReason'],
        message: 'Action reason is required when status is not ACTIVE',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const updateTenantDomainSchema = z
  .object({
    domainName: z
      .string()
      .min(3, 'Domain name is too short')
      .max(255)
      .optional(),
    tenantId: z.string().uuid().optional(),
    serverDetailId: z.string().uuid().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']).optional(),
    actionReason: z.string().max(255).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status !== 'ACTIVE' && !data.actionReason) {
      ctx.addIssue({
        path: ['actionReason'],
        message: 'Action reason is required when status is not ACTIVE',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
});

export const getAllTenantDomain = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  page: z.coerce.number().min(1).optional().default(1),
});
