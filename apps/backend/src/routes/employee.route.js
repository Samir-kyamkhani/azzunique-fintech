import { Router } from 'express';
import {
  createEmployee,
  updateEmployee,
  changeEmployeeStatus,
  getEmployeeById,
  getEmployees,
  deleteEmployee,
} from '../controllers/employee.controller.js';
import { validate } from '../middleware/zod-validate.js';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeStatusSchema,
  idParamSchema,
} from '../validators/employee.schema.js';
import asyncHandler from '../lib/AsyncHandler.js';

const router = Router();

// CREATE EMPLOYEE
router.post('/', validate(createEmployeeSchema), asyncHandler(createEmployee));

// GET ALL EMPLOYEES (by tenant ID)
router.get('/:tenantId', asyncHandler(getEmployees));

// GET EMPLOYEE BY ID
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(getEmployeeById));

// UPDATE EMPLOYEE
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateEmployeeSchema }),
  asyncHandler(updateEmployee),
);

// STATUS CHANGE
router.patch(
  '/:id/status',
  validate({ params: idParamSchema, body: employeeStatusSchema }),
  asyncHandler(changeEmployeeStatus),
);

// HARD DELETE
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(deleteEmployee),
);

export default router;
