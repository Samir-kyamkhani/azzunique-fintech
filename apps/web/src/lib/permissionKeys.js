export const RESOURCES = Object.freeze({
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
  WEBSITE: "WEBSITE",
  DOMAIN: "DOMAIN",
  SOCIAL_MEDIA: "SOCIAL_MEDIA",
  PERMISSION: "PERMISSION",
  PLATFORM: "PLATFORM",
});

export const ACTIONS = Object.freeze({
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  ASSIGN_PERMISSIONS: "ASSIGN_PERMISSIONS",
  DELETE: "DELETE",
  APPROVE: "APPROVE",
});

export const PERMISSIONS = {
  USER: {
    READ: { resource: RESOURCES.USER, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.USER, action: ACTIONS.UPDATE },
    ASSIGN_PERMISSIONS: {
      resource: RESOURCES.USER,
      action: ACTIONS.ASSIGN_PERMISSIONS,
    },
  },
  ROLE: {
    READ: { resource: RESOURCES.ROLE, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.ROLE, action: ACTIONS.CREATE },
    UPDATE: { resource: RESOURCES.ROLE, action: ACTIONS.UPDATE },
    ASSIGN_PERMISSIONS: {
      resource: RESOURCES.ROLE,
      action: ACTIONS.ASSIGN_PERMISSIONS,
    },
  },
  TENANT: {
    READ: { resource: RESOURCES.TENANT, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.TENANT, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.TENANT, action: ACTIONS.UPDATE },
  },
  DASHBOARD: {
    READ: { resource: RESOURCES.DASHBOARD, action: ACTIONS.READ },
  },
  COMMISSION: {
    READ: { resource: RESOURCES.COMMISSION, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.COMMISSION, action: ACTIONS.UPDATE },
  },
  EMPLOYEE: {
    READ: { resource: RESOURCES.EMPLOYEE, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.EMPLOYEE, action: ACTIONS.UPDATE },
  },
  DEPARTMENT: {
    READ: { resource: RESOURCES.DEPARTMENT, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.DEPARTMENT, action: ACTIONS.UPDATE },
  },
  SERVER: {
    READ: { resource: RESOURCES.SERVER, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.SERVER, action: ACTIONS.UPDATE },
  },
  SMTP: {
    READ: { resource: RESOURCES.SMTP, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.SMTP, action: ACTIONS.UPDATE },
  },
  DOMAIN: {
    READ: { resource: RESOURCES.DOMAIN, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.DOMAIN, action: ACTIONS.UPDATE },
  },
  WEBSITE: {
    READ: { resource: RESOURCES.WEBSITE, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.WEBSITE, action: ACTIONS.UPDATE },
  },
  SOCIAL_MEDIA: {
    READ: { resource: RESOURCES.SOCIAL_MEDIA, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.SOCIAL_MEDIA, action: ACTIONS.UPDATE },
  },
  PERMISSION: {
    READ: { resource: RESOURCES.PERMISSION, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.PERMISSION, action: ACTIONS.UPDATE },
  },
  PLATFORM: {
    SERVICES: {
      READ: { resource: RESOURCES.PLATFORM, action: ACTIONS.READ },
      UPDATE: { resource: RESOURCES.PLATFORM, action: ACTIONS.UPDATE },
    },

    PROVIDERS: {
      READ: { resource: RESOURCES.PLATFORM, action: ACTIONS.READ },
      UPDATE: { resource: RESOURCES.PLATFORM, action: ACTIONS.UPDATE },
    },

    TENANTS: {
      READ: { resource: RESOURCES.PLATFORM, action: ACTIONS.READ },
      UPDATE: { resource: RESOURCES.PLATFORM, action: ACTIONS.UPDATE },
    },
  },
};
