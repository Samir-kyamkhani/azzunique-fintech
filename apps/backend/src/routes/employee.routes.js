import { Router } from 'express';
import {
  createEmployee,
  updateEmployee,
  getEmployeeById,
  getAllEmployees,
  deleteEmployee,
} from '../controllers/employee.controller.js';
import { validate } from '../middleware/zod-validate.js';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  idParamSchema,
} from '../validators/employee.schema.js';
import asyncHandler from '../lib/AsyncHandler.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';

const router = Router();

router.use(AuthMiddleware);

// CREATE EMPLOYEE
router.post('/', validate(createEmployeeSchema), asyncHandler(createEmployee));

// GET ALL EMPLOYEES (by tenant ID)
router.get('/', asyncHandler(getAllEmployees));

// GET EMPLOYEE BY ID
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(getEmployeeById),
);

// UPDATE EMPLOYEE
router.put(
  '/:id',
  upload.single('profilePicture'),
  validate({ params: idParamSchema, body: updateEmployeeSchema }),
  asyncHandler(updateEmployee),
);

// HARD DELETE
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(deleteEmployee),
);

export default router;
