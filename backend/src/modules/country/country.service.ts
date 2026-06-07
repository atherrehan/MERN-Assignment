import { eq, ilike, or } from 'drizzle-orm';
import { db } from '../../db';
import { country } from '../../db/schema';
import { NotFoundError } from '../../common/errors';
import type {
  Country,
  CreateCountryDto,
  UpdateCountryDto,
  CountrySearchQuery,
} from './country.types';

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

  /** Minimal list/search: optional case-insensitive match on code or name. */
  async search(query: CountrySearchQuery): Promise<Country[]> {
    const term = query.search?.trim();
    const where = term
      ? or(ilike(country.code, `%${term}%`), ilike(country.name, `%${term}%`))
      : undefined;
    return db.select().from(country).where(where);
  }
}
