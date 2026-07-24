import type { KeyboardEvent, ReactNode } from 'react'
import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
 * components/DataTable). shadcn Table markup + TanStack. One API covers every
 * record-listing screen (Employees / Attendance / Leave & Permissions /
 * Unified Approvals). For compact embedded lists use data-view's DataViewList.
 *
 * - Sorting + pagination are CLIENT-SIDE by default; pass `page`/`total`/
 *   `onPageChange` (+ `sort`/`onSortChange`) to drive them server-side.
 * - Row selection + a bulk-action bar, per-row ⋯ actions, and a `toolbar` slot
 *   (FilterBar fills it) — all gated by `permitActions` for role limits.
 * - Non-populated states render through the shared DataView lifecycle.
 * - Rows are non-interactive by default (per the States spec); `onRowClick`
 *   opts into the interactive variant (hover / pointer / keyboard nav).
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

function keysToSelection(keys: string[]): RowSelectionState {
  return Object.fromEntries(keys.map((key) => [key, true]))
}
function selectionToKeys(selection: RowSelectionState): string[] {
  return Object.keys(selection).filter((key) => selection[key])
}

export interface BulkAction {
  label: string
  icon?: ReactNode
  onClick?: (selectedKeys: string[]) => void
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  /** Defaults to "populated" when data exists, else "empty". */
  status?: DataViewStatus
  density?: Density

  /** Sort applied on first render (uncontrolled). */
  defaultSort?: SortingState
  /** Controlled sort — pass with `onSortChange` (and typically server pagination). */
  sort?: SortingState
  onSortChange?: (sort: SortingState) => void

  pageSize?: number
  /** Uncontrolled starting page (1-based). */
  defaultPage?: number
  /** Controlled/server page (1-based). Presence switches pagination to manual. */
  page?: number
  /** Total row count across pages — required for server-side page counts. */
  total?: number
  onPageChange?: (page: number) => void

  /** Row selection + bulk-action bar. */
  selectable?: boolean
  selectedKeys?: string[]
  defaultSelectedKeys?: string[]
  onSelectionChange?: (keys: string[]) => void
  bulkActions?: BulkAction[]

  /** Per-row ⋯ menu — return DropdownMenu items for the row. */
  rowActions?: (row: TData) => ReactNode
  /** Opt-in interactive rows — presence enables hover/pointer/keyboard nav. */
  onRowClick?: (row: TData) => void
  /** Role-limited view: strip selection / bulk / row-actions but keep data. Default true. */
  permitActions?: boolean

