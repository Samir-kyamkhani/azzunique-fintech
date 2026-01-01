import { ApiError } from '../lib/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    throw ApiError.badRequest(
      'Validation failed',
      400,
      err.errors?.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    );
  }
};
