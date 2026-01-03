import { Router } from 'express';
import {
  createTenant,
  getTenantById,
  updateTenant,
  getAllTenants,
  getTenantDescendants,
} from '../controllers/tenant.controller.js';
import { validate } from '../middleware/zod-validate.js';
import {
  createTenantSchema,
  idParamSchema,
  updateTenantSchema,
} from '../validators/tenant.schema.js';
import asyncHandler from '../lib/AsyncHandler.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Auth applied to all routes
router.use(AuthMiddleware);

// ================= CRUD =================
router.post(
  '/',
  validate({ body: createTenantSchema }),
  asyncHandler(createTenant),
);

router.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(getTenantById),
);

router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateTenantSchema }),
  asyncHandler(updateTenant),
);

// ================= CHILDREN / GRANDCHILDREN =================
// Own children of logged-in actor
router.get('/', asyncHandler(getAllTenants));

// Children
router.get('/:tenantId/descendants', asyncHandler(getTenantDescendants));

export default router;
