import { DepartmentService } from '../services/department.service.js';

const createDepartment = async (req, res, next) => {
  try {
    const department = await DepartmentService.create(req.body, req.user);
    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const department = await DepartmentService.update(req.params.id, req.body);
    res.json(department);
  } catch (err) {
    next(err);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const department = await DepartmentService.getById(req.params.id);
    res.json(department);
  } catch (err) {
    next(err);
  }
};

const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await DepartmentService.getAll(req.user);
    res.json(departments);
  } catch (err) {
    next(err);
  }
};

const delelteDepartment = async (req, res, next) => {
  try {
    const departments = await DepartmentService.delete(req.params.id);
    res.json(departments);
  } catch (err) {
    next(err);
  }
};

export {
  createDepartment,
  updateDepartment,
  getDepartmentById,
  getAllDepartments,
  delelteDepartment,
};
