import { Router } from 'express';
import {
  createTenantDomain,
  updateTenantDomain,
  deleteTenantDomain,
  changeTenantDomainStatus,
  getTenantDomains,
  getTenantDomainById,
} from '../controllers/tenantDomain.controller.js';
import { validate } from '../middleware/zod-validate.js';
import {
  createTenantDomainSchema,
  updateTenantDomainSchema,
  tenantDomainStatusSchema,
  idParamSchema,
} from '../validators/tenantDomain.schema.js';
import asyncHandler from '../lib/AsyncHandler.js';

const router = Router();

// CREATE
router.post(
  '/',
  validate(createTenantDomainSchema),
  asyncHandler(createTenantDomain),
);

// GET ALL
router.get('/', asyncHandler(getTenantDomains));

// GET BY ID
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(getTenantDomainById),
);

// UPDATE
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateTenantDomainSchema }),
  asyncHandler(updateTenantDomain),
);

// SOFT DELETE
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(deleteTenantDomain),
);

// STATUS CHANGE
router.patch(
  '/:id/status',
  validate({ params: idParamSchema, body: tenantDomainStatusSchema }),
  asyncHandler(changeTenantDomainStatus),
);

export default router;
