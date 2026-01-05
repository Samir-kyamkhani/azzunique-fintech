import { EmployeeService } from '../services/employee.service.js';

const createEmployee = async (req, res, next) => {
  try {
    const employee = await EmployeeService.create(req.body, req.user);
    res.status(201).json(employee);
  } catch (err) {
    next(err);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employee = await EmployeeService.update(
      req.params.id,
      req.body,
      req.user,
    );
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await EmployeeService.getById(req.params.id, req.user);
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await EmployeeService.getAll(req.params.tenantId);
    res.json(employees);
  } catch (err) {
    next(err);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    await EmployeeService.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export {
  createEmployee,
  updateEmployee,
  getEmployeeById,
  getAllEmployees,
  deleteEmployee,
};
