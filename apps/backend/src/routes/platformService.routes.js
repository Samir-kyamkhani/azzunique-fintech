import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

import * as PSC from '../controllers/platformService.controller.js';
import * as PSF from '../controllers/platformServiceFeature.controller.js';
import * as PSP from '../controllers/platformServiceProvider.controller.js';

import {
  createPlatformServiceSchema,
  platformServiceIdParamSchema,
  updatePlatformServiceSchema,
} from '../validators/platformService.schema.js';
import {
  createPlatformServiceFeatureSchema,
  platformServiceFeatureIdParamSchema,
  updatePlatformServiceFeatureSchema,
} from '../validators/platformServiceFeature.schema.js';
import { assignPlatformServiceProviderSchema } from '../validators/platformServiceProvider.schema.js';
import { validate } from '../middleware/zod-validate.js';

const router = Router();
router.use(AuthMiddleware);

// ================= PLATFORM SERVICES =================
router.post(
  '/services',
  validate({ body: createPlatformServiceSchema }),
  PSC.createPlatformService,
);

router.get('/services', PSC.listPlatformServices);

router.get(
  '/services/:id',
  validate({ params: platformServiceIdParamSchema }),
  PSC.getPlatformService,
);

router.patch(
  '/services/:id',
  validate({
    params: platformServiceIdParamSchema,
    body: updatePlatformServiceSchema,
  }),
  PSC.updatePlatformService,
);

router.delete(
  '/services/:id',
  validate({ params: platformServiceIdParamSchema }),
  PSC.deletePlatformService,
);

// ================= PLATFORM SERVICE FEATURES =================
router.post(
  '/services/features',
  validate({ body: createPlatformServiceFeatureSchema }),
  PSF.createPlatformServiceFeature,
);

router.get('/services/:serviceId/features', PSF.listPlatformServiceFeatures);

router.patch(
  '/services/features/:id',
  validate({
    params: platformServiceFeatureIdParamSchema,
    body: updatePlatformServiceFeatureSchema,
  }),
  PSF.updatePlatformServiceFeature,
);

router.delete(
  '/services/features/:id',
  validate({ params: platformServiceFeatureIdParamSchema }),
  PSF.deletePlatformServiceFeature,
);

// ================= PLATFORM SERVICE PROVIDERS (AZZUNIQUE ONLY) =================

router.post(
  '/services/providers',
  validate({ body: assignPlatformServiceProviderSchema }),
  PSP.assignPlatformServiceProvider,
);

router.delete(
  '/services/:serviceId/providers',
  PSP.disablePlatformServiceProvider,
);

export default router;
