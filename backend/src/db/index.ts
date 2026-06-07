import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from '../config/env';
import * as schema from './schema';

const pool = new Pool({ connectionString: config.DATABASE_URL });

/** The single Drizzle client. Services are the only layer that may import this. */
export const db = drizzle(pool, { schema });
