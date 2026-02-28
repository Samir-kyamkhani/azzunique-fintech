import { Router } from 'express';
import { validate } from '../../middleware/zod-validate.js';
import { AuthMiddleware } from '../../middleware/auth.middleware.js';
import { fetchRechargePlans } from '../../controllers/recharge/rechargePlan.controller.js';
import { fetchRechargeOffers } from '../../controllers/recharge/rechargeOffer.controller.js';
import {
  fetchRechargeHistory,
  initiateRecharge,
  retryRecharge,
} from '../../controllers/recharge/rechargeTransaction.controller.js';
import { rechargePlanSchema } from '../../validators/recharge/rechargePlan.schema.js';
import { rechargeOfferSchema } from '../../validators/recharge/rechargeOffer.schema.js';
import { rechargeTransactionSchema } from '../../validators/recharge/rechargeTransaction.schema.js';
import rateLimit from 'express-rate-limit';
import { fetchOperatorsByFeature } from '../../controllers/recharge/rechargeOperator.controller.js';
import { rechargeHistoryQuerySchema } from '../../validators/recharge/rechargeHistory.schema.js';

const router = Router();

router.use(AuthMiddleware);

const rechargeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
});

// RECHARGE HISTORY GET /api/recharge/history
router.get(
  '/history',
  validate({ query: rechargeHistoryQuerySchema }),
  fetchRechargeHistory,
);

// MPLAN — FETCH PLANS GET /api/recharge/plans
router.get(
  '/plans',
  validate({ query: rechargePlanSchema }),
  fetchRechargePlans,
);

// MPLAN — FETCH OFFERS GET /api/recharge/offers (agar future me offer bhi lana hua to)
// router.get(
//   '/offers',
//   validate({ query: rechargeOfferSchema }),
//   fetchRechargeOffers,
// );

// RECHARGE TRANSACTION POST /api/recharge
router.post(
  '/',
  rechargeLimiter,
  validate({ body: rechargeTransactionSchema }),
  initiateRecharge,
);

// RECHARGE OPERATORS GET /api/recharge/operators/:feature
router.get('/operators/:feature', fetchOperatorsByFeature);

// RECHARGE TRANSACTION RETRY POST /api/recharge/:transactionId/retry
router.post('/:transactionId/retry', rechargeLimiter, retryRecharge);

export default router;
