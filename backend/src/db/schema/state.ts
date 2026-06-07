import { pgTable, serial, text, boolean, integer, index, unique } from 'drizzle-orm/pg-core';
import { country } from './country';

/**
 * State table.
 * PK is `serial` to match the shared contract's `State.id: number`.
 * `countryId` is a real FK to country.id with ON DELETE RESTRICT — a country that
 * still has states cannot be deleted (states must be removed/reassigned first).
 *
 * Uniqueness choice: a state `code` is NOT globally unique — e.g. "CA" is California
 * (US) but the same short code can legitimately recur in other countries. So instead
 * of a unique on `code` alone, we enforce UNIQUE (country_id, code): codes are unique
 * WITHIN a country. `country_id` is also indexed for fast per-country lookups.
 */
export const state = pgTable(
  'state',
  {
    id: serial('id').primaryKey(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    countryId: integer('country_id')
      .notNull()
      .references(() => country.id, { onDelete: 'restrict' }),
  },
  (t) => [
    index('state_country_id_idx').on(t.countryId),
    unique('state_country_id_code_unique').on(t.countryId, t.code),
  ],
);
