import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  /** Stable key per row. */
  rowKey: (row: T) => string | number
  /** If provided, rows become clickable (e.g. open a detail/edit view). */
  onRowClick?: (row: T) => void
  loading?: boolean
  error?: string | null
  emptyMessage?: string
}

/** Generic, typed table on top of the shadcn Table, with loading/empty/error states. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading = false,
  error = null,
  emptyMessage,
}: DataTableProps<T>) {
  const colSpan = columns.length || 1

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
    body = rows.map((row) => (
      <TableRow
        key={rowKey(row)}
        onClick={onRowClick ? () => onRowClick(row) : undefined}
        className={cn(onRowClick && 'cursor-pointer')}
      >
        {columns.map((c) => (
          <TableCell key={c.key} className={c.className}>
            {c.cell(row)}
          </TableCell>
        ))}
      </TableRow>
    ))
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
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
