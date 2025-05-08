import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export enum ValidationSource {
  BODY = 'body',
  QUERY = 'query',
  PARAM = 'params',
}

export function validationMiddleware<T extends object>(
  type: new () => T,
  source: ValidationSource,
): (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void | Response> {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response> => {
    // Get data from the appropriate source (body, query, params)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = req[source];

    // Convert data to DTO instance
    const dtoObj = plainToInstance(type, data);

    // Validate
    const errors = await validate(dtoObj, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      // Extract validation error messages
      const validationErrors = errors.flatMap((error) => {
        const constraints = error.constraints || {};
        return Object.values(constraints);
      });

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Add validated object to request
    req[source] = dtoObj;
    next();
  };
}
