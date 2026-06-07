import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from './errors';

export type ValidationTarget = 'body' | 'params' | 'query';

/**
 * res.locals shape after `validate` middleware ran, for typed controller reads.
 * The index signature lets it satisfy Express's `Record<string, any>` Locals
 * constraint while keeping `validated` strongly typed.
 */
export interface ValidatedLocals<V> {
  validated: V;
  [key: string]: unknown;
}

/**
 * Express middleware that validates one part of the request against a Zod schema.
 * On failure it throws ValidationError (→ global handler → 400 ApiResponse).
 * On success the parsed/coerced value is stored at res.locals.validated[target]
 * for the controller to read. Controllers never validate; they read the result.
 */
export function validate(schema: ZodType, target: ValidationTarget = 'body'): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.') || target}: ${issue.message}`)
        .join('; ');
      throw new ValidationError(message);
    }
    res.locals.validated = { ...res.locals.validated, [target]: result.data };
    next();
  };
}
