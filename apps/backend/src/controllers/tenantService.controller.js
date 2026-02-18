import tenantService from '../services/tenantService.service.js';

export const enableTenantService = async (req, res) => {
  res.status(201).json(await tenantService.enable(req.body, req.user));
};

export const disableTenantService = async (req, res) => {
  const result = await tenantService.disable(
    req.params.tenantId,
    req.params.platformServiceId,
    req.user,
  );

  res.status(200).json(result);
};

export const listAllTenantServices = async (req, res) => {
  const result = await tenantService.listAll(req.user);
  res.json(result);
};
