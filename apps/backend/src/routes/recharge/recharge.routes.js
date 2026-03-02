import { Router } from 'express';
import { validate } from '../../middleware/zod-validate.js';
import { AuthMiddleware } from '../../middleware/auth.middleware.js';
import { PermissionMiddleware } from '../../middleware/permission.middleware.js';
import { PermissionsRegistry } from '../../lib/PermissionsRegistry.js';

import {
  fetchRechargeOffers,
  fetchRechargePlans,
} from '../../controllers/recharge/rechargePlan.controller.js';

import {
  fetchRechargeHistory,
  initiateRecharge,
} from '../../controllers/recharge/rechargeTransaction.controller.js';

import { rechargePlanSchema } from '../../validators/recharge/rechargePlan.schema.js';
import { rechargeTransactionSchema } from '../../validators/recharge/rechargeTransaction.schema.js';
import { rechargeHistoryQuerySchema } from '../../validators/recharge/rechargeHistory.schema.js';

import rateLimit from 'express-rate-limit';
import { fetchOperatorsByFeature } from '../../controllers/recharge/rechargeOperator.controller.js';

const router = Router();
router.use(AuthMiddleware);

const rechargeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
});

// ✅ RECHARGE HISTORY
router.get(
  '/history',
  PermissionMiddleware(PermissionsRegistry.SERVICES.RECHARGE.READ),
  validate({ query: rechargeHistoryQuerySchema }),
  fetchRechargeHistory,
);

// ✅ FETCH PLANS
router.get(
  '/plans',
  PermissionMiddleware(PermissionsRegistry.SERVICES.RECHARGE.READ),
  validate({ query: rechargePlanSchema }),
  fetchRechargePlans,
);

// MPLAN — FETCH OFFERS GET /api/recharge/offers (agar future me offer bhi lana hua to)
// router.get(
//   '/offers',
//   validate({ query: rechargeOfferSchema }),
//   fetchRechargeOffers,
// );

// ✅ INITIATE RECHARGE
router.post(
  '/',
  rechargeLimiter,
  PermissionMiddleware(PermissionsRegistry.SERVICES.RECHARGE.CREATE),
  validate({ body: rechargeTransactionSchema }),
  initiateRecharge,
);

// ✅ FETCH OPERATORS
router.get(
  '/operators/:feature',
  PermissionMiddleware(PermissionsRegistry.SERVICES.RECHARGE.READ),
  fetchOperatorsByFeature,
);

export default router;
