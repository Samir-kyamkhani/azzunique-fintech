import { Router } from 'express';
import {
  createTenant,
  getTenants,
  getTenantById,
  updateTenant,
} from '../controllers/tenant.controller.js';
import { validate } from '../middleware/zod-validate.js';
import {
  createTenantSchema,
  getAllTenantSchema,
  idParamSchema,
  updateTenantSchema,
} from '../validators/tenant.schema.js';
import asyncHandler from '../lib/AsyncHandler.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(AuthMiddleware);

router.post(
  '/',
  validate({ body: createTenantSchema }),
  asyncHandler(createTenant),
);

router.get(
  '/',
  validate({ query: getAllTenantSchema }),
  asyncHandler(getTenants),
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(getTenantById),
);

router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateTenantSchema }),
  asyncHandler(updateTenant),
);

export default router;
