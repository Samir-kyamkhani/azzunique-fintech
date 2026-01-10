import roleHierarchyService from '../services/roleHierarchy.service.js';

export const createRoleHierarchy = async (req, res) => {
  const result = await roleHierarchyService.create(req.body, req.user);
  res.status(201).json(result);
};

export const listRoleHierarchy = async (req, res) => {
  const result = await roleHierarchyService.findAll(req.user);
  res.json(result);
};

export const deleteRoleHierarchy = async (req, res) => {
  const result = await roleHierarchyService.delete(req.body, req.user);
  res.json(result);
};
