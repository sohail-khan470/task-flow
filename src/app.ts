import express, { Express, Request, Response } from 'express';
import { securityMiddleware } from './middlewares/security.middleware.js';
import { env } from './config/server-config.js';
import morgan from 'morgan';
import routes from './routes/index.js';
import healthRoutes from '../src/modules/health/health.routes.js';

export const app: Express = express();

// Apply Global Middlewares

app.use(morgan('dev'));
app.use(securityMiddleware);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false }));

// TODO: Add your routes here
app.use('/api/v1', routes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    },
  });
});

app.use('/', healthRoutes);
