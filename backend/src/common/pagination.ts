export type SortOrder = 'asc' | 'desc';

/** Normalized pagination/sort parameters for a paged query. */
export interface PaginationQuery {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder: SortOrder;
}

/** A single page of results plus the metadata to navigate the rest. */
export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function toPositiveInt(value: unknown, fallback: number): number {
  const n = typeof value === 'string' ? Number.parseInt(value, 10) : NaN;
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

/**
 * Parse and clamp pagination/sort params from a raw query object (e.g. req.query)
 * with safe defaults. page >= 1; 1 <= pageSize <= MAX_PAGE_SIZE; sortOrder is
 * 'asc' unless explicitly 'desc'.
 */
export function parsePagination(query: Record<string, unknown>): PaginationQuery {
  const page = Math.max(1, toPositiveInt(query.page, DEFAULT_PAGE));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, toPositiveInt(query.pageSize, DEFAULT_PAGE_SIZE)),
  );
  const sortBy =
    typeof query.sortBy === 'string' && query.sortBy.length > 0 ? query.sortBy : undefined;
  const sortOrder: SortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

  return { page, pageSize, sortBy, sortOrder };
}
