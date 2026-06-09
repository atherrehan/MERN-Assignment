import { useEffect, useState } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { countryService } from '@/services/country.service'
import type { Country } from '@/types/api'

interface CountryComboboxProps {
  /** Selected country id, or undefined for "All countries". */
  value?: number
  onChange: (countryId: number | undefined) => void
  className?: string
}

/**
 * Country filter combobox (shadcn Command + Popover). Lists active countries
 * loaded via the service, plus an "All countries" option that clears the filter.
 */
export function CountryCombobox({ value, onChange, className }: CountryComboboxProps) {
  const [open, setOpen] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])

  useEffect(() => {
    let active = true
    countryService
      .search({ isActive: 'active', pageSize: 100, sortBy: 'name', sortOrder: 'asc' })
      .then((res) => {
        if (active) setCountries(res.items)
      })
      .catch(() => {
        // On failure the combobox still offers "All countries".
      })
    return () => {
      active = false
    }
  }, [])

  const selected = value ? countries.find((c) => c.id === value) : undefined
  const label = selected ? selected.name : 'All countries'

  function select(countryId: number | undefined) {
    onChange(countryId)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            aria-label="Filter by country"
            className={cn('w-48 justify-between font-normal', className)}
          >
            <span className="truncate">{label}</span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-48 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country…" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="All countries"
                data-checked={value === undefined}
                onSelect={() => select(undefined)}
              >
                All countries
              </CommandItem>
              {countries.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.name}
                  data-checked={value === c.id}
                  onSelect={() => select(c.id)}
                >
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
