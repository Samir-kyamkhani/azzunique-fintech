import { Router } from 'express';
import {
  createDepartment,
  updateDepartment,
  getDepartmentById,
  getAllDepartments,
  delelteDepartment,
} from '../controllers/department.controller.js';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  idParamSchema,
} from '../validators/department.schema.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/zod-validate.js';
import asyncHandler from '../lib/AsyncHandler.js';

const router = Router();

router.use(AuthMiddleware);

// CREATE DEPARTMENT
router.post(
  '/',
  validate({ body: createDepartmentSchema }),
  asyncHandler(createDepartment),
);

// GET ALL DEPARTMENTS (by tenant ID)
router.get('/', asyncHandler(getAllDepartments));

// GET DEPARTMENT BY ID
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(getDepartmentById),
);

// UPDATE DEPARTMENT
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateDepartmentSchema }),
  asyncHandler(updateDepartment),
);

router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(delelteDepartment),
);

export default router;
