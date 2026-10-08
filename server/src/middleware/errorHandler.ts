import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/appError';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Operational AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // PostgreSQL syntax error / invalid syntax for datatype (e.g. 22P02)
  if ('code' in err && typeof err.code === 'string') {
    if (err.code === '22P02') {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid input syntax for database query',
          code: 'INVALID_ID',
        },
      });
      return;
    }
  }

  // Express JSON syntax error
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Invalid JSON payload provided',
        code: 'INVALID_JSON',
      },
    });
    return;
  }

  // Fallback for unhandled / unknown errors
  console.error('Unhandled Error:', err);

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
};
