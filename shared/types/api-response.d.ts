/**
 * The single response envelope for every API endpoint.
 * On success: `data` holds the payload and `message` is a short confirmation.
 * On failure: `success` is false, `data` is null, and `message` explains why.
 */
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};
