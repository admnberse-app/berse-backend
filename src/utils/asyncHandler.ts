import { Request, Response, NextFunction } from 'express';

/**
 * Async handler wrapper for Express routes
 * Automatically catches errors and passes them to the error handler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Async handler with custom error handling
 */
export const asyncHandlerWithError = (
  fn: Function,
  errorHandler?: (error: any, req: Request, res: Response, next: NextFunction) => void
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error, req, res, next);
      } else {
        next(error);
      }
    }
  };
};