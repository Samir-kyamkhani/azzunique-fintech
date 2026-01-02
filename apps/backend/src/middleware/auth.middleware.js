import jwt from 'jsonwebtoken';
import { ApiError } from '../lib/ApiError.js';

export const AuthMiddleware = (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication token missing');
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (!decoded?.sub || !decoded?.tenantId || !decoded?.type) {
      throw ApiError.unauthorized('Invalid token payload');
    }

    const requestTenant = req.headers['x-tenant-id'] || req.body?.tenantId;

    if (requestTenant && requestTenant !== decoded.tenantId) {
      throw ApiError.forbidden('Tenant mismatch');
    }

    req.user = {
      id: decoded.sub,
      tenantId: decoded.tenantId,
      type: decoded.type,

      roleId: decoded.type === 'USER' ? decoded.roleId : null,
      departmentId: decoded.type === 'EMPLOYEE' ? decoded.departmentId : null,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      next(ApiError.unauthorized('Token expired'));
    } else if (err.name === 'JsonWebTokenError') {
      next(ApiError.unauthorized('Invalid token'));
    } else {
      next(err);
    }
  }
};
