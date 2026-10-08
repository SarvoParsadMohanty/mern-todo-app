import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/appError';

type RequestValidationSource = 'body' | 'query' | 'params';

export const validateRequest = (
  schema: ZodSchema,
  source: RequestValidationSource = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        const errorMessage = firstIssue ? firstIssue.message : 'Validation error';
        const formattedDetails = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        return next(
          new AppError(errorMessage, 400, 'VALIDATION_ERROR', formattedDetails)
        );
      }
      next(error);
    }
  };
};
