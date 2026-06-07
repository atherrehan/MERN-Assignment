import { cn } from '@/lib/utils'

interface EmptyStateProps {
  message?: string
  className?: string
}

/** Generic "no results" placeholder. */
export function EmptyState({ message = 'No results found.', className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-24 items-center justify-center text-sm text-muted-foreground',
        className,
      )}
    >
      {message}
    </div>
  )
}
