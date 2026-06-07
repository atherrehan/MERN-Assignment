import express from 'express';
import cors from 'cors';
import type { ApiResponse } from '@shared';
import { config } from './config/env';

export const app = express();

app.use(express.json());
app.use(cors({ origin: config.CORS_ORIGIN }));

app.get('/health', (_req, res) => {
  const body: ApiResponse<{ status: string }> = {
    success: true,
    message: 'Service healthy',
    data: { status: 'ok' },
  };
  res.json(body);
});

// Feature routes are registered in a later step.
