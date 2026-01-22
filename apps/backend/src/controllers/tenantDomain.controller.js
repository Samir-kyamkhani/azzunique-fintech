import { TenantDomainService } from '../services/tenantDomain.service.js';

export const createTenantDomain = async (req, res) => {
  const domain = await TenantDomainService.upsert(req.body, req.user);
  res.status(201).json(domain);
};

export const getTenantId = async (req, res) => {
  const domain = await TenantDomainService.getByTenantId(req.params.tenantId);
  res.json(domain);
};

export const getMyDomain = async (req, res) => {
  const actor = req.user;
  const domain = await TenantDomainService.findByTenant(actor);

  res.json(domain );
};
