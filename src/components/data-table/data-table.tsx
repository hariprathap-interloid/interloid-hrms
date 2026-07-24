import type { KeyboardEvent, ReactNode } from 'react'
import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from '@tanstack/react-table'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DataView,
  EmptyState,
  ErrorState,
  NoAccessState,
  SkeletonRows,
  type DataViewStatus,
} from '@/components/data-view'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * DataTable — the workforce data grid (design source: project 8f1502f5,
 * components/DataTable). shadcn Table markup + TanStack for sorting +
 * pagination. Non-populated states (loading / empty / error / no-access) are
 * rendered through the shared DataView lifecycle components — NOT reimplemented.
 *
 * Rows are non-interactive by default (per the States spec: "rows are not
 * hover-interactive"). Passing `onRowClick` opts into the interactive variant
 * (hover, pointer, keyboard, navigation).
 *
 * Use this for record-listing screens (Employees / Attendance / Leave &
 * Permissions / Unified Approvals). For compact embedded lists (dashboard
 * widgets, in-card mini-lists) use data-view's DataViewList/DataViewRow instead.
 * ------------------------------------------------------------------------- */

// Per-column layout hints, read off the TanStack column def's `meta`.
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: 'start' | 'center' | 'end'
    /** Fixed track width, e.g. "120px". */
    width?: string
    /** Minimum track width so the row scrolls instead of crushing. */
    minWidth?: string
    headerClassName?: string
    cellClassName?: string
    // TData/TValue are required by the base signature; unused here.
    _phantom?: [TData, TValue]
  }
}

type Density = 'compact' | 'default' | 'spacious'

const DENSITY_ROW: Record<Density, string> = {
  compact: 'h-[42px]',
  default: 'h-[54px]',
  spacious: 'h-[64px]',
}

function alignClass(align?: 'start' | 'center' | 'end') {
  return align === 'end' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'desc') return <ChevronDown className="size-3.5" />
  return <ChevronUp className={cn('size-3.5', !sorted && 'text-muted-foreground/70')} />
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  /** Defaults to "populated" when data exists, else "empty". */
  status?: DataViewStatus
  density?: Density
  /** Sort applied on first render (uncontrolled thereafter). */
  defaultSort?: SortingState
  pageSize?: number
  /** Stable row identity; defaults to TanStack's index-based id. */
  getRowId?: (row: TData) => string
  /** Opt-in interactive rows — presence enables hover/pointer/keyboard nav. */
  onRowClick?: (row: TData) => void
  title?: ReactNode
  /** Right-aligned toolbar slot (search, filter, create…). */
  toolbar?: ReactNode
  /** Footer summary; defaults to the row count. */
  caption?: ReactNode
  /** Lifecycle slots — reuse EmptyState/ErrorState/NoAccessState. Sensible defaults if omitted. */
  loading?: ReactNode
  loadingRows?: number
  empty?: ReactNode
  error?: ReactNode
  noAccess?: ReactNode
}

export function DataTable<TData>({
  columns,
  data,
  status,
  density = 'default',
  defaultSort = [],
  pageSize = 25,
  getRowId,
  onRowClick,
  title,
  toolbar,
  caption,
  loading,
  loadingRows = 6,
  empty,
  error,
  noAccess,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(defaultSort)

  // TanStack manages its own instance memoization; React Compiler correctly
  // skips it. Silence the incompatible-library notice — it's expected here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    getRowId,
  })

  const resolved: DataViewStatus = status ?? (data.length ? 'populated' : 'empty')
  const interactive = Boolean(onRowClick)

  const handleRowKey = (event: KeyboardEvent<HTMLTableRowElement>, row: TData) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onRowClick?.(row)
    }
  }

  const pageCount = table.getPageCount()
  const pageIndex = table.getState().pagination.pageIndex
  const rowCount = table.getRowCount()

  return (
    <section className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
      {(title || toolbar) && (
        <div className="border-border flex flex-wrap items-center gap-2.5 border-b px-[17px] py-[15px]">
          {title && <div className="text-foreground text-sm font-semibold">{title}</div>}
          <div className="flex-1" />
          {toolbar}
        </div>
      )}

      {resolved === 'populated' ? (
        <>
          <Table className="min-w-[720px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-border bg-muted hover:bg-muted">
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta ?? {}
                    const sortable = header.column.getCanSort()
                    const sorted = header.column.getIsSorted()
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: meta.width, minWidth: meta.minWidth }}
                        className={cn(
                          'text-muted-foreground h-10 text-[11px] font-semibold tracking-[0.03em] uppercase',
                          alignClass(meta.align),
                          meta.headerClassName,
                        )}
                      >
                        {header.isPlaceholder ? null : sortable ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              'inline-flex items-center gap-1.5 uppercase',
                              sorted && 'text-foreground',
                            )}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <SortIcon sorted={sorted} />
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    DENSITY_ROW[density],
                    interactive ? 'hover:bg-muted/50 cursor-pointer' : 'hover:bg-transparent', // non-interactive default (per spec)
                  )}
                  onClick={interactive ? () => onRowClick?.(row.original) : undefined}
                  role={interactive ? 'button' : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  onKeyDown={interactive ? (event) => handleRowKey(event, row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta ?? {}
                    return (
                      <TableCell
                        key={cell.id}
                        style={{ width: meta.width, minWidth: meta.minWidth }}
                        className={cn('text-[13.5px]', alignClass(meta.align), meta.cellClassName)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center gap-3 px-4 py-[11px]">
            <span className="text-muted-foreground text-[12.5px]">
              {caption ?? `${rowCount} ${rowCount === 1 ? 'row' : 'rows'}`}
            </span>
            <div className="flex-1" />
            {pageCount > 1 && (
              <>
                <span className="text-muted-foreground text-[12.5px]">
                  Page {pageIndex + 1} of {pageCount}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Previous page"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Next page"
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <DataView
          status={resolved}
          loading={
            loading ?? (
              <div className="px-[18px] py-1.5">
                <SkeletonRows rows={loadingRows} withStatus />
              </div>
            )
          }
          empty={empty ?? <EmptyState title="Nothing here yet" />}
          error={
            error ?? (
              <ErrorState
                title="Couldn't load data"
                description="Something went wrong on our end. Please try again."
              />
            )
          }
          noAccess={
            noAccess ?? (
              <NoAccessState
                title="You don't have access"
                description="Your role can't view this resource. Contact an administrator if you need access."
              />
            )
          }
        />
      )}
    </section>
  )
}
