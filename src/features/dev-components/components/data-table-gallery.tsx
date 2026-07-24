import { useMemo, useState } from 'react'
import { Download, Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/layout/page-header'
import {
  DataTable,
  FilterBar,
  MonoText,
  PersonCell,
  TableBadge,
  type BadgeTone,
  type ColumnDef,
  type Facet,
  type SortingState,
} from '@/components/data-table'
import { EmptyState, type DataViewStatus } from '@/components/data-view'

interface Employee {
  id: string
  name: string
  email: string
  dept: string
  status: { label: string; tone: BadgeTone }
  joined: string
}

const DEPTS = ['Engineering', 'Design', 'People Ops', 'Finance', 'Sales']
const STATUSES: { label: string; tone: BadgeTone }[] = [
  { label: 'Active', tone: 'success' },
  { label: 'On leave', tone: 'warning' },
  { label: 'Probation', tone: 'info' },
  { label: 'Exited', tone: 'destructive' },
]
const NAMES = [
  'Aarav Mehta',
  'Priya Nair',
  'Vikram Shah',
  'Neha Joshi',
  'Sameer Roy',
  'Diya Sharma',
  'Kabir Rao',
  'Ananya Iyer',
  'Rohan Gupta',
  'Ishita Bose',
  'Arjun Menon',
  'Meera Pillai',
  'Dev Patel',
  'Sara Khan',
]

function cycle<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length] as T
}

const EMPLOYEES: Employee[] = NAMES.map((name, i) => ({
  id: `ITL-${String(42 + i * 7).padStart(4, '0')}`,
  name,
  email: `${name.toLowerCase().replace(/\s+/g, '.')}@interloid.com`,
  dept: cycle(DEPTS, i),
  status: cycle(STATUSES, i),
  joined: `20${20 + (i % 5)}-0${(i % 9) + 1}-1${i % 8}`,
}))

function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const FACETS: Facet[] = [
  { key: 'dept', label: 'Department', options: DEPTS, multi: true },
  { key: 'status', label: 'Status', options: STATUSES.map((s) => s.label), multi: true },
]

const STATE_TABS: { key: DataViewStatus; label: string }[] = [
  { key: 'populated', label: 'Data' },
  { key: 'loading', label: 'Loading' },
  { key: 'empty', label: 'Empty' },
  { key: 'error', label: 'Error' },
  { key: 'no-access', label: 'No access' },
]

type Filters = Record<string, string | string[]>

function matchesFilters(emp: Employee, filters: Filters) {
  const dept = filters.dept
  if (Array.isArray(dept) && dept.length > 0 && !dept.includes(emp.dept)) return false
  const status = filters.status
  if (Array.isArray(status) && status.length > 0 && !status.includes(emp.status.label)) return false
  return true
}

function sortValue(emp: Employee, id: string) {
  if (id === 'person') return emp.name
  if (id === 'dept') return emp.dept
  if (id === 'joined') return emp.joined
  return emp.id
}

function sortRows(rows: Employee[], sorting: SortingState) {
  const first = sorting[0]
  if (!first) return rows
  return [...rows].sort((a, b) => {
    const av = sortValue(a, first.id)
    const bv = sortValue(b, first.id)
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return first.desc ? -cmp : cmp
  })
}

const PAGE_SIZE = 6

export function DataTableGallery() {
  const [status, setStatus] = useState<DataViewStatus>('populated')
  const [interactive, setInteractive] = useState(false)
  const [filters, setFilters] = useState<Filters>({})
  const [sort, setSort] = useState<SortingState>([{ id: 'person', desc: false }])
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  // Server-style pipeline: filter → sort → paginate (the caller owns all three).
  const filtered = useMemo(() => EMPLOYEES.filter((e) => matchesFilters(e, filters)), [filters])
  const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort])
  const total = sorted.length
  const pageSlice = useMemo(
    () => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sorted, page],
  )

  const changeFilter = (key: string, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }
  const clearFilters = () => {
    setFilters({})
    setPage(1)
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
        meta: { width: '130px' },
      },
      { accessorKey: 'dept', header: 'Department', meta: { minWidth: '140px' } },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => (
          <TableBadge tone={row.original.status.tone}>{row.original.status.label}</TableBadge>
        ),
        meta: { minWidth: '130px' },
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

  const effectiveStatus: DataViewStatus = status === 'populated' && total === 0 ? 'empty' : status

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Employees"
        description="Everyone in the Interloid workforce directory."
        badges={[{ label: `${total} total`, tone: 'neutral' }]}
        secondaryActions={[
          { label: 'Export', icon: <Download />, onClick: () => setMessage('Exported directory') },
        ]}
        primaryAction={{
          label: 'Add employee',
          icon: <Plus />,
          onClick: () => setMessage('Opening add-employee form'),
        }}
        tabs={[
          { key: 'all', label: 'All', count: EMPLOYEES.length },
          { key: 'active', label: 'Active' },
          { key: 'leave', label: 'On leave' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* State switcher + interactive toggle */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="bg-muted inline-flex gap-0.5 rounded-[9px] p-[3px]">
          {STATE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatus(tab.key)}
              aria-pressed={status === tab.key}
              className={
                status === tab.key
                  ? 'bg-card text-small text-primary rounded-md px-[11px] py-[5px] font-medium'
                  : 'text-small text-muted-foreground rounded-md px-[11px] py-[5px] font-medium'
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="interactive-rows"
            checked={interactive}
            onCheckedChange={(value) => setInteractive(value === true)}
          />
          <Label htmlFor="interactive-rows" className="text-small text-muted-foreground">
            Interactive rows (opt-in)
          </Label>
        </div>
        {message && <span className="text-small text-muted-foreground">{message}</span>}
      </div>

      <DataTable
        columns={columns}
        data={pageSlice}
        status={effectiveStatus}
        // controlled/server-side pagination + sorting
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sort={sort}
        onSortChange={setSort}
        getRowId={(row) => row.id}
        // selection + bulk
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
        bulkActions={[
          {
            label: 'Export',
            icon: <Download />,
            onClick: (keys) => setMessage(`Exported ${keys.length} selected`),
          },
        ]}
        // per-row ⋯ actions
        rowActions={(row) => (
          <>
            <DropdownMenuItem onClick={() => setMessage(`View ${row.name}`)}>
              <Eye />
              View profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMessage(`Edit ${row.name}`)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setMessage(`Delete ${row.name}`)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </>
        )}
        onRowClick={interactive ? (row) => setMessage(`Navigated → ${row.name}`) : undefined}
        // FilterBar fills the toolbar slot
        toolbar={
          <FilterBar
            facets={FACETS}
            values={filters}
            onChange={changeFilter}
            onClearAll={clearFilters}
          />
        }
        empty={
          <EmptyState
            title="No employees match your filters"
            description="Try broadening or clearing the active filters."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        }
      />

      <p className="text-small text-muted-foreground">
        This grid drives{' '}
        <strong className="text-foreground font-medium">sorting + pagination server-side</strong>{' '}
        (filter → sort → paginate in the caller; client-side is the default when{' '}
        <code className="text-mono">page</code> is omitted). Selection shows a bulk bar, each row
        has a <strong className="text-foreground font-medium">⋯ menu</strong>, and{' '}
        <strong className="text-foreground font-medium">FilterBar</strong> fills the toolbar slot.
        Rows stay non-interactive unless you opt in.
      </p>
    </div>
  )
}
