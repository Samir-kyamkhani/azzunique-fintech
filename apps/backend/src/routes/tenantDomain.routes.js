import { Router } from 'express';
import {
  createTenantDomain,
  updateTenantDomain,
  getTenantDomains,
  getTenantDomainById,
} from '../controllers/tenantDomain.controller.js';
import { validate } from '../middleware/zod-validate.js';
import {
  createTenantDomainSchema,
  updateTenantDomainSchema,
  idParamSchema,
  getAllTenantDomain,
} from '../validators/tenantDomain.schema.js';
import asyncHandler from '../lib/AsyncHandler.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(AuthMiddleware);

// CREATE
router.post(
  '/',
  validate({ body: createTenantDomainSchema }),
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

export default router;
