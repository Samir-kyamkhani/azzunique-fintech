import { Router } from 'express';
import { validate } from '../../middleware/zod-validate.js';
import { AuthMiddleware } from '../../middleware/auth.middleware.js';
import { fetchRechargePlans } from '../../controllers/recharge/rechargePlan.controller.js';
import { fetchRechargeOffers } from '../../controllers/recharge/rechargeOffer.controller.js';
import { initiateRecharge } from '../../controllers/recharge/rechargeTransaction.controller.js';
import { rechargeCallback } from '../../controllers/recharge/rechargeCallback.controller.js';
import { rechargePlanSchema } from '../../validators/recharge/rechargePlan.schema.js';
import { rechargeOfferSchema } from '../../validators/recharge/rechargeOffer.schema.js';
import { rechargeTransactionSchema } from '../../validators/recharge/rechargeTransaction.schema.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const callbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});

router.use(AuthMiddleware);

const rechargeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
});

// MPLAN — FETCH PLANS GET /api/recharge/plans
router.get('/plans', validate(rechargePlanSchema, 'query'), fetchRechargePlans);

// MPLAN — FETCH OFFERS GET /api/recharge/offers
router.get(
  '/offers',
  validate(rechargeOfferSchema, 'query'),
  fetchRechargeOffers,
);

// RECHARGE TRANSACTION POST /api/recharge
router.post(
  '/',
  rechargeLimiter,
  validate(rechargeTransactionSchema),
  initiateRecharge,
);

// PUBLIC CALLBACK (NO AUTH) RechargeExchange will hit this
router.get('/callback', callbackLimiter, rechargeCallback);

export default router;
