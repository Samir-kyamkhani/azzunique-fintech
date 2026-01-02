import { z } from 'zod';

// CREATE EMPLOYEE
export const createEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  mobileNumber: z.string().regex(/^[0-9]{10,15}$/, 'Invalid mobile number'),
  profilePicture: z.string().max(255).optional(),
  passwordHash: z.string().min(6),
  departmentId: z.string().uuid(),
  tenantId: z.string().uuid(),
  createdByUserId: z.string().uuid(),
  createdByEmployeeId: z.string().uuid().optional(),
});

// UPDATE EMPLOYEE
export const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  mobileNumber: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'Invalid mobile number')
    .optional(),
  profilePicture: z.string().max(255).optional(),
  passwordHash: z.string().min(6).optional(),
  departmentId: z.string().uuid().optional(),
});

// STATUS CHANGE / SOFT DELETE
export const employeeStatusSchema = z
  .object({
    employeeStatus: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
    actionReason: z.string().max(255).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.employeeStatus !== 'ACTIVE' && !data.actionReason) {
      ctx.addIssue({
        path: ['actionReason'],
        message: 'Action reason is required when status is not ACTIVE',
        code: z.ZodIssueCode.custom,
      });
    }
  });

// ID PARAM
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
});
