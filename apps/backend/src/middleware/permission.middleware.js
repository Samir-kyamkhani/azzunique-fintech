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

    if (Array.isArray(required)) {
      const allowed = required.some((perm) => permissions.includes(perm));

      if (!allowed) {
        throw ApiError.forbidden('Permission denied');
      }

      return next();
    }

    if (!permissions.includes(required)) {
      throw ApiError.forbidden('Permission denied');
    }

    next();
  };
};
