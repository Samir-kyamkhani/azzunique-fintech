import { ApiResponse } from '../lib/ApiResponse.js';
import asyncHandler from '../lib/AsyncHandler.js';
import { TenantService } from '../services/tenant.service.js';

// ================= CREATE =================
const createTenant = asyncHandler(async (req, res) => {
  const tenant = await TenantService.create(req.body);

  res
    .status(201)
    .json(ApiResponse.success(tenant, 'Tenant created successfully', 201));
});

// ================= GET ALL =================
const getTenants = asyncHandler(async (req, res) => {
  const tenants = await TenantService.getAll();

  res.json(ApiResponse.success(tenants, 'Tenants fetched successfully'));
});

// ================= GET BY ID =================
const getTenantById = asyncHandler(async (req, res) => {
  const tenant = await TenantService.getById(req.params.id);

  res.json(ApiResponse.success(tenant, 'Tenant fetched successfully'));
});

// ================= UPDATE =================
const updateTenant = asyncHandler(async (req, res) => {
  const tenant = await TenantService.update(req.params.id, req.body);

  res.json(ApiResponse.success(tenant, 'Tenant updated successfully'));
});

// ================= DELETE =================
const deleteTenant = asyncHandler(async (req, res) => {
  await TenantService.remove(req.params.id);

  res.json(ApiResponse.success(null, 'Tenant deleted successfully'));
});

export { createTenant, getTenants, getTenantById, updateTenant, deleteTenant };
