import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Country &amp; State Management
        </h1>
        <p className="text-muted-foreground">Manage countries and their states.</p>
      </div>
      <div className="flex gap-4">
        <Link to="/countries" className={buttonVariants()}>
          Countries
        </Link>
        <Link to="/states" className={buttonVariants({ variant: 'secondary' })}>
          States
        </Link>
      </div>
    </main>
  )
}
