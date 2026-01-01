import { Router } from 'express';
import {
  createTenant,
  getTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
} from '../controllers/tenant.controller.js';
import { validate } from '../middleware/zod-validate.js';
import {
  createTenantSchema,
  updateTenantSchema,
} from '../validators/tenant.schema.js';

const router = Router();

router.post('/', validate(createTenantSchema), createTenant);

router.get('/', getTenants);

router.get('/:id', getTenantById);

router.put('/:id', validate(updateTenantSchema), updateTenant);

router.delete('/:id', deleteTenant);

export default router;
