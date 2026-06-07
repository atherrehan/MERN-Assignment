import { pgTable, serial, text, boolean } from 'drizzle-orm/pg-core';

/**
 * Country table.
 * PK is `serial` (integer) to match the shared contract's `Country.id: number`.
 * `code` is globally UNIQUE — a country code (e.g. "PK", "US") identifies exactly
 * one country worldwide.
 */
export const country = pgTable('country', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
});
