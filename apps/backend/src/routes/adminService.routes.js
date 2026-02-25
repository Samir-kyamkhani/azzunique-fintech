import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/zod-validate.js';
import * as Admin from '../controllers/adminService.controller.js';

import {
  serviceIdParamSchema,
  serviceIdOnlyParamSchema,
  featureIdParamSchema,
  providerIdOnlyParamSchema,
  providerIdOnlyParamSchema,
  providerFeatureParamSchema,
  createServiceSchema,
  updateServiceSchema,
  createFeatureSchema,
  updateFeatureSchema,
  createProviderSchema,
  updateProviderSchema,
  assignProviderToServiceSchema,
  updateProviderConfigSchema,
  mapProviderFeatureSchema,
  providerIdParamSchema,
} from '../validators/adminService.schema.js';

const router = Router();
router.use(AuthMiddleware);

/* =======================================================
   GLOBAL PROVIDERS (STATIC ROUTES FIRST)
   ======================================================= */

router.post(
  '/providers',
  validate({ body: createProviderSchema }),
  Admin.createProvider,
);

router.get('/providers', Admin.listAllProviders);

router.patch(
  '/providers/:providerId',
  validate({
    params: providerIdOnlyParamSchema,
    body: updateProviderSchema,
  }),
  Admin.updateProvider,
);

router.delete(
  '/providers/:providerId',
  validate({ params: providerIdOnlyParamSchema }),
  Admin.deleteProvider,
);

/* =======================================================
   SERVICES (STATIC ROOT ROUTES)
   ======================================================= */

router.post('/', validate({ body: createServiceSchema }), Admin.createService);

router.get('/', Admin.listServices);

/* =======================================================
   SERVICE BY ID (DYNAMIC SINGLE PARAM ROUTES)
   ======================================================= */

router.get(
  '/:id',
  validate({ params: serviceIdOnlyParamSchema }),
  Admin.getService,
);

router.patch(
  '/:id',
  validate({
    params: serviceIdOnlyParamSchema,
    body: updateServiceSchema,
  }),
  Admin.updateService,
);

router.delete(
  '/:id',
  validate({ params: serviceIdOnlyParamSchema }),
  Admin.deleteService,
);

/* =======================================================
   SERVICE FEATURES (NESTED ROUTES)
   ======================================================= */

router.post(
  '/:serviceId/features',
  validate({
    params: serviceIdParamSchema,
    body: createFeatureSchema,
  }),
  Admin.createFeature,
);

router.get(
  '/:serviceId/features',
  validate({ params: serviceIdParamSchema }),
  Admin.listFeatures,
);

router.patch(
  '/:serviceId/features/:featureId',
  validate({
    params: featureIdParamSchema,
    body: updateFeatureSchema,
  }),
  Admin.updateFeature,
);

router.delete(
  '/:serviceId/features/:featureId',
  validate({ params: featureIdParamSchema }),
  Admin.deleteFeature,
);

/* =======================================================
   SERVICE ↔ PROVIDER ASSIGNMENT (NESTED)
   ======================================================= */

router.post(
  '/:serviceId/providers',
  validate({
    params: serviceIdParamSchema,
    body: assignProviderToServiceSchema,
  }),
  Admin.assignProviderToService,
);

router.get(
  '/:serviceId/providers',
  validate({ params: serviceIdParamSchema }),
  Admin.listProviders,
);

router.delete(
  '/:serviceId/providers/:providerId',
  validate({ params: providerIdOnlyParamSchema }),
  Admin.unassignProviderFromService,
);

router.patch(
  '/:serviceId/providers/:providerId/config',
  validate({
    params: providerIdParamSchema,
    body: updateProviderConfigSchema,
  }),
  Admin.updateProviderConfig,
);

/* =======================================================
   PROVIDER FEATURE MAPPING (DEEPLY NESTED)
   ======================================================= */

router.post(
  '/providers/:providerId/features',
  validate({
    params: providerIdOnlyParamSchema,
    body: mapProviderFeatureSchema,
  }),
  Admin.mapProviderFeature,
);

router.delete(
  '/:serviceId/providers/:providerId/features/:featureId',
  validate({ params: providerFeatureParamSchema }),
  Admin.unmapProviderFeature,
);

export default router;
