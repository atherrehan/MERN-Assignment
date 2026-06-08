import { z } from 'zod'

/**
 * Mirrors the backend state create/update validation. `countryId` must be a
 * positive integer — i.e. a country must be selected.
 */
export const stateFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Code is required')
    .max(8, 'Code must be 8 characters or fewer'),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(128, 'Name must be 128 characters or fewer'),
  countryId: z.number().int().positive('Please select a country'),
  isActive: z.boolean(),
})

export type StateFormValues = z.infer<typeof stateFormSchema>
