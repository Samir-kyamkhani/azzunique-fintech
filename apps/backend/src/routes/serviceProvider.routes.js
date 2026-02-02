import { Router } from 'express';
import { validate } from '../middleware/zod-validate.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

import * as SP from '../controllers/serviceProvider.controller.js';
import * as SPF from '../controllers/serviceProviderFeature.controller.js';

import {
  createServiceProviderSchema,
  serviceProviderIdParamSchema,
  updateServiceProviderSchema,
} from '../validators/serviceProvider.schema.js';
import {
  mapServiceProviderFeatureSchema,
  serviceProviderFeatureIdParamSchema,
} from '../validators/serviceProviderFeature.schema.js';

const router = Router();
router.use(AuthMiddleware);

// PROVIDERS
router.post(
  '/providers',
  validate({ body: createServiceProviderSchema }),
  SP.createServiceProvider,
);

router.get('/services/:serviceId/providers', SP.listServiceProviders);

router.patch(
  '/providers/:id',
  validate({ params: serviceProviderIdParamSchema }),
  validate({ body: updateServiceProviderSchema }),
  SP.updateServiceProvider,
);

router.delete(
  '/providers/:id',
  validate({ params: serviceProviderIdParamSchema }),
  SP.deleteServiceProvider,
);

// PROVIDER FEATURES (MAPPING)
router.post(
  '/providers/features',
  validate({ body: mapServiceProviderFeatureSchema }),
  SPF.mapServiceProviderFeature,
);

router.get('/providers/:providerId/features', SPF.listServiceProviderFeatures);

router.delete(
  '/providers/features/:id',
  validate({ params: serviceProviderFeatureIdParamSchema }),
  SPF.unmapServiceProviderFeature,
);

export default router;
