import { Router } from 'express';
import asyncHandler from '../lib/AsyncHandler.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/zod-validate.js';

import {
  createRole,
  updateRole,
  deleteRole,
  assignPermissions,
  findAllRoles,
  findRole,
} from '../controllers/role.controller.js';

import {
  roleIdParamSchema,
  createRoleSchema,
  updateRoleSchema,
  assignRolePermissionsSchema,
} from '../validators/role.schema.js';
import { PermissionMiddleware } from '../middleware/permission.middleware.js';
import { PermissionsRegistry } from '../lib/permissionsRegistory.js';

const router = Router();
router.use(AuthMiddleware);

router.post(
  '/',
  validate({ body: createRoleSchema }),
  asyncHandler(createRole),
);

router.get('/', asyncHandler(findAllRoles));

router.get(
  '/:id',
  validate({ params: roleIdParamSchema }),
  asyncHandler(findRole),
);

router.put(
  '/:id',
  validate({ params: roleIdParamSchema, body: updateRoleSchema }),
  asyncHandler(updateRole),
);

router.delete(
  '/:id',
  validate({ params: roleIdParamSchema }),
  asyncHandler(deleteRole),
);

router.post(
  '/:id/permissions',
  validate({
    params: roleIdParamSchema,
    body: assignRolePermissionsSchema,
  }),
  asyncHandler(assignPermissions),
);

export default router;
