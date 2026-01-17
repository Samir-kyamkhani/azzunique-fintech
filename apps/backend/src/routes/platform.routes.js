import { Router } from 'express';
import { validate } from '../middleware/zod-validate.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

import * as PSC from '../controllers/platformService.controller.js';
import * as PSF from '../controllers/platformServiceFeature.controller.js';
import * as SP from '../controllers/serviceProvider.controller.js';
import * as SPF from '../controllers/serviceProviderFeature.controller.js';
import * as TS from '../controllers/tenantService.controller.js';
import * as TSP from '../controllers/tenantServiceProvider.controller.js';

import { createPlatformServiceSchema } from '../validators/platformService.schema.js';
import { createPlatformServiceFeatureSchema } from '../validators/platformServiceFeature.schema.js';
import { createServiceProviderSchema } from '../validators/serviceProvider.schema.js';
import { mapServiceProviderFeatureSchema } from '../validators/serviceProviderFeature.schema.js';
import { enableTenantServiceSchema } from '../validators/tenantService.schema.js';
import { assignTenantServiceProviderSchema } from '../validators/tenantServiceProvider.schema.js';

const router = Router();
router.use(AuthMiddleware);

// AZZUNIQUE
router.post(
  '/services',
  validate(createPlatformServiceSchema),
  PSC.createPlatformService,
);
router.post(
  '/services/features',
  validate(createPlatformServiceFeatureSchema),
  PSF.createPlatformServiceFeature,
);
router.post(
  '/providers',
  validate(createServiceProviderSchema),
  SP.createServiceProvider,
);
router.post(
  '/providers/features',
  validate(mapServiceProviderFeatureSchema),
  SPF.mapServiceProviderFeature,
);

// TENANT OWNER
router.post(
  '/tenants/:tenantId/services',
  validate(enableTenantServiceSchema),
  TS.enableTenantService,
);
router.post(
  '/tenants/:tenantId/providers',
  validate(assignTenantServiceProviderSchema),
  TSP.assignTenantServiceProvider,
);

export default router;
