// The ONLY caller of the axios instance for country endpoints.
// Pages/components MUST import this service — never axios directly.
import { apiClient, unwrap } from '@/lib/api/axios'
import type {
  ApiResponse,
  Country,
  CountryBulkDeleteResult,
  CountrySearchRow,
  PagedResult,
} from '@/types/api'

/** Search/list params — mirrors the backend country search query schema. */
export interface CountrySearchParams {
  q?: string
  isActive?: 'all' | 'active' | 'inactive'
  page?: number
  pageSize?: number
  sortBy?: 'code' | 'name' | 'isActive'
  sortOrder?: 'asc' | 'desc'
}

/** Body to create a country. */
export interface CreateCountryDto {
  code: string
  name: string
  isActive?: boolean
}

/** Body to update a country — any subset of the creatable fields. */
export type UpdateCountryDto = Partial<CreateCountryDto>

class CountryService {
  /** Paged search/list of countries; each row includes its state count. */
  async search(params: CountrySearchParams = {}): Promise<PagedResult<CountrySearchRow>> {
    const res = await apiClient.get<
      PagedResult<CountrySearchRow>,
      ApiResponse<PagedResult<CountrySearchRow>>
    >('/countries/search', { params })
    return unwrap(res)
  }

  /** Fetch a single country by id. */
  async getById(id: number): Promise<Country> {
    const res = await apiClient.get<Country, ApiResponse<Country>>(`/countries/${id}`)
    return unwrap(res)
  }

  /** Create a country and return the created row. */
  async create(dto: CreateCountryDto): Promise<Country> {
    const res = await apiClient.post<Country, ApiResponse<Country>, CreateCountryDto>(
      '/countries',
      dto,
    )
    return unwrap(res)
  }

  /** Update a country and return the updated row. */
  async update(id: number, dto: UpdateCountryDto): Promise<Country> {
    const res = await apiClient.put<Country, ApiResponse<Country>, UpdateCountryDto>(
      `/countries/${id}`,
      dto,
    )
    return unwrap(res)
  }

  /** Delete a country (no payload on success). Blocked server-side if it has states. */
  async remove(id: number): Promise<void> {
    const res = await apiClient.delete<null, ApiResponse<null>>(`/countries/${id}`)
    if (!res.success) throw new Error(res.message)
  }

  /**
   * Delete many countries by id. Partial success: countries with states are not
   * deleted and come back in `skipped` with a reason.
   */
  async bulkDelete(ids: number[]): Promise<CountryBulkDeleteResult> {
    const res = await apiClient.post<
      CountryBulkDeleteResult,
      ApiResponse<CountryBulkDeleteResult>,
      { ids: number[] }
    >('/countries/bulk-delete', { ids })
    return unwrap(res)
  }
}

// Exported as a singleton: the service is stateless, so one shared instance
// avoids re-instantiation and is simple to import anywhere.
export const countryService = new CountryService()
