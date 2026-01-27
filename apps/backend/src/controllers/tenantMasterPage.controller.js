import tenantMasterPageService from '../services/tenantMasterPage.service.js';

export const upsertMasterPage = async (req, res) => {
  const page = await tenantMasterPageService.upsert(req.body, req.user);
  res.status(200).json(page);
};

export const findAllMasterPages = async (req, res) => {
  const pages = await tenantMasterPageService.findAll();
  res.json(pages);
};

export const findMasterPage = async (req, res) => {
  const page = await tenantMasterPageService.findOne(req.params.id);
  res.json(page);
};

export const deleteMasterPage = async (req, res) => {
  await tenantMasterPageService.delete(req.params.id);
  res.status(204).end();
};
