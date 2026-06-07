import type { StateInsert, StateSelect } from '../../db/schema';

/** The State entity as stored/returned (reuses Drizzle's inferred select type). */
export type State = StateSelect;

/** Payload to create a state. `id` is DB-generated; `isActive` defaults to true. */
export type CreateStateDto = Omit<StateInsert, 'id'>;

/** Payload to update a state — any subset of the creatable fields. */
export type UpdateStateDto = Partial<CreateStateDto>;

/** A search result row: the state plus its country's name (from the join). */
export interface StateSearchRow extends State {
  countryName: string;
}
