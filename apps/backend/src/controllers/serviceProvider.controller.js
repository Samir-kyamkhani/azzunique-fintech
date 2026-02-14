import providerService from '../services/serviceProvider.service.js';

export const createServiceProvider = async (req, res) => {
  res.status(201).json(await providerService.create(req.body, req.user));
};

export const listAllServiceProviders = async (req, res) => {
  res.json(await providerService.listAll());
};

export const listServiceProviders = async (req, res) => {
  res.json(await providerService.listByService(req.params.serviceId));
};

export const updateServiceProvider = async (req, res) => {
  res.json(await providerService.update(req.params.id, req.body, req.user));
};

export const deleteServiceProvider = async (req, res) => {
  res.json(await providerService.delete(req.params.id, req.user));
};
