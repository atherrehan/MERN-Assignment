import { z } from 'zod';

/** Body to create a country. Unknown keys are stripped by z.object. */
export const createCountrySchema = z.object({
  code: z.string().trim().min(1).max(8),
  name: z.string().trim().min(1).max(128),
  isActive: z.boolean().optional(),
});

/** Body to update a country — any subset, but at least one field. */
export const updateCountrySchema = z
  .object({
    code: z.string().trim().min(1).max(8).optional(),
    name: z.string().trim().min(1).max(128).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'At least one field must be provided',
  });

/** The :id route param, coerced from string to a positive integer. */
export const countryIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Search/list query params (all from the query string, hence coercion + defaults).
 * sortBy is whitelisted to real, sortable columns to prevent injection.
 */
export const countrySearchSchema = z.object({
  q: z.string().trim().min(1).optional(),
  isActive: z.enum(['all', 'active', 'inactive']).default('all'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['code', 'name', 'isActive']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateCountryInput = z.infer<typeof createCountrySchema>;
export type UpdateCountryInput = z.infer<typeof updateCountrySchema>;
export type CountryIdParam = z.infer<typeof countryIdParamSchema>;
export type CountrySearchInput = z.infer<typeof countrySearchSchema>;
