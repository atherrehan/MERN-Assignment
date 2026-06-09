import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Country &amp; State Management
        </h1>
        <p className="text-muted-foreground">
          Use the navigation to manage countries and their states. Pick a section to get
          started.
        </p>
      </div>
      <div className="flex gap-3">
        <Link to="/countries" className={buttonVariants()}>
          Go to Countries
        </Link>
        <Link to="/states" className={buttonVariants({ variant: 'secondary' })}>
          Go to States
        </Link>
      </div>
    </main>
  )
}
