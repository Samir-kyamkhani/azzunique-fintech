import { Router } from 'express';
import tenantRoutes from './tenant.route.js';
import tenantDomainRoutes from './tenantDomain.route.js';
import serverDetailRoutes from './serverDetail.route.js';
import smtpConfigRoutes from './smtpConfig.route.js';

const router = Router();

router.use('/tenants', tenantRoutes);
router.use('/tenant-domain', tenantDomainRoutes);
router.use('/server-detail', serverDetailRoutes);
router.use('/smtp-config', smtpConfigRoutes);

export default router;
