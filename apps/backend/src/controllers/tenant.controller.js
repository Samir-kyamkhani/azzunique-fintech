import { TenantService } from '../services/tenant.service.js';

const createTenant = async (req, res) => {
  const tenant = await TenantService.create(req.body);
  console.log(tenant);

  res.status(201).json(tenant);
};

const getTenants = async (req, res) => {
  const tenants = await TenantService.getAll();

  res.json(tenants);
};

const getTenantById = async (req, res) => {
  const tenant = await TenantService.getById(req.params.id);
  res.json(tenant);
};

const updateTenant = async (req, res) => {
  const tenant = await TenantService.update(req.params.id, req.body);
  res.json(tenant);
};

export { createTenant, getTenants, getTenantById, updateTenant };
