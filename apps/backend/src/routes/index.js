import { Router } from 'express';
import tenantRoutes from './tenant.route.js';
import tenantDomainRoutes from './tenantDomain.route.js';
import serverDetailRoutes from './serverDetail.route.js';
import smtpConfigRoutes from './smtpConfig.route.js';
import auditLogRoutes from './auditLog.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/tenants', tenantRoutes);
router.use('/tenant-domain', tenantDomainRoutes);
router.use('/server-detail', serverDetailRoutes);
router.use('/smtp-config', smtpConfigRoutes);
router.use('/audit-log', auditLogRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
