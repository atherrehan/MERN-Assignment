import type { ErrorRequestHandler } from 'express';
import { AppError } from './errors';
import { fail } from './api-response';

/**
 * Single place where errors become responses. Mount LAST, after all routes.
 * Known AppErrors use their own statusCode/message; anything else is a 500 with
 * a generic message. The full error (incl. stack) is logged server-side only —
 * never sent in the body.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : 'Internal server error';

  console.error(err);

  res.status(statusCode).json(fail(message));
};
