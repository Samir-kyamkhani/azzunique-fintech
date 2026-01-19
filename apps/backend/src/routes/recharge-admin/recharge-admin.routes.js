import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/zod-validate.js';

import * as OperatorMap from '../controllers/recharge-admin/operatorMap.controller.js';
import * as CircleMap from '../controllers/recharge-admin/circleMap.controller.js';

import { upsertOperatorMapSchema } from '../validators/recharge-admin/operatorMap.schema.js';
import { upsertCircleMapSchema } from '../validators/recharge-admin/circleMap.schema.js';

const router = Router();
router.use(AuthMiddleware);

// AZZUNIQUE ONLY
router.post(
  '/operator-map',
  validate(upsertOperatorMapSchema),
  OperatorMap.upsert,
);
router.get('/operator-map', OperatorMap.list);

router.post('/circle-map', validate(upsertCircleMapSchema), CircleMap.upsert);
router.get('/circle-map', CircleMap.list);

export default router;
