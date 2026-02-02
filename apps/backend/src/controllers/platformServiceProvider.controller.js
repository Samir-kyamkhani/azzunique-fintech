import pspService from '../services/platformServiceProviderService.service.js';

export const assignPlatformServiceProvider = async (req, res) => {
  res.status(201).json(await pspService.assign(req.body, req.user));
};

export const disablePlatformServiceProvider = async (req, res) => {
  res.json(await pspService.disable(req.params.serviceId, req.user));
};
