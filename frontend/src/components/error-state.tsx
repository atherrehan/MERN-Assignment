import { cn } from '@/lib/utils'

interface ErrorStateProps {
  message?: string
  className?: string
}

/** Generic error placeholder. */
export function ErrorState({ message = 'Something went wrong.', className }: ErrorStateProps) {
  return (
    <div
      className={cn('flex h-24 items-center justify-center text-sm text-destructive', className)}
    >
      {message}
    </div>
  )
}
