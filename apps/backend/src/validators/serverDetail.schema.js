import { z } from 'zod';

// CREATE SERVER DETAIL
export const createServerDetailSchema = z.object({
  recordType: z.string().min(3).max(50),
  hostname: z.string().min(3).max(255),
  value: z.string().min(1).max(45),
  createdByUserId: z.string().uuid(),
  createdByEmployeeId: z.string().uuid().optional(),
});

// UPDATE SERVER DETAIL
export const updateServerDetailSchema = z.object({
  recordType: z.string().min(3).max(50).optional(),
  hostname: z.string().min(3).max(255).optional(),
  value: z.string().min(1).max(45).optional(),
});

// STATUS CHANGE
export const serverDetailStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

// ID PARAM
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
});
