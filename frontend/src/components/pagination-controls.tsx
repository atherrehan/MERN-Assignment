import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationControlsProps {
  /** Current page (1-based) and total pages — typically from PagedResult meta. */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/** Prev/Next pager with a page indicator and disabled states at the bounds. */
export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationControlsProps) {
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <Button
        variant="outline"
        size="sm"
        disabled={!canPrev}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {totalPages === 0 ? 0 : page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}
