import { useEffect, useMemo, useState } from 'react'
import { Download, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/layout/page-header'
import {
  DataTable,
  FilterBar,
  MonoText,
  PersonCell,
  TableBadge,
  type ColumnDef,
  type SortingState,
} from '@/components/data-table'
import {
  DataViewList,
  EmptyState,
  NoAccessState,
  type DataViewStatus,
} from '@/components/data-view'
import { useConfirm } from '@/components/confirm/use-confirm'
import { useRole } from '@/features/auth/use-role'
import {
  ALL_EMPLOYEES,
  FACETS,
  fetchEmployees,
  formatJoined,
  type Employee,
  type EmployeePage,
} from './data'

/* ---------------------------------------------------------------------------
 * Employees — the workforce directory at /employees (design: Employees.dc.html).
 * Promotes the /dev/table demo into a real shell route: PageHeader + FilterBar +
 * DataTable + cells, driving **controlled / server-side** pagination + sorting +
 * filtering through the `fetchEmployees` seam (a real GET /employees plugs in
 * there). The full directory is HR/Admin only: employees are 404'd by the route's
 * RoleGate, and a non-manager role that still reaches this route (Team Lead — its
 * people view is Team Overview) gets the no-access permission state, not the
 * roster. Row actions / bulk ops / selection are gated by `permitActions`.
 * ------------------------------------------------------------------------- */

const PAGE_SIZE = 8

const TABS: { key: string; label: string; status: string | null }[] = [
  { key: 'all', label: 'All', status: null },
  { key: 'active', label: 'Active', status: 'Active' },
  { key: 'leave', label: 'On leave', status: 'On leave' },
  { key: 'probation', label: 'Probation', status: 'Probation' },
]

type FacetValues = Record<string, string | string[]>

function asArray(value: string | string[] | undefined): string[] | undefined {
  if (Array.isArray(value)) return value.length ? value : undefined
  return value ? [value] : undefined
}

export function EmployeesScreen() {
  const role = useRole()
  // The directory is HR/Admin only. `canManage` also gates viewing here: a role
  // that reaches this route but isn't HR/Admin (Team Lead) gets the no-access
  // state below instead of the roster.
  const canManage = role === 'hr' || role === 'admin'
  const confirm = useConfirm()

  const confirmDeactivate = (label: string, done: () => void) =>
    confirm({
      title: `Deactivate ${label}?`,
      description: 'They lose access immediately. HR can restore them later.',
      confirmLabel: 'Deactivate',
      tone: 'destructive',
      onConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 700)) // simulate the server call
        done()
      },
    })

  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortingState>([{ id: 'person', desc: false }])
  const [facets, setFacets] = useState<FacetValues>({})
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('all')
  const [selected, setSelected] = useState<string[]>([])

  const tabStatus = TABS.find((t) => t.key === tab)?.status ?? null

  // Server-side fetch through the seam. A change to `queryKey` marks the data
  // stale (→ loading, derived below); the seam then resolves after a short
  // latency. Cleanup cancels superseded requests (and debounces typing). The
  // only setState is inside the async callback, so no cascading effect renders.
  const [loaded, setLoaded] = useState<{ key: string; result: EmployeePage } | null>(null)
  const queryKey = JSON.stringify({ page, sort, facets, q, tabStatus })

  useEffect(() => {
    const id = setTimeout(() => {
      const res = fetchEmployees({
        page,
        pageSize: PAGE_SIZE,
        sort,
        filters: {
          dept: asArray(facets.dept),
          type: asArray(facets.type),
          status: tabStatus ? [tabStatus] : undefined,
        },
        q,
      })
      setLoaded({ key: queryKey, result: res })
    }, 300)
    return () => clearTimeout(id)
  }, [queryKey, page, sort, facets, q, tabStatus])

  const isLoading = loaded?.key !== queryKey
  const result = loaded?.result ?? { rows: [], total: 0 }
  const status: DataViewStatus = isLoading ? 'loading' : result.total === 0 ? 'empty' : 'populated'

  // A new query invalidates the current page + selection.
  const resetToFirstPage = () => {
    setPage(1)
    setSelected([])
  }
  const changeFacet = (key: string, value: string | string[]) => {
    setFacets((prev) => ({ ...prev, [key]: value }))
    resetToFirstPage()
  }
  const clearFacets = () => {
    setFacets({})
    resetToFirstPage()
  }
  const changeSort = (next: SortingState) => {
    setSort(next)
    setPage(1)
  }
  const changeTab = (key: string) => {
    setTab(key)
    resetToFirstPage()
  }
  const changeQuery = (value: string) => {
    setQ(value)
    resetToFirstPage()
  }

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        id: 'person',
        header: 'Employee',
        accessorFn: (row) => row.name,
        cell: ({ row }) => <PersonCell name={row.original.name} sub={row.original.email} />,
        meta: { minWidth: '220px' },
      },
      {
        accessorKey: 'id',
        header: 'ID',
        enableSorting: false,
        cell: ({ getValue }) => <MonoText>{getValue<string>()}</MonoText>,
        meta: { width: '120px' },
      },
      { accessorKey: 'dept', header: 'Department', meta: { minWidth: '140px' } },
      { accessorKey: 'type', header: 'Type', meta: { minWidth: '110px' } },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => (
          <TableBadge tone={row.original.status.tone}>{row.original.status.label}</TableBadge>
        ),
        meta: { minWidth: '120px' },
      },
      {
        accessorKey: 'joined',
        header: 'Joined',
        cell: ({ getValue }) => formatJoined(getValue<string>()),
        meta: { align: 'end', width: '130px' },
      },
    ],
    [],
  )

  // Reached the route but not permitted to view the directory (Team Lead): show
  // the permission state, not the roster. (Employees never get here — 404'd.)
  if (!canManage) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 lg:p-10">
        <PageHeader
          title="Employees"
          description="Everyone in the Interloid workforce directory."
        />
        <DataViewList className="bg-card">
          <NoAccessState
            title="You don’t have access to the directory"
            description="The full employee directory is available to HR and Admins only."
          />
        </DataViewList>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 lg:p-10">
      <PageHeader
        title="Employees"
        description="Everyone in the Interloid workforce directory."
        badges={[{ label: `${result.total} total`, tone: 'neutral' }]}
        secondaryActions={[
          {
            label: 'Export',
            icon: <Download />,
            onClick: () => toast('Exporting directory (CSV)…'),
          },
        ]}
        primaryAction={
          canManage
            ? {
                label: 'Add employee',
                icon: <Plus />,
                onClick: () => toast('Opening add-employee form…'),
              }
            : undefined
        }
        tabs={TABS.map((t) => ({
          key: t.key,
          label: t.label,
          count: t.key === 'all' ? ALL_EMPLOYEES.length : undefined,
        }))}
        activeTab={tab}
        onTabChange={changeTab}
      />

      <DataTable
        columns={columns}
        data={result.rows}
        status={status}
        getRowId={(row) => row.id}
        // controlled / server-side pagination + sorting
        page={page}
        total={result.total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sort={sort}
        onSortChange={changeSort}
        // role-gated affordances — HR/Admin manage, others view read-only
        permitActions={canManage}
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
        bulkActions={[
          {
            label: 'Export',
            icon: <Download />,
            onClick: (keys) => toast(`Exported ${keys.length} selected`),
          },
          {
            label: 'Deactivate',
            icon: <Trash2 />,
            onClick: (keys) =>
              confirmDeactivate(`${keys.length} employees`, () =>
                toast(`Deactivated ${keys.length} employees`),
              ),
          },
        ]}
        rowActions={(row) => (
          <>
            <DropdownMenuItem onClick={() => toast(`Viewing ${row.name}`)}>
              <Eye />
              View profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast(`Editing ${row.name}`)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => confirmDeactivate(row.name, () => toast(`Deactivated ${row.name}`))}
            >
              <Trash2 />
              Deactivate
            </DropdownMenuItem>
          </>
        )}
        toolbar={
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                value={q}
                onChange={(event) => changeQuery(event.target.value)}
                placeholder="Search name, email, ID…"
                aria-label="Search employees"
                className="h-9 w-[200px] pl-8 md:w-[240px]"
              />
            </div>
            <FilterBar
              facets={FACETS}
              values={facets}
              onChange={changeFacet}
              onClearAll={clearFacets}
            />
          </div>
        }
        empty={
          <EmptyState
            title="No employees match your filters"
            description="Try broadening or clearing the active filters and search."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setFacets({})
                  setQ('')
                  setTab('all')
                  resetToFirstPage()
                }}
              >
                Clear filters
              </Button>
            }
          />
        }
      />
    </div>
  )
}
