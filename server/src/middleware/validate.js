import { ApiError } from '../utils/ApiError.js';

// Validates req.body (or another part of the request) against a Zod schema.
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    throw ApiError.badRequest('Invalid request.', result.error.flatten());
  }
  req[source] = result.data;
  next();
};
