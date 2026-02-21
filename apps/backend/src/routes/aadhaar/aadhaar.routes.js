import { Router } from 'express';
import { AuthMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/zod-validate.js';

import {
  sendOtp,
  upload,
  verifyAadhaar,
} from '../../controllers/aadhaar/aadhaar.controller.js';

import {
  sendOtpSchema,
  verifyOtpSchema,
} from '../../validators/aadhaar/aadhaar.schema.js';
import { PermissionMiddleware } from '../../middleware/permission.middleware.js';
import { PermissionsRegistry } from '../../lib/PermissionsRegistry.js';
import asyncHandler from '../../lib/AsyncHandler.js';

const router = Router();

router.use(AuthMiddleware);

/**
 * SEND OTP OR INITIATE MANUAL FLOW
 */
router.post(
  '/send-otp',
  PermissionMiddleware([
    PermissionsRegistry.SERVICES.AADHAAR.API_CREATE,
    PermissionsRegistry.SERVICES.AADHAAR.MANUAL_CREATE,
  ]),
  validate({ body: sendOtpSchema }),
  asyncHandler(sendOtp),
);

/**
 * VERIFY (OTP or Manual Submit)
 */
router.post(
  '/verify',
  PermissionMiddleware(PermissionsRegistry.SERVICES.AADHAAR.VERIFY),
  validate({ body: verifyOtpSchema }),
  asyncHandler(verifyAadhaar),
);
router.post('/decode-photo', upload);

export default router;
