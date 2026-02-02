import PlatformService from '../services/platformService.service.js';

export const createPlatformService = async (req, res) => {
  res.json(await PlatformService.create(req.body, req.user));
};

export const listPlatformServices = async (req, res) => {
  res.json(await PlatformService.list());
};

export const getPlatformService = async (req, res) => {
  res.json(await PlatformService.getById(req.params.id));
};

export const updatePlatformService = async (req, res) => {
  res.json(await PlatformService.update(req.params.id, req.body, req.user));
};

export const deletePlatformService = async (req, res) => {
  res.json(await PlatformService.delete(req.params.id, req.user));
};
