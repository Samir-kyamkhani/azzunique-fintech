import { z } from 'zod';

// CREATE SERVER DETAIL
export const createServerDetailSchema = z.object({
  recordType: z.enum(['CNAME', 'IP', 'OTHER']),
  hostname: z.string().min(3).max(255),
  value: z.string().min(1).max(45),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

// UPDATE SERVER DETAIL
export const updateServerDetailSchema = z.object({
  recordType: z.enum(['CNAME', 'IP', 'OTHER']).optional(),
  hostname: z.string().min(3).max(255).optional(),
  value: z.string().min(1).max(45).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

// ID PARAM
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
});
