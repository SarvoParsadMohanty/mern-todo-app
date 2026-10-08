import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { tasksRouter } from './routes/tasks.routes';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './utils/appError';

export const createApp = (): Express => {
  const app = express();

  // CORS configuration
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  app.use(
    cors({
      origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'Server is healthy' });
  });

  // Mount API routes
  app.use('/tasks', tasksRouter);

  // Catch-all 404 handler for undefined routes
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new AppError('Resource not found', 404, 'NOT_FOUND'));
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
