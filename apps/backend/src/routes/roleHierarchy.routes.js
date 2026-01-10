import { Router } from 'express';
import {
  createRoleHierarchy,
  listRoleHierarchy,
  deleteRoleHierarchy,
} from '../controllers/roleHierarchy.controller.js';
import { roleHierarchySchema } from '../validators/roleHierarchy.schema.js';
import asyncHandler from '../lib/AsyncHandler.js';
import { validate } from '../middleware/zod-validate.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
router.use(AuthMiddleware);

router.post(
  '/',
  validate(roleHierarchySchema),
  asyncHandler(createRoleHierarchy),
);

router.get('/', listRoleHierarchy);

router.delete(
  '/',
  validate(roleHierarchySchema),
  asyncHandler(deleteRoleHierarchy),
);

export default router;
