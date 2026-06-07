import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { ok } from './common/api-response';
import { errorHandler } from './common/error-handler';

export const app = express();

app.use(express.json());
app.use(cors({ origin: config.CORS_ORIGIN }));

app.get('/health', (_req, res) => {
  res.json(ok({ status: 'ok' }, 'Service healthy'));
});

// Feature routes are registered in a later step.

// Global error handler — MUST stay last, after all routes/middleware.
app.use(errorHandler);
