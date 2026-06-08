import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { stateFormSchema, type StateFormValues } from '@/lib/validations/state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { countryService } from '@/services/country.service'
import type { Country } from '@/types/api'

interface StateFormProps {
  defaultValues?: StateFormValues
  submitLabel?: string
  /** Owns the write: should call the service, then toast/navigate. Throwing keeps the form enabled. */
  onSubmit: (values: StateFormValues) => Promise<void>
}

/** Shared create/edit form for a State, including the country selector. */
export function StateForm({ defaultValues, submitLabel = 'Save', onSubmit }: StateFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StateFormValues>({
    resolver: zodResolver(stateFormSchema),
    defaultValues: defaultValues ?? { code: '', name: '', countryId: 0, isActive: true },
  })

  // Country options come from the service (active countries) — never axios directly.
  const [countries, setCountries] = useState<Country[]>([])
  const [countriesError, setCountriesError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    countryService
      .search({ isActive: 'active', pageSize: 100, sortBy: 'name', sortOrder: 'asc' })
      .then((res) => {
        if (active) setCountries(res.items)
      })
      .catch((e) => {
        if (active) setCountriesError(e instanceof Error ? e.message : 'Failed to load countries')
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="code">Code</Label>
        <Input id="code" {...register('code')} />
        {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="countryId">Country</Label>
        <Controller
          control={control}
          name="countryId"
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : ''}
              onValueChange={(v) => field.onChange(v ? Number(v) : 0)}
            >
              <SelectTrigger id="countryId" aria-label="Country" className="w-full">
                <SelectValue>
                  {(value) => {
                    const found = countries.find((c) => String(c.id) === value)
                    return found ? found.name : 'Select a country'
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {countriesError && <p className="text-sm text-destructive">{countriesError}</p>}
        {errors.countryId && <p className="text-sm text-destructive">{errors.countryId.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Checkbox
              id="isActive"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
          )}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
