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

export const createUserCommissionSchema = z.object({
  targetUserId: z.string().uuid(),
  ...baseCommissionSchema,
});

export const createRoleCommissionSchema = z.object({
  roleId: z.string().uuid(),
  ...baseCommissionSchema,
});

export const commissionListQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
});
