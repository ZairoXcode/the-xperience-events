import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config/env';

export const createApp = (): Express => {
  const app = express();

  const allowedOrigins = [
    config.frontendUrl.replace(/\/+$/, ''),
    'https://frontend-ochre-one-30.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  // Middleware
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/+$/, '');
        if (
          allowedOrigins.includes(cleanOrigin) ||
          cleanOrigin.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api', apiRouter);

  // 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
