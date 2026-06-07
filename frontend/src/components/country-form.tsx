import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { countryFormSchema, type CountryFormValues } from '@/lib/validations/country'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

interface CountryFormProps {
  defaultValues?: CountryFormValues
  submitLabel?: string
  /** Owns the write: should call the service, then toast/navigate. Throwing keeps the form enabled. */
  onSubmit: (values: CountryFormValues) => Promise<void>
}

/** Shared create/edit form for a Country. Inline Zod errors; disabled while saving. */
export function CountryForm({ defaultValues, submitLabel = 'Save', onSubmit }: CountryFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CountryFormValues>({
    resolver: zodResolver(countryFormSchema),
    defaultValues: defaultValues ?? { code: '', name: '', isActive: true },
  })

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
