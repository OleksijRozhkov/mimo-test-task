import { RequestHandler } from 'express';

import { asyncHandler } from './async-handler';
import { AsyncRequestHandler } from './async-handler';
import {
  validationMiddleware,
  ValidationSource,
} from './middleware/validation.middleware';

interface ValidationOptions {
  body?: any;
  param?: any;
  query?: any;
}

export function createRoute(
  handler: AsyncRequestHandler,
  validation?: ValidationOptions,
): RequestHandler[] {
  const middlewares: RequestHandler[] = [];
  if (validation?.param) {
    middlewares.push(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      validationMiddleware(validation.param, ValidationSource.PARAM),
    );
  }
  if (validation?.query) {
    middlewares.push(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      validationMiddleware(validation.query, ValidationSource.QUERY),
    );
  }
  if (validation?.body) {
    middlewares.push(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      validationMiddleware(validation.body, ValidationSource.BODY),
    );
  }
  middlewares.push(asyncHandler(handler));
  return middlewares;
}
