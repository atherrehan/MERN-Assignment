import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  className?: string
}

/** Generic loading placeholder — same shape/wording as EmptyState/ErrorState. */
export function LoadingState({ message = 'Loading…', className }: LoadingStateProps) {
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
