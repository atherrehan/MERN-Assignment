import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { StateForm } from '@/components/state-form'
import { stateService } from '@/services/state.service'
import type { StateFormValues } from '@/lib/validations/state'

export default function StateNewPage() {
  const navigate = useNavigate()

  async function handleSubmit(values: StateFormValues) {
    try {
      await stateService.create(values)
      toast.success('State created')
      navigate('/states')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create state')
    }
  }

  return (
    <main className="mx-auto max-w-lg space-y-6 p-8">
      <h1 className="text-2xl font-semibold">New State</h1>
      <StateForm submitLabel="Create" onSubmit={handleSubmit} />
    </main>
  )
}
