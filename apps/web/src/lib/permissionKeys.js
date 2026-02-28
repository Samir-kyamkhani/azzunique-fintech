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
  PLATFORM_FEATURE: "PLATFORM_FEATURE",
  PLATFORM_SERVICE_PROVIDER: "PLATFORM_SERVICE_PROVIDER",
  PLATFORM_SERVICE_TENANT: "PLATFORM_SERVICE_TENANT",

  FUND_REQUEST: "FUND_REQUEST",
  RECHARGE: "RECHARGE",
  RECHARGE_OPERATORS: "RECHARGE_OPERATORS",
  RECHARGE_CIRCLES: "RECHARGE_CIRCLES",

  AADHAAR: "AADHAAR",
  PANCARD: "PANCARD",
});

export const ACTIONS = Object.freeze({
  CREATE: "CREATE",
  API_CREATE: "API_CREATE",
  MANUAL_CREATE: "MANUAL_CREATE",
  UPSERT: "UPSERT",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",

  ASSIGN_PERMISSIONS: "ASSIGN_PERMISSIONS",
  ASSIGN_PROVIDER: "ASSIGN_PROVIDER",

  VIEW_DESCENDANTS: "VIEW_DESCENDANTS",
  CHANGE_STATUS: "CHANGE_STATUS",

  APPROVE: "APPROVE",
  RETRY: "RETRY",
  VERIFY: "VERIFY",

  SET_USER_RULE: "SET_USER_RULE",
  SET_ROLE_RULE: "SET_ROLE_RULE",

  DISABLE_PROVIDER: "DISABLE_PROVIDER",
  VIEW_PROVIDER: "VIEW_PROVIDER",
});

