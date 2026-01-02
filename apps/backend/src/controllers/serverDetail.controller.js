import { ServerDetailService } from '../services/serverDetail.service.js';

export const createServerDetail = async (req, res) => {
  const server = await ServerDetailService.create(req.body);
  res.status(201).json(server);
};

export const updateServerDetail = async (req, res) => {
  const server = await ServerDetailService.update(req.params.id, req.body);
  res.json(server);
};

export const deleteServerDetail = async (req, res) => {
  await ServerDetailService.softDelete(req.params.id);
  res.status(200).json({ message: 'Server detail marked as INACTIVE' });
};

export const changeServerDetailStatus = async (req, res) => {
  const server = await ServerDetailService.updateStatus(
    req.params.id,
    req.body,
  );
  res.json(server);
};

export const getServerDetails = async (req, res) => {
  const servers = await ServerDetailService.getAll();
  res.json(servers);
};

export const getServerDetailById = async (req, res) => {
  const server = await ServerDetailService.getById(req.params.id);
  res.json(server);
};
