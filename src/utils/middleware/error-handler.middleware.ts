import { ValidationError as ClassValidatorValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors/app-error';
import { ValidationError as CustomValidationError } from '../errors/app-error';

export function errorHandler(
  err: Error,

  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): Response | void {
  console.error('Error:', err);

  // Handle validation errors from class-validator
  if (
    Array.isArray(err) &&
    err.length > 0 &&
    err[0] instanceof ClassValidatorValidationError
  ) {
    const validationErrors = err.flatMap(
      (error: ClassValidatorValidationError) => {
        const constraints = error.constraints || {};
        return Object.values(constraints);
      },
    );

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: validationErrors,
    });
  }

  // Handle our custom AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err instanceof CustomValidationError && { errors: err.errors }),
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}
