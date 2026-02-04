import { Router } from 'express';
import { validate } from '../../middleware/zod-validate.js';
import { AuthMiddleware } from '../../middleware/auth.middleware.js';
import { fetchRechargePlans } from '../../controllers/recharge/rechargePlan.controller.js';
import { fetchRechargeOffers } from '../../controllers/recharge/rechargeOffer.controller.js';
import { initiateRecharge, retryRecharge } from '../../controllers/recharge/rechargeTransaction.controller.js';
import { rechargeCallback } from '../../controllers/recharge/rechargeCallback.controller.js';
import { rechargePlanSchema } from '../../validators/recharge/rechargePlan.schema.js';
import { rechargeOfferSchema } from '../../validators/recharge/rechargeOffer.schema.js';
import { rechargeTransactionSchema } from '../../validators/recharge/rechargeTransaction.schema.js';
import rateLimit from 'express-rate-limit';
import { rawQueryMiddleware } from '../../middleware/rawQuery.middleware.js';

const router = Router();

const callbackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
});

router.use(AuthMiddleware);

const rechargeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
});

// MPLAN — FETCH PLANS GET /api/recharge/plans
router.get(
  '/plans',
  validate({ query: rechargePlanSchema }),
  fetchRechargePlans,
);

// MPLAN — FETCH OFFERS GET /api/recharge/offers
router.get(
  '/offers',
  validate({ query: rechargeOfferSchema }),
  fetchRechargeOffers,
);

// RECHARGE TRANSACTION POST /api/recharge
router.post(
  '/',
  rechargeLimiter,
  validate({ body: rechargeTransactionSchema }),
  initiateRecharge,
);

// RECHARGE TRANSACTION RETRY POST /api/recharge/:transactionId/retry
router.post('/:transactionId/retry', rechargeLimiter, retryRecharge);

// PUBLIC CALLBACK (NO AUTH) RechargeExchange will hit this
router.get('/callback', rawQueryMiddleware, callbackLimiter, rechargeCallback);

export default router;
