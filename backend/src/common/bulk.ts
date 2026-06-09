import { z } from 'zod';

/** Body for bulk-delete endpoints: a non-empty array of positive integer ids. */
export const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'Provide at least one id'),
});

export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
