import tspService from '../services/tenantServiceProvider.service.js';

export const assignTenantServiceProvider = async (req, res) => {
  const result = await tspService.assign(
    req.params.tenantId,
    req.body,
    req.user,
  );
  res.status(201).json(result);
};
