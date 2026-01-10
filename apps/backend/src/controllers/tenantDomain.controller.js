import { TenantDomainService } from '../services/tenantDomain.service.js';

export const createTenantDomain = async (req, res) => {
  const domain = await TenantDomainService.upsertByTenant(req.body, req.user);
  res.status(201).json(domain);
};

export const getTenantId = async (req, res) => {
  const domain = await TenantDomainService.getByTenantId(req.params.tenantId);
  res.json(domain);
};
