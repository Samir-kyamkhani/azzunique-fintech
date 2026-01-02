import { TenantService } from '../services/tenant.service.js';

const createTenant = async (req, res) => {
  const tenant = await TenantService.create(req.body, req.user);

  console.log(tenant);

  res
    .status(201)
    .json({ data: tenant, message: 'Tenant created successfully' });
};

const getTenants = async (req, res) => {
  const tenants = await TenantService.getAll(req.query, req.user);

  res.json({
    data: tenants,
    message: 'Tenant fetched successfully',
  });
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
