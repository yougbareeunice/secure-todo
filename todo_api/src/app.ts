import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.ts';
import { authRoutes } from './modules/auth/auth.routes.ts';
import { todoRoutes } from './modules/todos/todo.routes.ts';
import { errorHandler, notFoundHandler } from './shared/error-handler.ts';
import { logger } from './shared/logger.ts';

export function createApp() {
  const app = express();

  // --- Global middleware (order matters) ---
  app.disable('x-powered-by');
  app.use(helmet()); // secure HTTP headers
  app.use(cors({ origin: env.CORS_ORIGIN })); // needed for Flutter web
  app.use(express.json({ limit: '100kb' })); // parse + cap JSON bodies
  app.use(pinoHttp({ logger })); // one log line per request

  // --- Routes ---
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/todos', todoRoutes);

  // --- Must be registered last ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}