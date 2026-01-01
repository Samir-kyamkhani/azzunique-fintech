import { ApiError } from '../lib/ApiError.js';

export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(
        ApiError.badRequest('Validation failed', 400, result.error.issues),
      );
    }

    req[source] = result.data; // sanitized
    next();
  };
