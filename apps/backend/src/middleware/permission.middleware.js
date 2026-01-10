import { resolvePermissions } from '../services/permission.resolver.js';
import { ApiError } from '../lib/ApiError.js';

export const PermissionMiddleware = (required) => {
  return async (req, res, next) => {
    const permissions = await resolvePermissions(req.user);

    if (permissions.includes('*')) {
      return next();
    }

    if (!permissions.includes(required)) {
      throw ApiError.forbidden('Permission denied');
    }

    next();
  };
};
