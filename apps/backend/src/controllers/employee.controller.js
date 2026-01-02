import { EmployeeService } from '../services/employee.service.js';

export const createEmployee = async (req, res, next) => {
  try {
    const employee = await EmployeeService.create(req.body);
    res.status(201).json(employee);
  } catch (err) {
    next(err);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await EmployeeService.update(req.params.id, req.body);
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

export const changeEmployeeStatus = async (req, res, next) => {
  try {
    const employee = await EmployeeService.updateStatus(
      req.params.id,
      req.body,
    );
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await EmployeeService.getById(req.params.id);
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

export const getEmployees = async (req, res, next) => {
  try {
    const employees = await EmployeeService.getAll(req.params.tenantId);
    res.json(employees);
  } catch (err) {
    next(err);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    await EmployeeService.hardDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
