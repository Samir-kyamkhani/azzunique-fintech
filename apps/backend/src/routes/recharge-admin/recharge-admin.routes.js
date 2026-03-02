import { Router } from 'express';
import { AuthMiddleware } from '../../middleware/auth.middleware.js';
import { PermissionMiddleware } from '../../middleware/permission.middleware.js';
import { PermissionsRegistry } from '../../lib/PermissionsRegistry.js';
import { validate } from '../../middleware/zod-validate.js';

import * as OperatorMap from '../../controllers/recharge-admin/operatorMap.controller.js';
import * as CircleMap from '../../controllers/recharge-admin/circleMap.controller.js';

import { upsertOperatorMapSchema } from '../../validators/recharge-admin/operatorMap.schema.js';
import { upsertCircleMapSchema } from '../../validators/recharge-admin/circleMap.schema.js';

const router = Router();
router.use(AuthMiddleware);

// ✅ OPERATOR MAP CREATE/UPDATE
router.post(
  '/operator-map',
  PermissionMiddleware(
    PermissionsRegistry.SERVICES.RECHARGE.ADMIN.OPERATORS.CREATE,
  ),
  validate({ body: upsertOperatorMapSchema }),
  OperatorMap.upsertOperatorMap,
);

// ✅ OPERATOR MAP LIST
router.get(
  '/operator-map',
  PermissionMiddleware(
    PermissionsRegistry.SERVICES.RECHARGE.ADMIN.OPERATORS.READ,
  ),
  OperatorMap.listOperatorMaps,
);

// ✅ CIRCLE MAP CREATE/UPDATE
router.post(
  '/circle-map',
  PermissionMiddleware(
    PermissionsRegistry.SERVICES.RECHARGE.ADMIN.CIRCLES.CREATE,
  ),
  validate({ body: upsertCircleMapSchema }),
  CircleMap.upsertCircleMap,
);

// ✅ CIRCLE MAP LIST
router.get(
  '/circle-map',
  PermissionMiddleware(
    PermissionsRegistry.SERVICES.RECHARGE.ADMIN.CIRCLES.READ,
  ),
  CircleMap.listCircleMaps,
);

export default router;
