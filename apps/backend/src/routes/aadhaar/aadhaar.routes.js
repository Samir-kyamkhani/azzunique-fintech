import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { AuthMiddleware } from '../../middleware/auth.middleware.js';
import { rawQueryMiddleware } from '../../middleware/rawQuery.middleware.js';

import { aadhaarCallback } from '../../controllers/aadhaar/aadhaarCallback.controller.js';
import { validate } from '../../middleware/zod-validate.js';
import { sendOtpSchema } from '../../validators/aadhaar/aadhaar.schema.js';
import {
  sendOtp,
  verifyOtp,
} from '../../controllers/aadhaar/aadhaar.controller.js';

const router = Router();

/**
 * 🔐 Auth Required Routes (OTP Send / Verify)
 * Callback route PUBLIC hoga
 */
router.use('/secure', AuthMiddleware);

/**
 * 🚦 Callback rate limiter
 */
const callbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50, // Aadhaar providers thoda zyada retry karte hain
});

router.post('/send-otp', validate({ body: sendOtpSchema }), sendOtp);

router.post('/verify-otp', validate({ body: verifyOtpSchema }), verifyOtp);

/**
 * 🌐 PUBLIC CALLBACK ROUTE
 * Provider hit karega
 * No Auth
 */
router.post(
  '/callback',
  rawQueryMiddleware, // required for HMAC verification
  callbackLimiter,
  aadhaarCallback,
);

export default router;
