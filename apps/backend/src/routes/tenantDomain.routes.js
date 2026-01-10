import { Router } from 'express';
import {
  createTenantDomain,
  getTenantId,
} from '../controllers/tenantDomain.controller.js';
import { validate } from '../middleware/zod-validate.js';
import {
  createTenantDomainSchema,
  idParamSchema,
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

// Get by tenant id
router.get(
  '/:tenantId',
  validate({ params: idParamSchema }),
  asyncHandler(getTenantId),
);

export default router;
