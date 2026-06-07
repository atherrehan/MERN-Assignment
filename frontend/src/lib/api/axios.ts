import axios from 'axios'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'

/**
 * The ONE axios instance for the whole app. No other file imports axios; all
 * network access goes through service classes that use this client.
 *
 * Base URL comes from VITE_API_URL (see .env.local / .env.example).
 */
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Response interceptor:
 *  - on success, return the ApiResponse body (response.data) directly, so callers
 *    receive `{ success, message, data }` rather than the raw AxiosResponse.
 *  - on error (network/HTTP), normalize into the SAME ApiResponse shape with
 *    success:false and a usable message, resolving (not rejecting) so services
 *    and UI branch uniformly on `success`.
 */
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const message =
      error.response?.data?.message ?? error.message ?? 'Unexpected error occurred'
    const normalized: ApiResponse<null> = { success: false, message, data: null }
    return normalized
  },
)

/**
 * Unwrap an ApiResponse: return its `data` on success, or throw an Error carrying
 * the server/normalized message. Used by service classes so callers receive the
 * payload directly (or a thrown error) instead of the envelope.
 *
 * Note: for endpoints whose success payload is `null` (e.g. delete), check
 * `res.success` directly rather than calling unwrap.
 */
export function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success || res.data === null) {
    throw new Error(res.message || 'Request failed')
  }
  return res.data
}
