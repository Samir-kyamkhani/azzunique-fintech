import { Router } from 'express';
import { validate } from '../middleware/zod-validate.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

import * as TS from '../controllers/tenantService.controller.js';
import {
  tenantServiceParamsSchema,
  tenantServiceWithPlatformParamsSchema,
  enableTenantServiceSchema,
} from '../validators/tenantService.schema.js';

const router = Router();
router.use(AuthMiddleware);

// List All Services (Hierarchy based)
router.get('/services/all', TS.listAllTenantServices);

// Enable Service
router.put(
  '/services',
  validate({
    body: enableTenantServiceSchema,
  }),
  TS.enableTenantService,
);

// Disable Service
router.delete(
  '/:tenantId/services/:platformServiceId',
  validate({
    params: tenantServiceWithPlatformParamsSchema,
  }),
  TS.disableTenantService,
);

export default router;
