import { z } from 'zod';

// CREATE DEPARTMENT
export const createDepartmentSchema = z.object({
  departmentCode: z.string().min(3).max(50),
  departmentName: z.string().min(3).max(100),
  departmentDescription: z.string().max(255).optional(),
});

// UPDATE DEPARTMENT
export const updateDepartmentSchema = z.object({
  departmentCode: z.string().min(3).max(50).optional(),
  departmentName: z.string().min(3).max(100).optional(),
  departmentDescription: z.string().max(255).optional(),
});

// ID PARAM
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
});
