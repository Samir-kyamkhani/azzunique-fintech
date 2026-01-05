import {
  employeeActivatedTemplate,
  employeeCreatedTemplate,
  employeeInactiveTemplate,
  employeeSuspendedTemplate,
} from './employees.template.js';

export const MailTemplates = {
  employeeCreated: employeeCreatedTemplate,
  employeeActivated: employeeActivatedTemplate,
  employeeInactive: employeeInactiveTemplate,
  employeeSuspended: employeeSuspendedTemplate,
};
