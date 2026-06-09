import type { CountryInsert, CountrySelect } from '../../db/schema';

/** The Country entity as stored/returned (reuses Drizzle's inferred select type). */
export type Country = CountrySelect;

/** Payload to create a country. `id` is DB-generated; `isActive` defaults to true. */
export type CreateCountryDto = Omit<CountryInsert, 'id'>;

/** Payload to update a country — any subset of the creatable fields. */
export type UpdateCountryDto = Partial<CreateCountryDto>;

/** A search result row: the country plus how many states belong to it. */
export interface CountrySearchRow extends Country {
  stateCount: number;
}
