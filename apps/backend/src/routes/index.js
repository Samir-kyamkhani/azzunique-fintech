import { Router } from 'express';
import tenantRoutes from './tenant.routes.js';
import tenantDomainRoutes from './tenantDomain.routes.js';
import serverDetailRoutes from './serverDetail.routes.js';
import smtpConfigRoutes from './smtpConfig.routes.js';
import auditLogRoutes from './auditLog.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import departmentRoutes from './department.routes.js';
import roleRoutes from './role.routes.js';
import employeeRoutes from './employee.routes.js';
import tenantWebsiteRoutes from './tenantWebsite.routes.js';
import tenantSocialMediaRoutes from './tenantSocialMedia.routes.js';
import rechargeRoutes from './recharge/recharge.routes.js';
import platformRoutes from './platform.routes.js';
import commisionRoutes from './commission.routes.js';

const router = Router();

router.use('/tenants', tenantRoutes);
router.use('/tenant-domain', tenantDomainRoutes);
router.use('/server-detail', serverDetailRoutes);
router.use('/smtp-configs', smtpConfigRoutes);
router.use('/audit-log', auditLogRoutes);
router.use('/auth', authRoutes);
router.use('/members', userRoutes);
router.use('/roles', roleRoutes);
router.use('/departments', departmentRoutes);
router.use('/employees', employeeRoutes);
router.use('/website', tenantWebsiteRoutes);
router.use('/social-media', tenantSocialMediaRoutes);
router.use('/recharge', rechargeRoutes);
router.use('/platform', platformRoutes);
router.use('/commission', commisionRoutes);

export default router;
