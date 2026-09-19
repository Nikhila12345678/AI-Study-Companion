import { env } from '../config/env.js';

// Centralized error handler: consistent shape, no stack traces to clients,
// full detail logged server-side for debugging.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const statusCode = err.isApiError ? err.statusCode : 500;
  const message = err.isApiError ? err.message : 'Something went wrong on our end. Please try again.';

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', req.method, req.originalUrl, err);
  }

  res.status(statusCode).json({
    error: {
      message,
      details: err.details,
      ...(env.nodeEnv === 'development' && statusCode >= 500 ? { stack: err.stack } : {})
    }
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: 'Route not found.' } });
}
