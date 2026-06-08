import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { StateForm } from '@/components/state-form'
import { ErrorState } from '@/components/error-state'
import { LoadingState } from '@/components/loading-state'
import { stateService } from '@/services/state.service'
import type { StateFormValues } from '@/lib/validations/state'

export default function StateEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const stateId = Number(id)

  const [values, setValues] = useState<StateFormValues | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    stateService
      .getById(stateId)
      .then((s) => {
        if (active) {
          setValues({ code: s.code, name: s.name, countryId: s.countryId, isActive: s.isActive })
        }
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load state')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [stateId])

  async function handleSubmit(v: StateFormValues) {
    try {
      await stateService.update(stateId, v)
      toast.success('State updated')
      navigate('/states')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update state')
    }
  }

  return (
    <main className="mx-auto max-w-lg space-y-6 p-8">
      <h1 className="text-2xl font-semibold">Edit State</h1>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : values ? (
        <StateForm defaultValues={values} submitLabel="Save changes" onSubmit={handleSubmit} />
      ) : null}
    </main>
  )
}
