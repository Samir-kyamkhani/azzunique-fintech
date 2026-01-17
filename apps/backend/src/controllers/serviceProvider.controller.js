import providerService from '../../services/platform/serviceProvider.service.js';

export const createServiceProvider = async (req, res) => {
  const result = await providerService.create(req.body, req.user);
  res.status(201).json(result);
};
