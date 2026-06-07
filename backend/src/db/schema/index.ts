export * from './country';
export * from './state';

import { country } from './country';
import { state } from './state';

/** Inferred row types for the country table. */
export type CountrySelect = typeof country.$inferSelect;
export type CountryInsert = typeof country.$inferInsert;

/** Inferred row types for the state table. */
export type StateSelect = typeof state.$inferSelect;
export type StateInsert = typeof state.$inferInsert;
