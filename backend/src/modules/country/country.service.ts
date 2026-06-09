import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm';
import { db } from '../../db';
import { country, state } from '../../db/schema';
import { NotFoundError } from '../../common/errors';
import type { PagedResult } from '../../common/pagination';
import type {
  Country,
  CreateCountryDto,
  UpdateCountryDto,
  CountrySearchRow,
} from './country.types';
import type { CountrySearchInput } from './country.validation';

/** Columns the API allows sorting by, mapped to their Drizzle column. */
const SORTABLE = {
  code: country.code,
  name: country.name,
  isActive: country.isActive,
} as const;

/**
 * Business logic + CRUD for countries. This is the ONLY place country rows are
 * read/written via Drizzle. No req/res here.
 */
export class CountryService {
  /** Fetch one country or throw NotFoundError. */
  async getById(id: number): Promise<Country> {
    const [row] = await db.select().from(country).where(eq(country.id, id));
    if (!row) throw new NotFoundError(`Country ${id} not found`);
    return row;
  }

  /** Insert a country and return the created row. */
  async create(dto: CreateCountryDto): Promise<Country> {
    const [row] = await db.insert(country).values(dto).returning();
    return row;
  }

  /** Update a country (404 if missing) and return the updated row. */
  async update(id: number, dto: UpdateCountryDto): Promise<Country> {
    const [row] = await db.update(country).set(dto).where(eq(country.id, id)).returning();
    if (!row) throw new NotFoundError(`Country ${id} not found`);
    return row;
  }

  /** Soft delete: mark inactive (404 if missing). The row is kept. */
  async remove(id: number): Promise<void> {
    const [row] = await db
      .update(country)
      .set({ isActive: false })
      .where(eq(country.id, id))
      .returning();
    if (!row) throw new NotFoundError(`Country ${id} not found`);
  }

  /**
   * Paged search/list. Matches `q` against code OR name (case-insensitive,
   * partial), filters by active state, sorts by a whitelisted column, and pages
   * with limit/offset. Each row includes `stateCount` (states belonging to the
   * country) via a LEFT JOIN + GROUP BY, so state-less countries report 0.
   */
  async search(query: CountrySearchInput): Promise<PagedResult<CountrySearchRow>> {
    const { q, isActive, page, pageSize, sortBy, sortOrder } = query;

    const conditions = [];
    if (q) {
      conditions.push(or(ilike(country.code, `%${q}%`), ilike(country.name, `%${q}%`)));
    }
    if (isActive === 'active') conditions.push(eq(country.isActive, true));
    else if (isActive === 'inactive') conditions.push(eq(country.isActive, false));

    const where = conditions.length ? and(...conditions) : undefined;

    const sortColumn = SORTABLE[sortBy];
    const orderBy = sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);

    const items = await db
      .select({
        id: country.id,
        code: country.code,
        name: country.name,
        isActive: country.isActive,
        stateCount: count(state.id),
      })
      .from(country)
      .leftJoin(state, eq(state.countryId, country.id))
      .where(where)
      .groupBy(country.id, country.code, country.name, country.isActive)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [{ total }] = await db.select({ total: count() }).from(country).where(where);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
