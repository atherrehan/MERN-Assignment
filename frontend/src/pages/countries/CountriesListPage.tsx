import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SearchInput } from '@/components/search-input'
import { StatusFilter, type StatusFilterValue } from '@/components/status-filter'
import { DataTable, type Column } from '@/components/data-table'
import { PaginationControls } from '@/components/pagination-controls'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { countryService } from '@/services/country.service'
import type { CountrySearchRow, PagedResult } from '@/types/api'

const PAGE_SIZE = 5

const columns: Column<CountrySearchRow>[] = [
  { key: 'code', header: 'Code', cell: (r) => r.code },
  {
    key: 'name',
    header: 'Name',
    cell: (r) => (
      <Link
        to={`/countries/${r.id}`}
        className="font-medium underline-offset-4 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {r.name}
      </Link>
    ),
  },
  { key: 'stateCount', header: 'States', cell: (r) => r.stateCount },
  {
    key: 'status',
    header: 'Status',
    cell: (r) => (
      <Badge variant={r.isActive ? 'default' : 'secondary'}>
        {r.isActive ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
]

export default function CountriesListPage() {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')
  const [status, setStatus] = useState<StatusFilterValue>('all')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PagedResult<CountrySearchRow> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters reset to page 1 when they change.
  const handleSearch = useCallback((t: string) => {
    setTerm(t)
    setPage(1)
  }, [])
  const handleStatus = useCallback((s: StatusFilterValue) => {
    setStatus(s)
    setPage(1)
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    countryService
      .search({ q: term || undefined, isActive: status, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (active) setData(res)
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : 'Failed to load countries')
          setData(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [term, status, page])

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Countries</h1>
        <Link to="/countries/new" className={buttonVariants()}>
          Add Country
        </Link>
      </div>

      <div className="flex gap-3">
        <SearchInput onSearch={handleSearch} className="w-64" />
        <StatusFilter value={status} onChange={handleStatus} />
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/countries/${r.id}`)}
        loading={loading}
        error={error}
        emptyMessage="No countries found."
      />

      <PaginationControls
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
      />
    </main>
  )
}
