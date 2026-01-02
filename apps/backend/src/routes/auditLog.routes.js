import { Router } from 'express';
import { validate } from '../middleware/zod-validate.js';

import {
  getAuditLogs,
  deleteAuditLog,
} from '../controllers/auditLog.controller.js';

import { getAuditLogsSchema } from '../validators/auditLog.schema.js';

const router = Router();

router.get('/', validate(getAuditLogsSchema), getAuditLogs);

router.delete('/:id', deleteAuditLog);

export default router;
