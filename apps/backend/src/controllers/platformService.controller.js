import platformService from '../services/platformService.service.js';

export const createPlatformService = async (req, res) => {
  const data = await platformService.create(req.body, req.user);
  res.status(201).json(data);
};

export const listPlatformServices = async (_req, res) => {
  res.json(await platformService.list());
};
