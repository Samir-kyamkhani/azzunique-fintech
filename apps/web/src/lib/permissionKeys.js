const RESOURCES = Object.freeze({
  USER: "USER",
  ROLE: "ROLE",
  TENANT: "TENANT",
  WALLET: "WALLET",
  DASHBOARD: "DASHBOARD",
  COMMISSION: "COMMISSION",
  EMPLOYEE: "EMPLOYEE",
  DEPARTMENT: "DEPARTMENT",
  SERVER: "SERVER",
  SMTP: "SMTP",
  DOAMIN: "DOMAIN",
  WEBSITE: "WEBSITE",
  SOCIAl_MEDIA: "SOCIAL_MEDIA",
  PERMISSION: "PERMISSION",
});

const ACTIONS = Object.freeze({
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  APPROVE: "APPROVE",
});

export const PERMISSIONS = {
  USER: {
    CREATE: { resource: RESOURCES.USER, action: ACTIONS.CREATE },
    READ: { resource: RESOURCES.USER, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.USER, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.USER, action: ACTIONS.DELETE },
    APPROVE: { resource: RESOURCES.USER, action: ACTIONS.APPROVE },
  },
  ROLE: {
    CREATE: { resource: RESOURCES.ROLE, action: ACTIONS.CREATE },
    READ: { resource: RESOURCES.ROLE, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.ROLE, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.ROLE, action: ACTIONS.DELETE },
  },
  TENANT: {
    CREATE: { resource: RESOURCES.TENANT, action: ACTIONS.CREATE },
    READ: { resource: RESOURCES.TENANT, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.TENANT, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.TENANT, action: ACTIONS.DELETE },
  },
  WALLET: {
    READ: { resource: RESOURCES.WALLET, action: ACTIONS.READ },
  },
  DASHBOARD: {
    VIEW: { resource: RESOURCES.DASHBOARD, action: ACTIONS.READ },
  },
  COMMISSION: {
    CREATE: { resource: RESOURCES.COMMISSION, action: ACTIONS.CREATE },
    READ: { resource: RESOURCES.COMMISSION, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.COMMISSION, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.COMMISSION, action: ACTIONS.DELETE },
  },
  EMPLOYEE: {
    CREATE: { resource: RESOURCES.EMPLOYEE, action: ACTIONS.CREATE },
    READ: { resource: RESOURCES.EMPLOYEE, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.EMPLOYEE, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.EMPLOYEE, action: ACTIONS.DELETE },
  },
  DEPARTMENT: {
    CREATE: { resource: RESOURCES.DEPARTMENT, action: ACTIONS.CREATE },
    READ: { resource: RESOURCES.DEPARTMENT, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.DEPARTMENT, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.DEPARTMENT, action: ACTIONS.DELETE },
  },
  SERVER: {
    CREATE: { resource: RESOURCES.SERVER, action: ACTIONS.CREATE },
    READ: { resource: RESOURCES.SERVER, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.SERVER, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.SERVER, action: ACTIONS.DELETE },
  },
  SMTP: {
    CREATE: { resource: RESOURCES.SMTP, action: ACTIONS.CREATE },
    READ: { resource: RESOURCES.SMTP, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.SMTP, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.SMTP, action: ACTIONS.DELETE },
  },
  DOAMIN: {
    CREATE: { resource: RESOURCES.DOAMIN, action: ACTIONS.CREATE },
    READ: { resource: RESOURCES.DOAMIN, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.DOAMIN, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.DOAMIN, action: ACTIONS.DELETE },
  },
  WEBSITE: {
    CREATE: { resource: RESOURCES.WEBSITE, action: ACTIONS.CREATE },
    READ: { resource: RESOURCES.WEBSITE, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.WEBSITE, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.WEBSITE, action: ACTIONS.DELETE },
  },
  SOCIAl_MEDIA: {
    CREATE: { resource: RESOURCES.SOCIAl_MEDIA, action: ACTIONS.CREATE },
    READ: { resource: RESOURCES.SOCIAl_MEDIA, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.SOCIAl_MEDIA, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.SOCIAl_MEDIA, action: ACTIONS.DELETE },
  },
  PERMISSIONS: {
    CREATE: { resource: RESOURCES.PERMISSION, action: ACTIONS.CREATE },
    READ: { resource: RESOURCES.PERMISSION, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.PERMISSION, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.PERMISSION, action: ACTIONS.DELETE },
  },
};
