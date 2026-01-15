import { Router } from 'express';
import {
  createEmployee,
  updateEmployee,
  findEmployee,
  findAllEmployees,
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

router.post(
  '/',
  validate({ body: createEmployeeSchema }),
  asyncHandler(createEmployee),
);

router.get('/', asyncHandler(findAllEmployees));

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(findEmployee),
);

router.put(
  '/:id',
  upload.single('profilePicture'),
  validate({ params: idParamSchema, body: updateEmployeeSchema }),
  asyncHandler(updateEmployee),
);

router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(deleteEmployee),
);

export default router;
