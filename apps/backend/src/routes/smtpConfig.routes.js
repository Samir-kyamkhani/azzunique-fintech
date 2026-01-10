import { Router } from 'express';
import {
  createSmtpConfig,
  updateSmtpConfig,
  getSmtpConfigById,
} from '../controllers/smtpConfig.controller.js';
import { validate } from '../middleware/zod-validate.js';
import {
  createSmtpConfigSchema,
  updateSmtpConfigSchema,
  idParamSchema,
} from '../validators/smtpConfig.schema.js';
import asyncHandler from '../lib/AsyncHandler.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(AuthMiddleware);

// ONE-TIME CREATE
router.post(
  '/',
  validate(createSmtpConfigSchema),
  asyncHandler(createSmtpConfig),
);

// MULTIPLE UPDATE
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateSmtpConfigSchema }),
  asyncHandler(updateSmtpConfig),
);

// GET BY ID (many times)
router.get('/', asyncHandler(getSmtpConfigById));

export default router;
