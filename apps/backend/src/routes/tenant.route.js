import { Router } from 'express';
import {
  createTenant,
  getTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  changeTenantStatus,
} from '../controllers/tenant.controller.js';
import { validate } from '../middleware/zod-validate.js';
import {
  createTenantSchema,
  idParamSchema,
  statusSchema,
  updateTenantSchema,
} from '../validators/tenant.schema.js';
import asyncHandler from '../lib/AsyncHandler.js';

const router = Router();

router.post('/', validate(createTenantSchema), asyncHandler(createTenant));

router.get('/', asyncHandler(getTenants));

router.get('/:id', validate({ params: idParamSchema }), asyncHandler(getTenantById));

router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateTenantSchema }),
  asyncHandler(updateTenant),
);

// STATUS CHANGE (ACTIVE | INACTIVE | SUSPENDED)
router.patch(
  '/:id/status',
  validate({ params: idParamSchema, body: statusSchema }),
  asyncHandler(changeTenantStatus),
);

// SOFT DELETE
router.delete('/:id', validate({ params: idParamSchema }), asyncHandler(deleteTenant));

export default router;
