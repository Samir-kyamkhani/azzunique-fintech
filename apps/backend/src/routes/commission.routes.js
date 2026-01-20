import { Router } from 'express';
import asyncHandler from '../lib/AsyncHandler.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/zod-validate.js';
import { PermissionMiddleware } from '../middleware/permission.middleware.js';
import { PermissionsRegistry } from '../lib/PermissionsRegistry.js';

import {
  setUserCommission,
  setRoleCommission,
} from '../controllers/commission.controller.js';

import {
  createUserCommissionSchema,
  createRoleCommissionSchema,
} from '../validators/commission.schema.js';

const router = Router();

router.use(AuthMiddleware);

router.post(
  '/user',
  PermissionMiddleware(PermissionsRegistry.COMMISSION.SET_USER_RULE),
  validate({ body: createUserCommissionSchema }),
  asyncHandler(setUserCommission),
);

router.post(
  '/role',
  PermissionMiddleware(PermissionsRegistry.COMMISSION.SET_ROLE_RULE),
  validate({ body: createRoleCommissionSchema }),
  asyncHandler(setRoleCommission),
);

export default router;
