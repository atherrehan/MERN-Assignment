import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { ok } from './common/api-response';
import { errorHandler } from './common/error-handler';
import { notFoundHandler } from './common/not-found';
import { countryRouter } from './modules/country/country.routes';
import { stateRouter } from './modules/state/state.routes';

export const app = express();

app.use(express.json());
// CORS: the allowed browser origin is read from the CORS_ORIGIN env var
// (see backend/.env.example). Set it to the frontend's origin — e.g. the Vite
// dev server http://localhost:5173, or the deployed web app's URL in production.
app.use(cors({ origin: config.CORS_ORIGIN }));

app.get('/health', (_req, res) => {
  res.json(ok({ status: 'ok' }, 'Service healthy'));
});

app.use('/api/countries', countryRouter);
app.use('/api/states', stateRouter);

// Unknown routes → standard 404 ApiResponse (must come after all routes).
app.use(notFoundHandler);

// Global error handler — MUST stay last, after all routes/middleware.
app.use(errorHandler);
