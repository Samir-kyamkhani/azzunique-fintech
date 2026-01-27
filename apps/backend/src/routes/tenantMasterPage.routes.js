import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import {
  masterPageIdParamSchema,
  upsertMasterPageSchema,
} from '../validators/tenantMasterPage.schema.js';
import {
  deleteMasterPage,
  findAllMasterPages,
  findMasterPage,
  upsertMasterPage,
} from '../controllers/tenantMasterPage.controller.js';
import { validate } from '../middleware/zod-validate.js';
import asyncHandler from '../lib/AsyncHandler.js';

const router = Router();
router.use(AuthMiddleware);

router.post(
  '/upsert',
  validate({ body: upsertMasterPageSchema }),
  asyncHandler(upsertMasterPage),
);

router.get('/', asyncHandler(findAllMasterPages));
router.get(
  '/:id',
  validate({ params: masterPageIdParamSchema }),
  asyncHandler(findMasterPage),
);

router.delete(
  '/:id',
  validate({ params: masterPageIdParamSchema }),
  asyncHandler(deleteMasterPage),
);

export default router;
