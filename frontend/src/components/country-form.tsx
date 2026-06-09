import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { countryFormSchema, type CountryFormValues } from '@/lib/validations/country'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface CountryFormProps {
  defaultValues?: CountryFormValues
  submitLabel?: string
  /** Owns the write: should call the service, then toast/navigate. Throwing keeps the form enabled. */
  onSubmit: (values: CountryFormValues) => Promise<void>
  /** When provided (edit mode), renders a Delete action behind a confirmation dialog. */
  onDelete?: () => Promise<void>
}

/** Shared create/edit form for a Country. Inline Zod errors; disabled while saving. */
export function CountryForm({
  defaultValues,
  submitLabel = 'Save',
  onSubmit,
  onDelete,
}: CountryFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CountryFormValues>({
    resolver: zodResolver(countryFormSchema),
    defaultValues: defaultValues ?? { code: '', name: '', isActive: true },
  })

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleConfirmDelete() {
    if (!onDelete) return
    setDeleting(true)
    try {
      await onDelete() // navigates on success; toasts on error
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

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

      <div className="flex items-center justify-between gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>

        {onDelete && (
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger
              render={
                <Button type="button" variant="destructive">
                  Delete
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this country?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </form>
  )
}
