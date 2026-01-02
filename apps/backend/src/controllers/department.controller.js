import { DepartmentService } from '../services/department.service.js';

export const createDepartment = async (req, res, next) => {
  try {
    const department = await DepartmentService.create(req.body);
    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const department = await DepartmentService.update(req.params.id, req.body);
    res.json(department);
  } catch (err) {
    next(err);
  }
};

export const changeDepartmentStatus = async (req, res, next) => {
  try {
    const department = await DepartmentService.updateStatus(
      req.params.id,
      req.body,
    );
    res.json(department);
  } catch (err) {
    next(err);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await DepartmentService.getById(req.params.id);
    res.json(department);
  } catch (err) {
    next(err);
  }
};

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await DepartmentService.getAll(req.params.tenantId);
    res.json(departments);
  } catch (err) {
    next(err);
  }
};
