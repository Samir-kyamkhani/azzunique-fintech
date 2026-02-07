import { Router } from 'express';
import { validate } from '../middleware/zod-validate.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

import * as TS from '../controllers/tenantService.controller.js';

import { enableTenantServiceSchema } from '../validators/tenantService.schema.js';

const router = Router();
router.use(AuthMiddleware);

router.post(
  '/:tenantId/services',
  validate({ body: enableTenantServiceSchema }),
  TS.enableTenantService,
);

router.get('/:tenantId/services', TS.listTenantServices);

export default router;
