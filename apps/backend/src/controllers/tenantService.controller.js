import tenantService from '../../services/platform/tenantService.service.js';

export const enableTenantService = async (req, res) => {
  const result = await tenantService.enable(
    req.params.tenantId,
    req.body,
    req.user,
  );
  res.status(201).json(result);
};
