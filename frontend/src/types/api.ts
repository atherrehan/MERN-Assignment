/** The single response envelope every API endpoint returns. */
export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T | null
}

/** A page of results plus navigation metadata (search endpoints). */
export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** Country domain type — mirrors the backend entity. */
export interface Country {
  id: number
  code: string
  name: string
  isActive: boolean
}

/** State domain type — mirrors the backend entity. */
export interface State {
  id: number
  code: string
  name: string
  isActive: boolean
  countryId: number
}

/** A state row returned by the search endpoint, with its country's name joined. */
export interface StateSearchRow extends State {
  countryName: string
}

/** A country row returned by the search endpoint, with its state count. */
export interface CountrySearchRow extends Country {
  stateCount: number
}
