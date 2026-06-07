import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { CountryForm } from '@/components/country-form'
import { ErrorState } from '@/components/error-state'
import { countryService } from '@/services/country.service'
import type { CountryFormValues } from '@/lib/validations/country'

export default function CountryEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const countryId = Number(id)

  const [values, setValues] = useState<CountryFormValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    countryService
      .getById(countryId)
      .then((c) => {
        if (active) setValues({ code: c.code, name: c.name, isActive: c.isActive })
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load country')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [countryId])

  async function handleSubmit(v: CountryFormValues) {
    try {
      await countryService.update(countryId, v)
      toast.success('Country updated')
      navigate('/countries')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update country')
    }
  }

  return (
    <main className="mx-auto max-w-lg space-y-6 p-8">
      <h1 className="text-2xl font-semibold">Edit Country</h1>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <ErrorState message={error} />
      ) : values ? (
        <CountryForm defaultValues={values} submitLabel="Save changes" onSubmit={handleSubmit} />
      ) : null}
    </main>
  )
}
