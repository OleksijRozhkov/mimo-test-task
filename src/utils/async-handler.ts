import { Request, Response, NextFunction } from 'express';

export type AsyncRequestHandler = (
  req: Request<any, any, any, any, any>,
  res: Response<any, any>,
  next: NextFunction,
) => Promise<any>;

/**
 * Wraps an async route handler to automatically catch errors and pass them to next()
 * This eliminates the need for try/catch blocks in every controller method
 */
export const asyncHandler = (
  fn: AsyncRequestHandler,
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
