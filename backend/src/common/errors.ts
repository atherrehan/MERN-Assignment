/**
 * Base application error. Services throw these; the global error handler maps
 * `statusCode` to the HTTP status and `message` to the ApiResponse message.
 */
export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    // Restore prototype chain for `instanceof` across transpilation targets.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 400 — the request payload failed validation. */
export class ValidationError extends AppError {
  constructor(message = 'Invalid input') {
    super(message, 400);
  }
}

/** 404 — the requested resource does not exist. */
export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}
