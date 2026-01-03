import { TenantDomainService } from '../services/tenantDomain.service.js';

export const createTenantDomain = async (req, res) => {
  const domain = await TenantDomainService.create(req.body);
  res.status(201).json(domain);
};

export const updateTenantDomain = async (req, res) => {
  const domain = await TenantDomainService.update(req.params.id, req.body);
  res.json(domain);
};

export const getTenantDomains = async (req, res) => {
  const domains = await TenantDomainService.getAll(req.query);
  res.json(domains);
};

export const getTenantDomainById = async (req, res) => {
  const domain = await TenantDomainService.getById(req.params.id);
  res.json(domain);
};
