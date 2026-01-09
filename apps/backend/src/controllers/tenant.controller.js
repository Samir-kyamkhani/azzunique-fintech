import { TenantService } from '../services/tenant.service.js';

// ================= CREATE =================
const createTenant = async (req, res) => {
  const tenant = await TenantService.create(req.body, req.user);

  res
    .status(201)
    .json({ data: tenant, message: 'Tenant created successfully' });
};

// ================= GET BY ID =================
const getTenantById = async (req, res) => {
  const tenant = await TenantService.getById(req.params.id);
  res.json({ data: tenant, message: 'Tenant fetched successfully' });
};

// ================= UPDATE =================
const updateTenant = async (req, res) => {
  const tenant = await TenantService.update(req.params.id, req.body);
  res.json({ data: tenant, message: 'Tenant updated successfully' });
};

// ================= GET OWN CHILDREN =================
const getAllTenants = async (req, res) => {
  const result = await TenantService.getAllChildren(req.user, req.query);

  res.json({
    data: result.data,
    meta: result.meta,
    message: 'fetched successfully',
  });
};

// ================= GET CHILDREN + GRANDCHILDREN =================
const getTenantDescendants = async (req, res) => {
  const data = await TenantService.getTenantDescendants(
    req.params,
    req.user,
    req.query,
  );

  res.json({
    data,
    message: 'Descendants fetched successfully',
  });
};

export {
  createTenant,
  getTenantById,
  updateTenant,
  getAllTenants,
  getTenantDescendants,
};
