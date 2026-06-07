import { z } from 'zod'

/**
 * Mirrors the backend country create/update validation. The form always supplies
 * all three fields; create/update both accept this shape.
 */
export const countryFormSchema = z.object({
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
  isActive: z.boolean(),
})

export type CountryFormValues = z.infer<typeof countryFormSchema>
