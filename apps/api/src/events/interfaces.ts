export interface EmployeeCreatedEvent {
  email: string;
  firstName: string;
  employeeNumber: string;
  password: string;
  tenantId: string;
  tenantName?: string;
  domain: string;
}
