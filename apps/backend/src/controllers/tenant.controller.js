import asyncHandler from '../lib/AsyncHandler.js';
import { TenantService } from '../services/tenant.service.js';

const createTenant = asyncHandler(async (req, res) => {
  const tenant = await TenantService.create(req.body);
  console.log(tenant);

  res.status(201).json(tenant);
});

const getTenants = asyncHandler(async (req, res) => {
  const tenants = await TenantService.getAll();

  res.json(tenants);
});

const getTenantById = asyncHandler(async (req, res) => {
  const tenant = await TenantService.getById(req.params.id);
  res.json(tenant);
});

const updateTenant = asyncHandler(async (req, res) => {
  const tenant = await TenantService.update(req.params.id, req.body);
  res.json(tenant);
});

const deleteTenant = asyncHandler(async (req, res) => {
  await TenantService.remove(req.params.id);
  res.json(null);
});

export { createTenant, getTenants, getTenantById, updateTenant, deleteTenant };
