import { resolvePermissions } from '../services/permission.resolver.js';
import { ApiError } from '../lib/ApiError.js';

export const PermissionMiddleware = (required) => {
  if (!required) {
    throw new Error('PermissionMiddleware requires a permission key');
  }

  return async (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    req._resolvedPermissions ??= await resolvePermissions(req.user);

    const permissions = req._resolvedPermissions;

    if (permissions.includes('*')) {
      return next();
    }

    console.log(permissions);

    if (!permissions.includes(required)) {
      throw ApiError.forbidden('Permission denied');
    }

    next();
  };
};
