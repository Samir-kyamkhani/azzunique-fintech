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

// Enable Service
router.put(
  '/:tenantId/services',
  validate({
    params: tenantServiceParamsSchema,
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

// List Services
router.get(
  '/:tenantId/services',
  validate({ params: tenantServiceParamsSchema }),
  TS.listTenantServices,
);

export default router;
