import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { ok } from './common/api-response';
import { errorHandler } from './common/error-handler';
import { countryRouter } from './modules/country/country.routes';
import { stateRouter } from './modules/state/state.routes';

export const app = express();

app.use(express.json());
app.use(cors({ origin: config.CORS_ORIGIN }));

app.get('/health', (_req, res) => {
  res.json(ok({ status: 'ok' }, 'Service healthy'));
});

app.use('/api/countries', countryRouter);
app.use('/api/states', stateRouter);

// Global error handler — MUST stay last, after all routes/middleware.
app.use(errorHandler);
