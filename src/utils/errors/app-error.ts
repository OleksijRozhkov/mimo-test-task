export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  public constructor(
    message: string,
    statusCode: number,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public errors: string[];

  public constructor(message: string, errors: string[] = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export class BadRequestError extends AppError {
  public constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  public constructor(message: string) {
    super(message, 404);
  }
}

export class InternalServerError extends AppError {
  public constructor(message = 'Internal server error') {
    super(message, 500, false);
  }
}
