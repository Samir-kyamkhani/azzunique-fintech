import { z } from 'zod';

export const upsertTenantWebsiteSchema = z.object({
  brandName: z.string().min(2, 'Brand name is required').max(255).optional(),

  tagLine: z.string().max(500).optional(),

  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
    .optional(),

  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
    .optional(),

  supportEmail: z.string().email('Invalid support email').optional(),

  supportPhone: z
    .string()
    .regex(/^[0-9+]{8,20}$/, 'Invalid phone number')
    .optional(),
});
