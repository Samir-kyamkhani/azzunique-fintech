import { z } from 'zod';

const baseCommissionSchema = {
  platformServiceId: z.string().uuid(),
  platformServiceFeatureId: z.string().uuid(),

  mode: z.enum(['COMMISSION', 'SURCHARGE']),
  type: z.enum(['FLAT', 'PERCENTAGE']),

  value: z.number().int().min(0),

  minAmount: z.number().int().min(0).default(0),
  maxAmount: z.number().int().min(0).default(0),

  applyTDS: z.boolean().default(false),
  tdsPercent: z.number().min(0).max(100).optional(),

  applyGST: z.boolean().default(false),
  gstPercent: z.number().min(0).max(100).optional(),

  effectiveTo: z.date().optional(),
};

export const createCommissionSchema = z
  .object({
    scope: z.enum(['USER', 'ROLE']),

    targetUserId: z.string().uuid().optional(),
    roleId: z.string().uuid().optional(),

    ...baseCommissionSchema,
  })
  .superRefine((data, ctx) => {
    if (data.scope === 'USER' && !data.targetUserId) {
      ctx.addIssue({
        path: ['targetUserId'],
        code: 'custom',
        message: 'targetUserId is required when scope is USER',
      });
    }

    if (data.scope === 'ROLE' && !data.roleId) {
      ctx.addIssue({
        path: ['roleId'],
        code: 'custom',
        message: 'roleId is required when scope is ROLE',
      });
    }
  });
