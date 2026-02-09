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

// ================= PLATFORM SERVICES FEATURES =================
router.post(
  '/features',
  validate({ body: createPlatformServiceFeatureSchema }),
  PSF.createPlatformServiceFeature,
);

router.get('/features', PSF.listPlatformServicesFeatures);

router.patch(
  '/features/:id',
  validate({
    params: platformServiceFeatureIdParamSchema,
    body: updatePlatformServiceFeatureSchema,
  }),
  PSF.updatePlatformServiceFeature,
);

router.delete(
  '/features/:id',
  validate({ params: platformServiceFeatureIdParamSchema }),
  PSF.deletePlatformServiceFeature,
);

// ================= PLATFORM SERVICE PROVIDERS =================
router.post(
  '/providers',
  validate({ body: assignPlatformServiceProviderSchema }),
  PSP.assignPlatformServiceProvider,
);

// ================= NESTED SERVICE ROUTES =================
router.get('/:serviceId/features', PSF.listPlatformServiceFeatures);

router.delete('/:serviceId/providers', PSP.disablePlatformServiceProvider);

// ================= PLATFORM SERVICES =================
router.post(
  '/',
  validate({ body: createPlatformServiceSchema }),
  PSC.createPlatformService,
);

router.get('/', PSC.listPlatformServices);

router.get(
  '/:id',
  validate({ params: platformServiceIdParamSchema }),
  PSC.getPlatformService,
);

router.patch(
  '/:id',
  validate({
    params: platformServiceIdParamSchema,
    body: updatePlatformServiceSchema,
  }),
  PSC.updatePlatformService,
);

router.delete(
  '/:id',
  validate({ params: platformServiceIdParamSchema }),
  PSC.deletePlatformService,
);

export default router;
