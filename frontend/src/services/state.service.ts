// The ONLY caller of the axios instance for state endpoints.
// Pages/components MUST import this service — never axios directly.
import { apiClient, unwrap } from '@/lib/api/axios'
import type { ApiResponse, PagedResult, State, StateSearchRow } from '@/types/api'

/** Search/list params — mirrors the backend state search query schema. */
export interface StateSearchParams {
  q?: string
  isActive?: 'all' | 'active' | 'inactive'
  page?: number
  pageSize?: number
  sortBy?: 'code' | 'name' | 'isActive'
  sortOrder?: 'asc' | 'desc'
}

/** Body to create a state. `countryId` references an existing country. */
export interface CreateStateDto {
  code: string
  name: string
  countryId: number
  isActive?: boolean
}

/** Body to update a state — any subset of the creatable fields. */
export type UpdateStateDto = Partial<CreateStateDto>

class StateService {
  /** Paged search/list of states; rows include the joined `countryName`. */
  async search(params: StateSearchParams = {}): Promise<PagedResult<StateSearchRow>> {
    const res = await apiClient.get<
      PagedResult<StateSearchRow>,
      ApiResponse<PagedResult<StateSearchRow>>
    >('/states/search', { params })
    return unwrap(res)
  }

  /** Fetch a single state by id. */
  async getById(id: number): Promise<State> {
    const res = await apiClient.get<State, ApiResponse<State>>(`/states/${id}`)
    return unwrap(res)
  }

  /** Create a state and return the created row. */
  async create(dto: CreateStateDto): Promise<State> {
    const res = await apiClient.post<State, ApiResponse<State>, CreateStateDto>('/states', dto)
    return unwrap(res)
  }

  /** Update a state and return the updated row. */
  async update(id: number, dto: UpdateStateDto): Promise<State> {
    const res = await apiClient.put<State, ApiResponse<State>, UpdateStateDto>(
      `/states/${id}`,
      dto,
    )
    return unwrap(res)
  }

  /** Soft-delete a state (no payload on success). */
  async remove(id: number): Promise<void> {
    const res = await apiClient.delete<null, ApiResponse<null>>(`/states/${id}`)
    if (!res.success) throw new Error(res.message)
  }
}

// Exported as a singleton (stateless service, one shared instance). See
// country.service.ts for the rationale.
export const stateService = new StateService()
