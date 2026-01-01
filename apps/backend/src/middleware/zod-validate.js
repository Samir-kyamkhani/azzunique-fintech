import { ApiError } from '../lib/ApiError.js';
import { ZodError } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return next(
        ApiError.badRequest(
          'Validation failed',
          err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        ),
      );
    }

    next(err);
  }
};
