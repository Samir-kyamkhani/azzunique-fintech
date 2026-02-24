import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/zod-validate.js';
import asyncHandler from '../lib/AsyncHandler.js';
import upload from '../middleware/multer.middleware.js';

import { getStatus, sendOtp, verify } from '../controllers/kyc.controller.js';

import {
  sendOtpSchema,
  verifyOtpSchema,
  kycTypeParamSchema,
} from '../validators/kyc.schema.js';

import { KycPermissionResolver } from '../middleware/kyc-permission.middleware.js';

const router = Router();

router.use(AuthMiddleware);

/**
 * SEND OTP / INITIATE FLOW
 */
router.post(
  '/:type/send-otp',
  KycPermissionResolver('SEND'),
  validate({
    params: kycTypeParamSchema,
    body: sendOtpSchema,
  }),
  asyncHandler(sendOtp),
);

/**
 * VERIFY
 */
router.post(
  '/:type/verify',
  KycPermissionResolver('VERIFY'),
  upload.fields([{ name: 'profilePhoto' }, { name: 'aadhaarPdf' }]),
  validate({
    params: kycTypeParamSchema,
    body: verifyOtpSchema,
  }),
  asyncHandler(verify),
);

router.get(
  '/:type/status',
  validate({
    params: kycTypeParamSchema,
  }),
  asyncHandler(getStatus),
);

export default router;
