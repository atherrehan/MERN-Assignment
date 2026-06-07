import type { ApiResponse } from '@shared';

export type { ApiResponse };

/** Build a successful ApiResponse envelope. */
export const ok = <T>(data: T, message = 'OK'): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

/** Build a failed ApiResponse envelope (data is always null). */
export const fail = (message: string): ApiResponse<null> => ({
  success: false,
  message,
  data: null,
});
