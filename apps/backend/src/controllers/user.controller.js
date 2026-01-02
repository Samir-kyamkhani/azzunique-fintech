import userService from '../services/user.service.js';

export const createUser = async (req, res) => {
  const data = await userService.create(req.body, req.user);
  res.status(201).json(data);
};

export const findAllUsers = async (req, res) => {
  const data = await userService.findAll(req.query, req.user);
  res.json(data);
};

export const findUser = async (req, res) => {
  const data = await userService.findOne(req.params.id, req.user);
  res.json(data);
};

export const updateUser = async (req, res) => {
  await userService.update(req.params.id, req.body, req.user);
  res.json(null);
};

export const getDirectChildren = async (req, res) => {
  const data = await userService.getDirectChildren(req.params.id, req.user);
  res.json(data);
};

export const getAllDescendants = async (req, res) => {
  const data = await userService.getAllDescendants(req.params.id, req.user);
  res.json(data);
};
