import { and, asc, count, desc, eq, ilike, inArray, or } from 'drizzle-orm';
import { db } from '../../db';
import { country, state } from '../../db/schema';
import { NotFoundError } from '../../common/errors';
import type { PagedResult } from '../../common/pagination';
import type { State, CreateStateDto, UpdateStateDto, StateSearchRow } from './state.types';
import type { StateSearchInput } from './state.validation';

/** Columns the API allows sorting by, mapped to their Drizzle column. */
const SORTABLE = {
  code: state.code,
  name: state.name,
  isActive: state.isActive,
} as const;

/**
 * Business logic + CRUD for states. The ONLY place state rows are read/written
 * via Drizzle. Verifies the referenced country exists before insert/update.
 */
export class StateService {
  /** Throw NotFoundError unless the referenced country exists. */
  private async assertCountryExists(countryId: number): Promise<void> {
    const [row] = await db.select({ id: country.id }).from(country).where(eq(country.id, countryId));
    if (!row) throw new NotFoundError(`Country ${countryId} not found`);
  }

  /** Fetch one state or throw NotFoundError. */
  async getById(id: number): Promise<State> {
    const [row] = await db.select().from(state).where(eq(state.id, id));
    if (!row) throw new NotFoundError(`State ${id} not found`);
    return row;
  }

  /** Insert a state (after verifying its country) and return the created row. */
  async create(dto: CreateStateDto): Promise<State> {
    await this.assertCountryExists(dto.countryId);
    const [row] = await db.insert(state).values(dto).returning();
    return row;
  }

  /** Update a state (404 if missing); verifies country when countryId changes. */
  async update(id: number, dto: UpdateStateDto): Promise<State> {
    if (dto.countryId !== undefined) await this.assertCountryExists(dto.countryId);
    const [row] = await db.update(state).set(dto).where(eq(state.id, id)).returning();
    if (!row) throw new NotFoundError(`State ${id} not found`);
    return row;
  }

  /** Delete a state (404 if missing). States are leaf rows, so this is a hard delete. */
  async remove(id: number): Promise<void> {
    const [existing] = await db.select({ id: state.id }).from(state).where(eq(state.id, id));
    if (!existing) throw new NotFoundError(`State ${id} not found`);
    await db.delete(state).where(eq(state.id, id));
  }

  /** Delete every state whose id is in `ids` in a single query; returns how many were removed. */
  async bulkDelete(ids: number[]): Promise<number> {
    const deleted = await db
      .delete(state)
      .where(inArray(state.id, ids))
      .returning({ id: state.id });
    return deleted.length;
  }

  /**
   * Paged search/list. Matches `q` against state code OR name, filters by active
   * state, sorts by a whitelisted column, pages with limit/offset, and joins the
   * country to include `countryName` on each row.
   */
  async search(query: StateSearchInput): Promise<PagedResult<StateSearchRow>> {
    const { q, isActive, countryId, page, pageSize, sortBy, sortOrder } = query;

    const conditions = [];
    if (q) {
      conditions.push(or(ilike(state.code, `%${q}%`), ilike(state.name, `%${q}%`)));
    }
    if (isActive === 'active') conditions.push(eq(state.isActive, true));
    else if (isActive === 'inactive') conditions.push(eq(state.isActive, false));
    if (countryId) conditions.push(eq(state.countryId, countryId));

    const where = conditions.length ? and(...conditions) : undefined;

    const sortColumn = SORTABLE[sortBy];
    const orderBy = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);

    const items = await db
      .select({
        id: state.id,
        code: state.code,
        name: state.name,
        isActive: state.isActive,
        countryId: state.countryId,
        countryName: country.name,
      })
      .from(state)
      .innerJoin(country, eq(state.countryId, country.id))
      .where(where)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [{ total }] = await db.select({ total: count() }).from(state).where(where);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
