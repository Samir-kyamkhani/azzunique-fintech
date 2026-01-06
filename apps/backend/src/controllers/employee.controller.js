import { EmployeeService } from '../services/employee.service.js';

const createEmployee = async (req, res, next) => {
  const employee = await EmployeeService.create(req.body, req.user);
  res.status(201).json(employee);
};

const updateEmployee = async (req, res, next) => {
  const employee = await EmployeeService.update(
    req.params.id,
    req.body,
    req.user,
    req.file,
  );
  res.json(employee);
};

const getEmployeeById = async (req, res, next) => {
  const employee = await EmployeeService.getById(req.params.id, req.user);
  res.json(employee);
};

const getAllEmployees = async (req, res, next) => {
  const employees = await EmployeeService.findAll(req.query, req.user);
  res.json(employees);
};

const deleteEmployee = async (req, res, next) => {
  const employee = await EmployeeService.delete(req.params.id, req.user);
  res.json(employee);
};

export {
  createEmployee,
  updateEmployee,
  getEmployeeById,
  getAllEmployees,
  deleteEmployee,
};
