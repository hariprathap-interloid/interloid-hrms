import type { BadgeTone, Facet, SortingState } from '@/components/data-table'

/* ---------------------------------------------------------------------------
 * Employees data + the server-query seam (design: Employees.dc.html, project
 * 8f1502f5 · API: GET /employees?q&filter[…]&sort&page&per_page).
 *
 * `fetchEmployees(query)` is the one place a real endpoint plugs in — it takes
 * the same shape a REST list call would (page / pageSize / sort / filters / q)
 * and returns `{ rows, total }` for the current page. Swap its body for a fetch
 * and the screen (controlled/server-side pagination) is unchanged.
 * ------------------------------------------------------------------------- */

export interface Employee {
  id: string
  name: string
  email: string
  dept: string
  type: string
  status: { label: string; tone: BadgeTone }
  joined: string // ISO yyyy-mm-dd
}

export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'People Ops',
  'Finance',
  'Sales',
  'Operations',
  'Marketing',
] as const

export const EMPLOYMENT_TYPES = ['Full-time', 'Contract', 'Intern'] as const

const STATUSES: Employee['status'][] = [
  { label: 'Active', tone: 'success' },
  { label: 'On leave', tone: 'warning' },
  { label: 'Probation', tone: 'info' },
  { label: 'Exited', tone: 'destructive' },
]

const FIRST = [
  'Aarav',
  'Priya',
  'Vikram',
  'Neha',
  'Sameer',
  'Diya',
  'Kabir',
  'Ananya',
  'Rohan',
  'Ishita',
  'Arjun',
  'Meera',
  'Dev',
  'Sara',
  'Farhan',
  'Tara',
]
const LAST = [
  'Mehta',
  'Nair',
  'Shah',
  'Joshi',
  'Roy',
  'Sharma',
  'Rao',
  'Iyer',
  'Gupta',
  'Bose',
  'Menon',
  'Pillai',
  'Patel',
  'Khan',
  'Ali',
  'Reddy',
]

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]!
}

// Weighted toward Active so the roster reads realistically.
function statusFor(i: number): Employee['status'] {
  if (i % 11 === 10) return STATUSES[3]! // Exited (rare)
  if (i % 7 === 6) return STATUSES[2]! // Probation
  if (i % 4 === 3) return STATUSES[1]! // On leave
  return STATUSES[0]! // Active (majority)
}

/** The full directory — 48 rows, so server-side pagination is meaningful. */
export const ALL_EMPLOYEES: Employee[] = Array.from({ length: 48 }, (_, i) => {
  const name = `${pick(FIRST, i)} ${pick(LAST, i * 3 + 1)}`
  return {
    id: `ITL-${String(101 + i * 3).padStart(4, '0')}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@interloid.com`,
    dept: pick(DEPARTMENTS, i * 2 + 1),
    type: pick(EMPLOYMENT_TYPES, i),
    status: statusFor(i),
    joined: `20${String(19 + (i % 7)).padStart(2, '0')}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
  }
})

export const FACETS: Facet[] = [
  { key: 'dept', label: 'Department', options: [...DEPARTMENTS], multi: true },
  { key: 'type', label: 'Type', options: [...EMPLOYMENT_TYPES], multi: true },
]

export interface EmployeeFilters {
  dept?: string[]
  type?: string[]
  status?: string[]
}

export interface EmployeeQuery {
  /** 1-based page. */
  page: number
  pageSize: number
  sort: SortingState
  filters: EmployeeFilters
  q?: string
}

export interface EmployeePage {
  rows: Employee[]
  total: number
}

function sortValue(employee: Employee, columnId: string): string {
  switch (columnId) {
    case 'person':
      return employee.name
    case 'dept':
      return employee.dept
    case 'type':
      return employee.type
    case 'joined':
      return employee.joined
    default:
      return employee.id
  }
}

/**
 * Filter → sort → paginate over the full dataset. This is the seam: a real
 * `GET /employees` replaces the body; the query/return shape stays the same.
 */
export function fetchEmployees({ page, pageSize, sort, filters, q }: EmployeeQuery): EmployeePage {
  const needle = q?.trim().toLowerCase()

  let rows = ALL_EMPLOYEES.filter((employee) => {
    if (filters.dept?.length && !filters.dept.includes(employee.dept)) return false
    if (filters.type?.length && !filters.type.includes(employee.type)) return false
    if (filters.status?.length && !filters.status.includes(employee.status.label)) return false
    if (
      needle &&
      !`${employee.name} ${employee.email} ${employee.id}`.toLowerCase().includes(needle)
    )
      return false
    return true
  })

  const primary = sort[0]
  if (primary) {
    rows = [...rows].sort((a, b) => {
      const av = sortValue(a, primary.id)
      const bv = sortValue(b, primary.id)
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return primary.desc ? -cmp : cmp
    })
  }

  const total = rows.length
  const start = (page - 1) * pageSize
  return { rows: rows.slice(start, start + pageSize), total }
}

export function formatJoined(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
