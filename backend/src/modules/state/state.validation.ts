import { z } from 'zod';

/** Body to create a state. `countryId` must be a positive integer (FK). */
export const createStateSchema = z.object({
  code: z.string().trim().min(1).max(8),
  name: z.string().trim().min(1).max(128),
  countryId: z.number().int().positive(),
  isActive: z.boolean().optional(),
});

/** Body to update a state — any subset, but at least one field. */
export const updateStateSchema = z
  .object({
    code: z.string().trim().min(1).max(8).optional(),
    name: z.string().trim().min(1).max(128).optional(),
    countryId: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'At least one field must be provided',
  });

/** The :id route param, coerced from string to a positive integer. */
export const stateIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** Search/list query params — same semantics as country search. */
export const stateSearchSchema = z.object({
  q: z.string().trim().min(1).optional(),
  isActive: z.enum(['all', 'active', 'inactive']).default('all'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['code', 'name', 'isActive']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateStateInput = z.infer<typeof createStateSchema>;
export type UpdateStateInput = z.infer<typeof updateStateSchema>;
export type StateIdParam = z.infer<typeof stateIdParamSchema>;
export type StateSearchInput = z.infer<typeof stateSearchSchema>;
