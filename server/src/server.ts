import dotenv from 'dotenv';
import path from 'path';
import { createApp } from './app';
import { db } from './config/db';

// Load environment variables from .env in root or server directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

const PORT = process.env.PORT || 5000;

const app = createApp();

const startServer = async () => {
  try {
    console.log('Initializing PostgreSQL database...');
    await db.initDb();

    const server = app.listen(PORT, () => {
      console.log(`Task Tracker Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}. Shutting down server gracefully...`);
      server.close(async () => {
        await db.close();
        process.exit(0);
      });
    };

    process.once('SIGTERM', () => shutdown('SIGTERM'));
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGUSR2', () => shutdown('SIGUSR2'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
