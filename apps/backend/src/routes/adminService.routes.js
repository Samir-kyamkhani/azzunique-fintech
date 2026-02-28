import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/zod-validate.js';
import * as Admin from '../controllers/adminService.controller.js';

import {
  serviceIdParamSchema,
  serviceIdOnlyParamSchema,
  featureIdParamSchema,
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

import { PermissionMiddleware } from '../middleware/permission.middleware.js';
import { PermissionsRegistry } from '../lib/PermissionsRegistry.js';

const router = Router();
router.use(AuthMiddleware);

/* =======================================================
   GLOBAL PROVIDERS
   ======================================================= */

router.post(
  '/providers',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_PROVIDERS.CREATE),
  validate({ body: createProviderSchema }),
  Admin.createProvider,
);

router.get(
  '/providers',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_PROVIDERS.READ),
  Admin.listAllProviders,
);

router.patch(
  '/providers/:providerId',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_PROVIDERS.UPDATE),
  validate({
    params: providerIdOnlyParamSchema,
    body: updateProviderSchema,
  }),
  Admin.updateProvider,
);

router.delete(
  '/providers/:providerId',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_PROVIDERS.DELETE),
  validate({ params: providerIdOnlyParamSchema }),
  Admin.deleteProvider,
);

/* =======================================================
   SERVICES
   ======================================================= */

router.post(
  '/',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICES.CREATE),
  validate({ body: createServiceSchema }),
  Admin.createService,
);

router.get(
  '/',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICES.READ),
  Admin.listServices,
);

router.get(
  '/:id',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICES.READ),
  validate({ params: serviceIdOnlyParamSchema }),
  Admin.getService,
);

router.patch(
  '/:id',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICES.UPDATE),
  validate({
    params: serviceIdOnlyParamSchema,
    body: updateServiceSchema,
  }),
  Admin.updateService,
);

router.delete(
  '/:id',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICES.DELETE),
  validate({ params: serviceIdOnlyParamSchema }),
  Admin.deleteService,
);

/* =======================================================
   SERVICE FEATURES
   ======================================================= */

router.post(
  '/:serviceId/features',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_FEATURES.CREATE),
  validate({
    params: serviceIdParamSchema,
    body: createFeatureSchema,
  }),
  Admin.createFeature,
);

router.get(
  '/:serviceId/features',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_FEATURES.READ),
  validate({ params: serviceIdParamSchema }),
  Admin.listFeatures,
);

router.patch(
  '/:serviceId/features/:featureId',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_FEATURES.UPDATE),
  validate({
    params: featureIdParamSchema,
    body: updateFeatureSchema,
  }),
  Admin.updateFeature,
);

router.delete(
  '/:serviceId/features/:featureId',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_FEATURES.DELETE),
  validate({ params: featureIdParamSchema }),
  Admin.deleteFeature,
);

/* =======================================================
   SERVICE ↔ PROVIDER ASSIGNMENT
   ======================================================= */

router.post(
  '/:serviceId/providers',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICES.ASSIGN_PROVIDER),
  validate({
    params: serviceIdParamSchema,
    body: assignProviderToServiceSchema,
  }),
  Admin.assignProviderToService,
);

router.get(
  '/:serviceId/providers',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_PROVIDERS.READ),
  validate({ params: serviceIdParamSchema }),
  Admin.listProviders,
);

router.delete(
  '/:serviceId/providers/:providerId',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICES.UNASSIGN_PROVIDER),
  validate({ params: providerIdOnlyParamSchema }),
  Admin.unassignProviderFromService,
);

router.patch(
  '/:serviceId/providers/:providerId/config',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_PROVIDERS.UPDATE),
  validate({
    params: providerIdParamSchema,
    body: updateProviderConfigSchema,
  }),
  Admin.updateProviderConfig,
);

/* =======================================================
   PROVIDER FEATURE MAPPING
   ======================================================= */

router.post(
  '/providers/:providerId/features',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_FEATURES.UPDATE),
  validate({
    params: providerIdOnlyParamSchema,
    body: mapProviderFeatureSchema,
  }),
  Admin.mapProviderFeature,
);

router.delete(
  '/:serviceId/providers/:providerId/features/:featureId',
  PermissionMiddleware(PermissionsRegistry.PLATFORM.SERVICE_FEATURES.DELETE),
  validate({ params: providerFeatureParamSchema }),
  Admin.unmapProviderFeature,
);

export default router;
