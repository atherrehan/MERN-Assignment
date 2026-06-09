import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { EmptyState } from './empty-state'
import { ErrorState } from './error-state'
import { LoadingState } from './loading-state'

/** A single column: how to render its header and each row's cell. Generic over the row type. */
export interface Column<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T, K extends string | number = string | number> {
  columns: Column<T>[]
  rows: T[]
  /** Stable key per row. */
  rowKey: (row: T) => K
  /** If provided, rows become clickable (e.g. open a detail/edit view). */
  onRowClick?: (row: T) => void
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  /** Enable a leading selection column (header "select all" + per-row checkboxes). */
  selectable?: boolean
  /** Currently selected row keys (page-scoped; managed by the parent). */
  selectedKeys?: K[]
  onSelectionChange?: (keys: K[]) => void
}

/** Generic, typed table on top of the shadcn Table, with loading/empty/error + optional selection. */
export function DataTable<T, K extends string | number = string | number>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading = false,
  error = null,
  emptyMessage,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
}: DataTableProps<T, K>) {
  const showSelection = selectable && !!onSelectionChange
  const colSpan = (columns.length || 1) + (showSelection ? 1 : 0)

  const selectedSet = new Set(selectedKeys)
  const pageKeys = rows.map(rowKey)
  const allSelected = pageKeys.length > 0 && pageKeys.every((k) => selectedSet.has(k))
  const someSelected = !allSelected && pageKeys.some((k) => selectedSet.has(k))

  // Selection is page-scoped (parent clears it on filter/page change), so "all"
  // simply means every key on the current page.
  function toggleAll(checked: boolean) {
    onSelectionChange?.(checked ? pageKeys : [])
  }
  function toggleRow(key: K, checked: boolean) {
    if (!onSelectionChange) return
    onSelectionChange(checked ? [...selectedKeys, key] : selectedKeys.filter((k) => k !== key))
  }

  let body: ReactNode
  if (error) {
    body = (
      <TableRow>
        <TableCell colSpan={colSpan} className="p-0">
          <ErrorState message={error} />
        </TableCell>
      </TableRow>
    )
  } else if (loading) {
    body = (
      <TableRow>
        <TableCell colSpan={colSpan} className="p-0">
          <LoadingState />
        </TableCell>
      </TableRow>
    )
  } else if (rows.length === 0) {
    body = (
      <TableRow>
        <TableCell colSpan={colSpan} className="p-0">
          <EmptyState message={emptyMessage} />
        </TableCell>
      </TableRow>
    )
  } else {
    body = rows.map((row) => {
      const key = rowKey(row)
      return (
        <TableRow
          key={key}
          onClick={onRowClick ? () => onRowClick(row) : undefined}
          className={cn(onRowClick && 'cursor-pointer')}
        >
          {showSelection && (
            <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                aria-label="Select row"
                checked={selectedSet.has(key)}
                onCheckedChange={(checked) => toggleRow(key, checked === true)}
              />
            </TableCell>
          )}
          {columns.map((c) => (
            <TableCell key={c.key} className={c.className}>
              {c.cell(row)}
            </TableCell>
          ))}
        </TableRow>
      )
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {showSelection && (
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Select all rows on this page"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                />
              </TableHead>
            )}
            {columns.map((c) => (
              <TableHead key={c.key} className={c.className}>
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{body}</TableBody>
      </Table>
    </div>
  )
}
