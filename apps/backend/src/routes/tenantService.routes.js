import { Router } from 'express';
import { validate } from '../middleware/zod-validate.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

import * as TS from '../controllers/tenantService.controller.js';
import {
  tenantServiceWithPlatformParamsSchema,
  enableTenantServiceSchema,
} from '../validators/tenantService.schema.js';
import { PermissionMiddleware } from '../middleware/permission.middleware.js';
import { PermissionsRegistry } from '../lib/PermissionsRegistry.js';

const router = Router();
router.use(AuthMiddleware);

// List All Services (Hierarchy based)
router.get(
  '/services/all',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_TENANTS.READ),
  TS.listAllTenantServices,
);

// Enable Service
router.put(
  '/services',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_TENANTS.CREATE),
  validate({
    body: enableTenantServiceSchema,
  }),
  TS.enableTenantService,
);

// Disable Service
router.delete(
  '/:tenantId/services/:platformServiceId',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_TENANTS.UPDATE),
  validate({
    params: tenantServiceWithPlatformParamsSchema,
  }),
  TS.disableTenantService,
);

export default router;
