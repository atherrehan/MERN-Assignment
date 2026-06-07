import type { Request, Response, NextFunction, RequestHandler } from 'express';

/** Base shape of Express `res.locals`. Handlers refine it via the L type param. */
export type Locals = Record<string, unknown>;

/**
 * Wraps an async handler so any thrown/rejected error is forwarded to the global
 * error-handling middleware via `next`.
 *
 * The optional `L` type parameter lets a handler declare the shape of
 * `res.locals` — e.g. the validated input the validate middleware placed there —
 * so controllers can read it fully typed, with no casts.
 */
export const asyncHandler =
  <L extends Locals = Locals>(
    fn: (req: Request, res: Response<unknown, L>, next: NextFunction) => unknown,
  ): RequestHandler =>
  (req, res, next) => {
    // Single framework-boundary widening: Express types res.locals as `any`,
    // so re-narrow it to the handler's declared L before invoking.
    const typedRes = res as Response<unknown, L>;
    Promise.resolve(fn(req, typedRes, next)).catch(next);
  };
