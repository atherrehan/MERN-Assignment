import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment contract. Parsed once at startup; the app fails fast on bad config.
 * DATABASE_URL is a placeholder for now — the DB layer is wired in a later step.
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1).default('postgres://user:password@localhost:5432/country_state'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', z.treeifyError(parsed.error));
  process.exit(1);
}

export const config = parsed.data;
