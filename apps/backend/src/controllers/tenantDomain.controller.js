import { TenantDomainService } from '../services/tenantDomain.service.js';

export const createTenantDomain = async (req, res) => {
  const domain = await TenantDomainService.create(req.body);
  res.status(201).json(domain);
};

export const updateTenantDomain = async (req, res) => {
  const domain = await TenantDomainService.update(req.params.id, req.body);
  res.json(domain);
};

export const deleteTenantDomain = async (req, res) => {
  const { actionReason } = req.body;
  await TenantDomainService.softDelete(req.params.id, actionReason);
  res.status(200).json({ message: 'Domain deleted successfully' });
};

export const changeTenantDomainStatus = async (req, res) => {
  const domain = await TenantDomainService.updateStatus(
    req.params.id,
    req.body,
  );
  res.json(domain);
};

export const getTenantDomains = async (req, res) => {
  const domains = await TenantDomainService.getAll();
  res.json(domains);
};

export const getTenantDomainById = async (req, res) => {
  const domain = await TenantDomainService.getById(req.params.id);
  res.json(domain);
};
