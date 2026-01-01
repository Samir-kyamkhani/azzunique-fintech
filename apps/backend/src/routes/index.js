import { Router } from 'express';
import tenantRoutes from './tenant.routes.js';

const router = Router();

router.use('/tenants', tenantRoutes);

export default router;
