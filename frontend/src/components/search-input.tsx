import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'

interface SearchInputProps {
  /** Called with the debounced term. The caller decides how to use it (code/name). */
  onSearch: (term: string) => void
  placeholder?: string
  defaultValue?: string
  /** Debounce delay in ms (default 500). */
  delay?: number
  className?: string
}

/** Controlled, debounced search box. Passes the raw term up (search by code or name). */
export function SearchInput({
  onSearch,
  placeholder = 'Search by code or name…',
  defaultValue = '',
  delay = 500,
  className,
}: SearchInputProps) {
  const [term, setTerm] = useState(defaultValue)
  const debounced = useDebounce(term, delay)

  useEffect(() => {
    onSearch(debounced)
  }, [debounced, onSearch])

  return (
    <Input
      type="search"
      value={term}
      onChange={(e) => setTerm(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className={className}
    />
  )
}
