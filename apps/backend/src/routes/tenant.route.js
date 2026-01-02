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
  idParamSchema,
  updateTenantSchema,
} from '../validators/tenant.schema.js';
import asyncHandler from '../lib/AsyncHandler.js';

const router = Router();

router.post('/', validate(createTenantSchema), asyncHandler(createTenant));

router.get('/', asyncHandler(getTenants));

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