export const PERMISSIONS = Object.freeze({
  /* ================= CORE ================= */

  DASHBOARD: {
    READ: { resource: RESOURCES.DASHBOARD, action: ACTIONS.READ },
  },

  USER: {
    READ: { resource: RESOURCES.USER, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.USER, action: ACTIONS.CREATE },
    UPDATE: { resource: RESOURCES.USER, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.USER, action: ACTIONS.DELETE },
    ASSIGN_PERMISSIONS: {
      resource: RESOURCES.USER,
      action: ACTIONS.ASSIGN_PERMISSIONS,
    },
    VIEW_DESCENDANTS: {
      resource: RESOURCES.USER,
      action: ACTIONS.VIEW_DESCENDANTS,
    },
  },

  ROLE: {
    READ: { resource: RESOURCES.ROLE, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.ROLE, action: ACTIONS.CREATE },
    UPDATE: { resource: RESOURCES.ROLE, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.ROLE, action: ACTIONS.DELETE },
    ASSIGN_PERMISSIONS: {
      resource: RESOURCES.ROLE,
      action: ACTIONS.ASSIGN_PERMISSIONS,
    },
  },

  TENANT: {
    READ: { resource: RESOURCES.TENANT, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.TENANT, action: ACTIONS.CREATE },
    UPDATE: { resource: RESOURCES.TENANT, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.TENANT, action: ACTIONS.DELETE },
    VIEW_DESCENDANTS: {
      resource: RESOURCES.TENANT,
      action: ACTIONS.VIEW_DESCENDANTS,
    },
  },

  EMPLOYEE: {
    READ: { resource: RESOURCES.EMPLOYEE, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.EMPLOYEE, action: ACTIONS.CREATE },
    UPDATE: { resource: RESOURCES.EMPLOYEE, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.EMPLOYEE, action: ACTIONS.DELETE },
    CHANGE_STATUS: {
      resource: RESOURCES.EMPLOYEE,
      action: ACTIONS.CHANGE_STATUS,
    },
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

  PERMISSION: {
    READ: { resource: RESOURCES.PERMISSION, action: ACTIONS.READ },
  },

  SERVER: {
    READ: { resource: RESOURCES.SERVER, action: ACTIONS.READ },
    UPSERT: { resource: RESOURCES.SERVER, action: ACTIONS.UPSERT },
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
    DELETE: { resource: RESOURCES.DOMAIN, action: ACTIONS.DELETE },
  },

  WEBSITE: {
    READ: { resource: RESOURCES.WEBSITE, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.WEBSITE, action: ACTIONS.CREATE },
    UPDATE: { resource: RESOURCES.WEBSITE, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.WEBSITE, action: ACTIONS.DELETE },
  },

  SOCIAL_MEDIA: {
    READ: { resource: RESOURCES.SOCIAL_MEDIA, action: ACTIONS.READ },
    CREATE: { resource: RESOURCES.SOCIAL_MEDIA, action: ACTIONS.CREATE },
    UPDATE: { resource: RESOURCES.SOCIAL_MEDIA, action: ACTIONS.UPDATE },
    DELETE: { resource: RESOURCES.SOCIAL_MEDIA, action: ACTIONS.DELETE },
  },

  COMMISSION: {
    READ: { resource: RESOURCES.COMMISSION, action: ACTIONS.READ },
    UPDATE: { resource: RESOURCES.COMMISSION, action: ACTIONS.UPDATE },
    SET_USER_RULE: {
      resource: RESOURCES.COMMISSION,
      action: ACTIONS.SET_USER_RULE,
    },
    SET_ROLE_RULE: {
      resource: RESOURCES.COMMISSION,
      action: ACTIONS.SET_ROLE_RULE,
    },
  },

  /* ================= PLATFORM ================= */

  PLATFORM: {
    SERVICES: {
      READ: { resource: RESOURCES.PLATFORM, action: ACTIONS.READ },
      CREATE: { resource: RESOURCES.PLATFORM, action: ACTIONS.CREATE },
      UPDATE: { resource: RESOURCES.PLATFORM, action: ACTIONS.UPDATE },
      DELETE: { resource: RESOURCES.PLATFORM, action: ACTIONS.DELETE },
      ASSIGN_PROVIDER: {
        resource: RESOURCES.PLATFORM,
        action: ACTIONS.ASSIGN_PROVIDER,
      },
      DISABLE_PROVIDER: {
        resource: RESOURCES.PLATFORM,
        action: ACTIONS.DISABLE_PROVIDER,
      },
    },

    SERVICE_FEATURES: {
      READ: { resource: RESOURCES.PLATFORM_FEATURE, action: ACTIONS.READ },
      CREATE: { resource: RESOURCES.PLATFORM_FEATURE, action: ACTIONS.CREATE },
      UPDATE: { resource: RESOURCES.PLATFORM_FEATURE, action: ACTIONS.UPDATE },
      DELETE: { resource: RESOURCES.PLATFORM_FEATURE, action: ACTIONS.DELETE },
    },

    SERVICE_PROVIDERS: {
      READ: {
        resource: RESOURCES.PLATFORM_SERVICE_PROVIDER,
        action: ACTIONS.READ,
      },
      CREATE: {
        resource: RESOURCES.PLATFORM_SERVICE_PROVIDER,
        action: ACTIONS.CREATE,
      },
      UPDATE: {
        resource: RESOURCES.PLATFORM_SERVICE_PROVIDER,
        action: ACTIONS.UPDATE,
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

    SERVICE_TENANTS: {
      READ: {
        resource: RESOURCES.PLATFORM_SERVICE_TENANT,
        action: ACTIONS.READ,
      },
      CREATE: {
        resource: RESOURCES.PLATFORM_SERVICE_TENANT,
        action: ACTIONS.CREATE,
      },
      UPDATE: {
        resource: RESOURCES.PLATFORM_SERVICE_TENANT,
        action: ACTIONS.UPDATE,
      },
      DELETE: {
        resource: RESOURCES.PLATFORM_SERVICE_TENANT,
        action: ACTIONS.DELETE,
      },
    },
  },

  SERVICES_PAGES: {
    FUND_REQUEST: {
      READ: { resource: RESOURCES.FUND_REQUEST, action: ACTIONS.READ },
      CREATE: { resource: RESOURCES.FUND_REQUEST, action: ACTIONS.CREATE },
      UPDATE: { resource: RESOURCES.FUND_REQUEST, action: ACTIONS.UPDATE },
      APPROVE: { resource: RESOURCES.FUND_REQUEST, action: ACTIONS.APPROVE },
    },

    RECHARGE: {
      READ: { resource: RESOURCES.RECHARGE, action: ACTIONS.READ },
      CREATE: { resource: RESOURCES.RECHARGE, action: ACTIONS.CREATE },
      UPDATE: { resource: RESOURCES.RECHARGE, action: ACTIONS.UPDATE },
      RETRY: { resource: RESOURCES.RECHARGE, action: ACTIONS.RETRY },
      ADMIN: {
        OPERATORS: {
          READ: {
            resource: RESOURCES.RECHARGE_OPERATORS,
            action: ACTIONS.READ,
          },
          CREATE: {
            resource: RESOURCES.RECHARGE_OPERATORS,
            action: ACTIONS.CREATE,
          },
          UPDATE: {
            resource: RESOURCES.RECHARGE_OPERATORS,
            action: ACTIONS.UPDATE,
          },
          DELETE: {
            resource: RESOURCES.RECHARGE_OPERATORS,
            action: ACTIONS.DELETE,
          },
        },
        CIRCLES: {
          READ: {
            resource: RESOURCES.RECHARGE_CIRCLES,
            action: ACTIONS.READ,
          },
          CREATE: {
            resource: RESOURCES.RECHARGE_CIRCLES,
            action: ACTIONS.CREATE,
          },
          UPDATE: {
            resource: RESOURCES.RECHARGE_CIRCLES,
            action: ACTIONS.UPDATE,
          },
          DELETE: {
            resource: RESOURCES.RECHARGE_CIRCLES,
            action: ACTIONS.DELETE,
          },
        },
      },
    },

    PANCARD: {
      READ: { resource: RESOURCES.PANCARD, action: ACTIONS.READ },
      CREATE: { resource: RESOURCES.PANCARD, action: ACTIONS.CREATE },
      UPDATE: { resource: RESOURCES.PANCARD, action: ACTIONS.UPDATE },
    },

    AADHAAR: {
      READ: { resource: RESOURCES.AADHAAR, action: ACTIONS.READ },
      MANUAL_CREATE: {
        resource: RESOURCES.AADHAAR,
        action: ACTIONS.MANUAL_CREATE,
      },
      API_CREATE: {
        resource: RESOURCES.AADHAAR,
        action: ACTIONS.API_CREATE,
      },
      VERIFY: { resource: RESOURCES.AADHAAR, action: ACTIONS.VERIFY },
      UPDATE: { resource: RESOURCES.AADHAAR, action: ACTIONS.UPDATE },
    },
  },
});
