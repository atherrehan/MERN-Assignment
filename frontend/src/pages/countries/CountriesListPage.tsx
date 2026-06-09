import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { SearchInput } from '@/components/search-input'
import { StatusFilter, type StatusFilterValue } from '@/components/status-filter'
import { DataTable, type Column } from '@/components/data-table'
import { PaginationControls } from '@/components/pagination-controls'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
  const [refreshKey, setRefreshKey] = useState(0)
  const [data, setData] = useState<PagedResult<CountrySearchRow> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
    setSelectedIds([]) // selection is page-scoped — clear on any refetch/filter change
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
  }, [term, status, page, refreshKey])

  async function handleBulkDelete() {
    setDeleting(true)
    try {
      const { deletedIds, skipped } = await countryService.bulkDelete(selectedIds)

      if (deletedIds.length > 0) {
        toast.success(
          `Deleted ${deletedIds.length} countr${deletedIds.length === 1 ? 'y' : 'ies'}`,
        )
      }
      if (skipped.length > 0) {
        // Surface skipped countries (by name when available) with the reason.
        const names = skipped.map((s) => data?.items.find((c) => c.id === s.id)?.name ?? `#${s.id}`)
        toast.error(`Not deleted: ${names.join(', ')} — ${skipped[0].reason}`)
      }
      if (deletedIds.length === 0 && skipped.length === 0) {
        toast.info('No countries deleted')
      }

      setRefreshKey((k) => k + 1) // refetch; the effect clears the selection
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete countries')
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Countries</h1>
        <div className="flex items-center gap-2">
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger
              render={
                <Button type="button" variant="destructive" disabled={selectedIds.length === 0}>
                  Delete selected ({selectedIds.length})
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete {selectedIds.length} selected countr{selectedIds.length === 1 ? 'y' : 'ies'}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Countries that still have states will be skipped. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={deleting}
                  onClick={handleBulkDelete}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Link to="/countries/new" className={buttonVariants()}>
            Add Country
          </Link>
        </div>
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
        selectable
        selectedKeys={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      <PaginationControls
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
      />
    </main>
  )
}
