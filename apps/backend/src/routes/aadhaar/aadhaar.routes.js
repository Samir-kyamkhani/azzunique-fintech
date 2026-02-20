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

const router = Router();

router.use(AuthMiddleware);

/**
 * SEND OTP OR INITIATE MANUAL FLOW
 */
router.post('/send-otp', validate({ body: sendOtpSchema }), sendOtp);

/**
 * VERIFY (OTP or Manual Submit)
 */
router.post('/verify', validate({ body: verifyOtpSchema }), verifyAadhaar);
router.post('/decode-photo', upload);

export default router;
