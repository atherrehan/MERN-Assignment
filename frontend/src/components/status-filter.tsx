import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type StatusFilterValue = 'all' | 'active' | 'inactive'

const OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

interface StatusFilterProps {
  value?: StatusFilterValue
  onChange: (value: StatusFilterValue) => void
  className?: string
}

function isStatusFilterValue(v: unknown): v is StatusFilterValue {
  return v === 'all' || v === 'active' || v === 'inactive'
}

/** Active/Inactive/All status filter built on the shadcn Select. Generic, no domain specifics. */
export function StatusFilter({ value = 'all', onChange, className }: StatusFilterProps) {
  return (
    <Select
      items={OPTIONS}
      value={value}
      onValueChange={(v) => {
        if (isStatusFilterValue(v)) onChange(v)
      }}
    >
      <SelectTrigger aria-label="Filter by status" className={cn('w-36', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
