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
  ADMIN_SERVICES_RECHARGE: "ADMIN_SERVICES_RECHARGE",
});

export const ACTIONS = Object.freeze({
  CREATE: "CREATE",
  UPSERT: "UPSERT",
  READ: "READ",
  UPDATE: "UPDATE",
  ASSIGN_PERMISSIONS: "ASSIGN_PERMISSIONS",
  DELETE: "DELETE",
  APPROVE: "APPROVE",
});

export const PERMISSIONS = {
  USER: {
    READ: { resource: RESOURCES.USER, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.USER, action: ACTIONS.CREATE },
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
    CREATE: { resource: RESOURCES.EMPLOYEE, action: ACTIONS.CREATE },
    UPDATE: { resource: RESOURCES.EMPLOYEE, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.EMPLOYEE, action: ACTIONS.DELETE },
    ASSIGN_PERMISSIONS: {
      resource: RESOURCES.EMPLOYEE,
      action: ACTIONS.ASSIGN_PERMISSIONS,
    },
  },
  DEPARTMENT: {
    READ: { resource: RESOURCES.DEPARTMENT, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.DEPARTMENT, action: ACTIONS.CREATE },
    UPDATE: { resource: RESOURCES.DEPARTMENT, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.DEPARTMENT, action: ACTIONS.DELETE },
    ASSIGN_PERMISSIONS: {
      resource: RESOURCES.DEPARTMENT,
      action: ACTIONS.ASSIGN_PERMISSIONS,
    },
  },
  SERVER: {
    READ: { resource: RESOURCES.SERVER, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.SERVER, action: ACTIONS.UPSERT },
  },
  SMTP: {
    READ: { resource: RESOURCES.SMTP, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.SMTP, action: ACTIONS.CREATE },
    UPDATE: { resource: RESOURCES.SMTP, action: ACTIONS.UPDATE },
  },
  DOMAIN: {
    READ: { resource: RESOURCES.DOMAIN, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.DOMAIN, action: ACTIONS.CREATE },
    UPDATE: { resource: RESOURCES.DOMAIN, action: ACTIONS.UPDATE },
  },
  WEBSITE: {
    READ: { resource: RESOURCES.WEBSITE, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.WEBSITE, action: ACTIONS.CREATE },
    UPDATE: { resource: RESOURCES.WEBSITE, action: ACTIONS.UPDATE },
  },
  SOCIAL_MEDIA: {
    READ: { resource: RESOURCES.SOCIAL_MEDIA, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.SOCIAL_MEDIA, action: ACTIONS.CREATE },
    UPDATE: { resource: RESOURCES.SOCIAL_MEDIA, action: ACTIONS.UPDATE },
  },
  PERMISSION: {
    READ: { resource: RESOURCES.PERMISSION, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.PERMISSION, action: ACTIONS.UPDATE },
  },
  
  PLATFORM: {
    SERVICES: {
      READ: {
        resource: RESOURCES.PLATFORM,
        action: ACTIONS.READ,
      },
      CREATE: {
        resource: RESOURCES.PLATFORM,
        action: ACTIONS.CREATE,
      },
      UPDATE: {
        resource: RESOURCES.PLATFORM,
        action: ACTIONS.UPDATE,
      },
      DELETE: {
        resource: RESOURCES.PLATFORM,
        action: ACTIONS.DELETE,
      },
      ASSIGN_PROVIDER: {
        resource: RESOURCES.PLATFORM,
        action: ACTIONS.ASSIGN_PERMISSIONS,
      },
      DISABLE_PROVIDER: {
        resource: RESOURCES.PLATFORM,
        action: ACTIONS.DISABLE_PROVIDER,
      },
    },

    SERVICE_FEATURES: {
      READ: {
        resource: RESOURCES.PLATFORM_FEATURE,
        action: ACTIONS.READ,
      },
      CREATE: {
        resource: RESOURCES.PLATFORM_FEATURE,
        action: ACTIONS.CREATE,
      },
      UPDATE: {
        resource: RESOURCES.PLATFORM_FEATURE,
        action: ACTIONS.UPDATE,
      },
      DELETE: {
        resource: RESOURCES.PLATFORM_FEATURE,
        action: ACTIONS.DELETE,
      },
    },

    SERVICE_PROVIDERS: {
      READ: {
        resource: RESOURCES.PLATFORM_SERVICE_PROVIDER,
        action: ACTIONS.READ,
      },
      UPDATE: {
        resource: RESOURCES.PLATFORM_SERVICE_PROVIDER,
        action: ACTIONS.UPDATE,
      },
      CREATE: {
        resource: RESOURCES.PLATFORM_SERVICE_PROVIDER,
        action: ACTIONS.CREATE,
      },
      DELETE: {
        resource: RESOURCES.PLATFORM_SERVICE_PROVIDER,
        action: ACTIONS.DELETE,
      },

      VIEW_PROVIDER: {
        resource: RESOURCES.PLATFORM_SERVICE_PROVIDER,
        action: ACTIONS.VIEW_PROVIDER,
      },
    },

    TENANTS: {
      READ: { resource: RESOURCES.PLATFORM, action: ACTIONS.READ },
      UPDATE: { resource: RESOURCES.PLATFORM, action: ACTIONS.UPDATE },
    },
  },

  ADMIN_SERVICES: {
    RECHARGE: {
      READ: {
        resource: RESOURCES.ADMIN_SERVICES_RECHARGE,
        action: ACTIONS.READ,
      },
      UPDATE: {
        resource: RESOURCES.ADMIN_SERVICES_RECHARGE,
        action: ACTIONS.UPDATE,
      },
    },
  },
};
