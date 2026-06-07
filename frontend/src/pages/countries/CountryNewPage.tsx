import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CountryForm } from '@/components/country-form'
import { countryService } from '@/services/country.service'
import type { CountryFormValues } from '@/lib/validations/country'

export default function CountryNewPage() {
  const navigate = useNavigate()

  async function handleSubmit(values: CountryFormValues) {
    try {
      await countryService.create(values)
      toast.success('Country created')
      navigate('/countries')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create country')
    }
  }

  return (
    <main className="mx-auto max-w-lg space-y-6 p-8">
      <h1 className="text-2xl font-semibold">New Country</h1>
      <CountryForm submitLabel="Create" onSubmit={handleSubmit} />
    </main>
  )
}
