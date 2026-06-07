import type { RequestHandler } from 'express';
import { NotFoundError } from './errors';

/**
 * Catch-all for requests that matched no route. Mount AFTER all routes and
 * BEFORE the error handler; it throws NotFoundError so the error handler emits
 * the standard ApiResponse with a 404.
 */
export const notFoundHandler: RequestHandler = (req) => {
  throw new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
};
