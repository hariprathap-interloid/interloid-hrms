import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  DataTable,
  MonoText,
  PersonCell,
  TableBadge,
  type BadgeTone,
  type ColumnDef,
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

// Bounds-safe cyclic pick (repo enables noUncheckedIndexedAccess).
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

const STATE_TABS: { key: DataViewStatus; label: string }[] = [
  { key: 'populated', label: 'Data' },
  { key: 'loading', label: 'Loading' },
  { key: 'empty', label: 'Empty' },
  { key: 'error', label: 'Error' },
  { key: 'no-access', label: 'No access' },
]

export function DataTableGallery() {
  const [status, setStatus] = useState<DataViewStatus>('populated')
  const [interactive, setInteractive] = useState(false)
  const [lastClicked, setLastClicked] = useState<string | null>(null)

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

  return (
    <div className="flex flex-col gap-4">
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
        {interactive && lastClicked && (
          <span className="text-small text-muted-foreground">
            Row navigated → <span className="text-foreground font-medium">{lastClicked}</span>
          </span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={EMPLOYEES}
        status={status}
        pageSize={6}
        defaultSort={[{ id: 'person', desc: false }]}
        getRowId={(row) => row.id}
        title="Employees"
        onRowClick={interactive ? (row) => setLastClicked(row.name) : undefined}
        empty={
          <EmptyState
            title="No employees match your filters"
            description="Try broadening or clearing the active filters."
            action={<Button variant="outline">Clear filters</Button>}
          />
        }
      />

      <p className="text-small text-muted-foreground">
        Rows are non-interactive by default (per the States spec). Toggle{' '}
        <strong className="text-foreground font-medium">Interactive rows</strong> to opt into the
        hover / pointer / keyboard navigation variant. Sorting is on{' '}
        <strong className="text-foreground font-medium">Employee</strong>,{' '}
        <strong className="text-foreground font-medium">Department</strong>, and{' '}
        <strong className="text-foreground font-medium">Joined</strong>; the non-populated states
        render through the shared DataView lifecycle.
      </p>
    </div>
  )
}
