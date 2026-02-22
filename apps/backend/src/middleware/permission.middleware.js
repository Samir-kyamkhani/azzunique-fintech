import { resolvePermissions } from '../services/permission.resolver.js';
import { ApiError } from '../lib/ApiError.js';

export const PermissionMiddleware = (required, options = {}) => {
  if (!required) {
    throw new Error('PermissionMiddleware requires a permission key');
  }

  const { mode = 'OR' } = options; // OR | AND

  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      //  Resolve once per request
      if (!req.user._resolvedPermissions) {
        req.user._resolvedPermissions = await resolvePermissions(req.user);
      }

      const permissions = req.user._resolvedPermissions;

      //  Super permission
      if (permissions.includes('*')) {
        return next();
      }

      //  Multiple permissions
      if (Array.isArray(required)) {
        let allowed = false;

        if (mode === 'OR') {
          allowed = required.some((perm) => permissions.includes(perm));
        }

        if (mode === 'AND') {
          allowed = required.every((perm) => permissions.includes(perm));
        }

        if (!allowed) {
          throw ApiError.forbidden(`Permission denied (${mode} check failed)`);
        }

        return next();
      }

      //  Single permission
      if (!permissions.includes(required)) {
        throw ApiError.forbidden('Permission denied');
      }

      return next();
    } catch (error) {
      next(error);
    }
  };
};
