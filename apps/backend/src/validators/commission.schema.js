import { z } from 'zod';

export const commissionParamSchema = z.object({
  id: z.string().uuid(),
});

const baseCommissionSchema = {
  platformServiceId: z.string().uuid(),
  platformServiceFeatureId: z.string().uuid(),

  commissionType: z.enum(['FLAT', 'PERCENTAGE']),
  commissionValue: z.number().int().min(0),

  surchargeType: z.enum(['FLAT', 'PERCENTAGE']),
  surchargeValue: z.number().int().min(0),

  gstApplicable: z.boolean().default(false),
  gstRate: z.number().int().min(0).max(28).default(18),
  gstOn: z.enum(['COMMISSION', 'SURCHARGE', 'BOTH']),
  gstInclusive: z.boolean().default(false),

  maxCommissionValue: z.number().int().min(0).default(0),
};

export const createUserCommissionSchema = z.object({
  userId: z.string().uuid(),
  ...baseCommissionSchema,
});

export const createRoleCommissionSchema = z.object({
  roleId: z.string().uuid(),
  ...baseCommissionSchema,
});
