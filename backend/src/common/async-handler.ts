import type { RequestHandler } from 'express';

/**
 * Wraps an async controller so any thrown/rejected error is forwarded to the
 * global error-handling middleware via `next`.
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
