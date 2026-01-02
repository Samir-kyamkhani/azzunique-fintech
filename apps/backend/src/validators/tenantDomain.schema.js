import { z } from 'zod';

export const createTenantDomainSchema = z.object({
  domainName: z.string().min(3, 'Domain name is too short').max(255),
  serverDetailId: z.string().uuid(),
});

export const updateTenantDomainSchema = z.object({
  domainName: z.string().min(3).max(255).optional(),
  serverDetailId: z.string().uuid().optional(),
});

export const tenantDomainStatusSchema = z
  .object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
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
