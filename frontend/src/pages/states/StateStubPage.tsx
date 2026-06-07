import { Link, useParams } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

/** Temporary placeholder for the state create/edit routes — implemented in Step 16. */
export default function StateStubPage() {
  const { id } = useParams()

  return (
    <main className="mx-auto max-w-lg space-y-4 p-8">
      <h1 className="text-2xl font-semibold">{id ? `Edit State #${id}` : 'New State'}</h1>
      <p className="text-muted-foreground">This form is implemented in Step 16.</p>
      <Link to="/states" className={buttonVariants({ variant: 'outline' })}>
        Back to states
      </Link>
    </main>
  )
}