  /** Stable row identity; defaults to TanStack's index-based id. */
  getRowId?: (row: TData) => string
  title?: ReactNode
  /** Right-aligned toolbar slot (FilterBar, search, create…). */
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
  sort,
  onSortChange,
  pageSize = 25,
  defaultPage = 1,
  page,
  total,
  onPageChange,
  selectable = false,
  selectedKeys,
  defaultSelectedKeys = [],
  onSelectionChange,
  bulkActions = [],
  rowActions,
  onRowClick,
  permitActions = true,
  getRowId,
  title,
  toolbar,
  caption,
  loading,
  loadingRows = 6,
  empty,
  error,
  noAccess,
}: DataTableProps<TData>) {
  const isServer = page !== undefined

  // --- sorting (controlled ⇄ uncontrolled) ---
  const [innerSorting, setInnerSorting] = useState<SortingState>(defaultSort)
  const sorting = sort ?? innerSorting
  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === 'function' ? updater(sorting) : updater
    if (sort === undefined) setInnerSorting(next)
    onSortChange?.(next)
  }

  // --- selection (controlled ⇄ uncontrolled) ---
  const [innerSelection, setInnerSelection] = useState<RowSelectionState>(() =>
    keysToSelection(defaultSelectedKeys),
  )
  const rowSelection = selectedKeys ? keysToSelection(selectedKeys) : innerSelection
  const onRowSelectionChange: OnChangeFn<RowSelectionState> = (updater) => {
    const next = typeof updater === 'function' ? updater(rowSelection) : updater
    if (selectedKeys === undefined) setInnerSelection(next)
    onSelectionChange?.(selectionToKeys(next))
  }

  // --- pagination (controlled ⇄ uncontrolled) ---
  const [innerPageIndex, setInnerPageIndex] = useState(defaultPage - 1)
  const pageIndex = isServer ? page - 1 : innerPageIndex
  const pagination: PaginationState = { pageIndex, pageSize }
  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater
    if (isServer) onPageChange?.(next.pageIndex + 1)
    else setInnerPageIndex(next.pageIndex)
  }

  const totalRows = total ?? data.length
  const showChecks = selectable && permitActions
  const showRowActions = permitActions && Boolean(rowActions)

  // TanStack manages its own instance memoization; React Compiler correctly
  // skips it. Silence the incompatible-library notice — it's expected here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection, pagination },
    onSortingChange,
    onRowSelectionChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: isServer ? undefined : getSortedRowModel(),
    getPaginationRowModel: isServer ? undefined : getPaginationRowModel(),
    manualSorting: isServer,
    manualPagination: isServer,
    pageCount: isServer ? Math.max(1, Math.ceil(totalRows / pageSize)) : undefined,
    enableRowSelection: showChecks,
    getRowId,
  })

  const resolved: DataViewStatus = status ?? (data.length ? 'populated' : 'empty')
  const interactive = Boolean(onRowClick)
  const selectedCount = selectionToKeys(rowSelection).length
  const pageCount = table.getPageCount()

  const handleRowKey = (event: KeyboardEvent<HTMLTableRowElement>, row: TData) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onRowClick?.(row)
    }
  }

  return (
    <section className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
      {(title || toolbar) && (
        <div className="border-border flex flex-wrap items-center gap-2.5 border-b px-[17px] py-[13px]">
          {title && (
            <>
              <div className="text-foreground text-sm font-semibold">{title}</div>
              <div className="flex-1" />
            </>
          )}
          {toolbar}
        </div>
      )}

      {/* bulk-action bar */}
      {showChecks && selectedCount > 0 && (
        <div className="border-border bg-primary-bg flex flex-wrap items-center gap-3 border-b px-4 py-2.5">
          <span className="text-primary text-[13px] font-semibold">{selectedCount} selected</span>
          {bulkActions.length > 0 && <span className="bg-border h-4 w-px" />}
          {bulkActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              onClick={() => action.onClick?.(selectionToKeys(rowSelection))}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => table.setRowSelection({})}
            className="text-primary text-[12.5px] font-medium"
          >
            Clear
          </button>
        </div>
      )}

      {resolved === 'populated' ? (
        <>
          <Table className="min-w-[720px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-border bg-muted hover:bg-muted">
                  {showChecks && (
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          table.getIsAllPageRowsSelected()
                            ? true
                            : table.getIsSomePageRowsSelected()
                              ? 'indeterminate'
                              : false
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
                        aria-label="Select all rows on this page"
                      />
                    </TableHead>
                  )}
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
                  {showRowActions && <TableHead className="w-11" aria-label="Row actions" />}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                const selected = row.getIsSelected()
                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      DENSITY_ROW[density],
                      selected && 'bg-primary-bg hover:bg-primary-bg',
                      !selected &&
                        (interactive ? 'hover:bg-muted/50 cursor-pointer' : 'hover:bg-transparent'),
                    )}
                    onClick={interactive ? () => onRowClick?.(row.original) : undefined}
                    role={interactive ? 'button' : undefined}
                    tabIndex={interactive ? 0 : undefined}
                    onKeyDown={
                      interactive ? (event) => handleRowKey(event, row.original) : undefined
                    }
                  >
                    {showChecks && (
                      <TableCell className="w-10" onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          checked={selected}
                          onCheckedChange={(value) => row.toggleSelected(value === true)}
                          aria-label="Select row"
                        />
                      </TableCell>
                    )}
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta ?? {}
                      return (
                        <TableCell
                          key={cell.id}
                          style={{ width: meta.width, minWidth: meta.minWidth }}
                          className={cn(
                            'text-[13.5px]',
                            alignClass(meta.align),
                            meta.cellClassName,
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                    {showRowActions && (
                      <TableCell className="w-11" onClick={(event) => event.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label="Row actions">
                              <MoreVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {rowActions?.(row.original)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center gap-3 px-4 py-[11px]">
            <span className="text-muted-foreground text-[12.5px]">
              {caption ?? `${totalRows} ${totalRows === 1 ? 'row' : 'rows'}`}
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
