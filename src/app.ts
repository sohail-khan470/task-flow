import express, { Express } from 'express';
import { securityMiddleware } from './middlewares/security.middleware.js';
import { env } from './config/server-config.js';

export const app: Express = express();

// Apply Global Middlewares
app.use(securityMiddleware);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false }));

// TODO: Add your routes here
// app.use('/api/v1', routes);
