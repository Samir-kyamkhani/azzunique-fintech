import { resolvePermissions } from '../services/permission.resolver.js';
import { ApiError } from '../lib/ApiError.js';

export const PermissionMiddleware = (required) => {
  if (!required) {
    throw new Error('PermissionMiddleware requires a permission key');
  }

  return async (req, res, next) => {
    const permissions = await resolvePermissions(req.user);
    console.log('Resolved Permissions:', permissions);
    console.log('required Permissions:', required);

    if (permissions.includes('*')) {
      return next();
    }

    if (!permissions.includes(required)) {
      throw ApiError.forbidden('Permission denied');
    }

    next();
  };
};
