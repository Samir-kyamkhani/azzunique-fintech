import { Router } from 'express';
import {
  getServerDetailById,
  upsertServerDetail,
} from '../controllers/serverDetail.controller.js';
import { validate } from '../middleware/zod-validate.js';
import {
  idParamSchema,
  serverDetailSchema,
} from '../validators/serverDetail.schema.js';
import asyncHandler from '../lib/AsyncHandler.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(AuthMiddleware);

router.post(
  '/',
  validate({ body: serverDetailSchema }),
  asyncHandler(upsertServerDetail),
);

// GET BY actor 's tenantId
router.get('/', asyncHandler(getServerDetailById));

export default router;
