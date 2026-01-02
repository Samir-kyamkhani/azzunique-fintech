import { AuditLogService } from '../services/auditLog.service.js';

const getAuditLogs = async (req, res) => {
  const logs = await AuditLogService.getAll(req.query);
  res.json(logs);
};

const deleteAuditLog = async (req, res) => {
  await AuditLogService.delete(req.params.id);
  res.json({ message: 'Audit log deleted' });
};

export { getAuditLogs, deleteAuditLog };
