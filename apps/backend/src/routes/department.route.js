import { Router } from 'express';
import {
  createDepartment,
  updateDepartment,
  changeDepartmentStatus,
  getDepartmentById,
  getDepartments,
} from '../controllers/department.controller.js';
import { validate } from '../middleware/zod-validate.js';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentStatusSchema,
  idParamSchema,
} from '../validators/department.schema.js';

const router = Router();

// CREATE DEPARTMENT
router.post('/', validate(createDepartmentSchema), asyncHandler(createDepartment));

// GET ALL DEPARTMENTS (by tenant ID)
router.get('/:tenantId', asyncHandler(getDepartments));

// GET DEPARTMENT BY ID
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(getDepartmentById));

// UPDATE DEPARTMENT
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateDepartmentSchema }),
  asyncHandler(updateDepartment),
);

// DELETE
router.delete(
  '/:id/delete',
  validate({ params: idParamSchema }),
  asyncHandler(changeDepartmentStatus),
);

export default router;
