/* ---------------------------------------------------------------------------
 * Configuration data (design: project 8f1502f5, `Configuration.dc.html`).
 *
 * Shapes follow the API spec's resources so the seam is honest:
 *   GET /departments · /employment_types · /leave_types · /leave_policies ·
 *   /shifts · /holidays?year= · /org/settings
 *
 * ⚠ Seam gaps carried from the manifest:
 *   - Only `Department`, `LeaveType` and `OrgSettings` have documented field
 *     schemas. "EmploymentType, LeavePolicy, Shift, Holiday … endpoints exist
 *     but the spec gives no field schema — treat these as under-defined."
 *   - `Department` is documented as `{id, name, parent_department_id}` only;
 *     the design's table also shows a **code**, a **head** and an employee
 *     **count**, none of which the spec provides (the same denormalised-name
 *     gap the manifest flags for the Employees directory).
 *   - `LeaveType` is documented as `{key, name, accrual_method, unit, paid}`;
 *     the design shows a **code**, an annual **quota** and **carry-forward**.
 * Fields tagged "not in spec" below are design-only until reconciled.
 * ------------------------------------------------------------------------- */

export type SectionKey =
  'org' | 'departments' | 'empTypes' | 'leaveTypes' | 'policies' | 'shifts' | 'holidays'

/** PATCH /org/settings — the one Admin-only section. */
export interface OrgSettings {
  leave_period_start_month: number // 1–12, default 4 (April)
  employee_code_prefix: string // e.g. "ITL-"
  timezone: string // default "Asia/Kolkata"
  locale: string // e.g. "en-IN"
}

export interface Department {
  id: string
  name: string
  parent_department_id: string | null
  code: string /* not in spec */
  head: string /* not in spec — needs a manager_id join */
  employee_count: number /* not in spec — needs an aggregate */
}

export interface EmploymentType {
  id: string
  name: string
  code: string
  paid: boolean
  description: string
}

export interface LeaveType {
  id: string
  key: string
  name: string
  accrual_method: 'granted' | 'accrued' | 'mixed'
  unit: 'day' | 'half_day'
  paid: boolean
  code: string /* not in spec */
  annual_quota: number /* not in spec */
  carry_forward: boolean /* not in spec */
}

export interface LeavePolicy {
  id: string
  name: string
  applies_to: string
  accrual: string
  max_carry_forward: number
  notice_days: number
}

export interface Shift {
  id: string
  name: string
  start_time: string // HH:mm
  end_time: string // HH:mm
  grace_minutes: number
  working_days: string
}

export interface Holiday {
  id: string
  date: string // YYYY-MM-DD
  name: string
  mandatory: boolean
}

export interface ConfigData {
  org: OrgSettings
  departments: Department[]
  empTypes: EmploymentType[]
  leaveTypes: LeaveType[]
  policies: LeavePolicy[]
  shifts: Shift[]
  holidays: Holiday[]
}

export const MANAGERS = [
  'Rohan Das',
  'Meera Iyer',
  'Anil Gupta',
  'Sunil Rao',
  'Devi Krishnan',
  'Priya Nair',
]

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'America/New_York',
]

export const LOCALES = ['en-IN', 'en-US', 'en-GB', 'en-SG']

/** Stand-in for the seven GETs above. */
export function getConfigData(): ConfigData {
  return {
    org: {
      leave_period_start_month: 4,
      employee_code_prefix: 'ITL',
      timezone: 'Asia/Kolkata',
      locale: 'en-IN',
    },
    departments: [
      {
        id: '1',
        name: 'Engineering',
        parent_department_id: null,
        code: 'ENG',
        head: 'Rohan Das',
        employee_count: 92,
      },
      {
        id: '2',
        name: 'Operations',
        parent_department_id: null,
        code: 'OPS',
        head: 'Sunil Rao',
        employee_count: 50,
      },
      {
        id: '3',
        name: 'Sales',
        parent_department_id: null,
        code: 'SAL',
        head: 'Anil Gupta',
        employee_count: 44,
      },
      {
        id: '4',
        name: 'Design',
        parent_department_id: null,
        code: 'DSN',
        head: 'Meera Iyer',
        employee_count: 28,
      },
      {
        id: '5',
        name: 'People Ops',
        parent_department_id: null,
        code: 'POP',
        head: 'Priya Nair',
        employee_count: 18,
      },
      {
        id: '6',
        name: 'Finance',
        parent_department_id: null,
        code: 'FIN',
        head: 'Devi Krishnan',
        employee_count: 16,
      },
    ],
    empTypes: [
      { id: '1', name: 'Full-Time', code: 'FT', paid: true, description: 'Permanent staff' },
      { id: '2', name: 'Trainee', code: 'TR', paid: true, description: 'Fixed-term graduate' },
      { id: '3', name: 'Contract', code: 'CON', paid: true, description: 'Vendor / contractor' },
    ],
    leaveTypes: [
      {
        id: '1',
        key: 'annual',
        name: 'Annual',
        accrual_method: 'accrued',
        unit: 'day',
        paid: true,
        code: 'AL',
        annual_quota: 18,
        carry_forward: true,
      },
      {
        id: '2',
        key: 'sick',
        name: 'Sick',
        accrual_method: 'granted',
        unit: 'day',
        paid: true,
        code: 'SL',
        annual_quota: 12,
        carry_forward: false,
      },
      {
        id: '3',
        key: 'casual',
        name: 'Casual',
        accrual_method: 'granted',
        unit: 'half_day',
        paid: true,
        code: 'CL',
        annual_quota: 8,
        carry_forward: false,
      },
      {
        id: '4',
        key: 'unpaid',
        name: 'Unpaid',
        accrual_method: 'granted',
        unit: 'day',
        paid: false,
        code: 'UP',
        annual_quota: 0,
        carry_forward: false,
      },
    ],
    policies: [
      {
        id: '1',
        name: 'Standard FTE',
        applies_to: 'Full-Time',
        accrual: 'Monthly',
        max_carry_forward: 5,
        notice_days: 3,
      },
      {
        id: '2',
        name: 'Trainee policy',
        applies_to: 'Trainee',
        accrual: 'On joining',
        max_carry_forward: 0,
        notice_days: 2,
      },
      {
        id: '3',
        name: 'Contract policy',
        applies_to: 'Contract',
        accrual: 'Annual',
        max_carry_forward: 0,
        notice_days: 5,
      },
    ],
    shifts: [
      {
        id: '1',
        name: 'General',
        start_time: '09:30',
        end_time: '18:30',
        grace_minutes: 15,
        working_days: 'Mon–Fri',
      },
      {
        id: '2',
        name: 'Early',
        start_time: '07:00',
        end_time: '16:00',
        grace_minutes: 10,
        working_days: 'Mon–Fri',
      },
      {
        id: '3',
        name: 'Late',
        start_time: '13:00',
        end_time: '22:00',
        grace_minutes: 10,
        working_days: 'Mon–Sat',
      },
    ],
    holidays: [
      { id: '1', date: '2026-01-26', name: 'Republic Day', mandatory: true },
      { id: '2', date: '2026-03-06', name: 'Holi', mandatory: true },
      { id: '3', date: '2026-08-15', name: 'Independence Day', mandatory: true },
      { id: '4', date: '2026-10-20', name: 'Diwali', mandatory: true },
      { id: '5', date: '2026-12-25', name: 'Christmas', mandatory: false },
    ],
  }
}

/* ----- Section definitions ------------------------------------------------ */

export type FieldKind = 'text' | 'number' | 'time' | 'date' | 'select'

export interface FieldDef {
  key: string
  label: string
  kind: FieldKind
  required?: boolean
  placeholder?: string
  /** Upper-case on save (codes). */
  upper?: boolean
  /** Half-width in the dialog's 2-col grid. */
  half?: boolean
  options?: { value: string; label: string }[]
}

export interface ColumnDef {
  key: string
  label: string
  mono?: boolean
  /** Renders as a yes/no chip. */
  badge?: boolean
  /** Value suffix, e.g. "days" / "min". */
  unit?: 'days' | 'min'
  date?: boolean
}

export interface SectionDef {
  key: SectionKey
  label: string
  /** Only Super Admin may open this section's controls. */
  adminOnly?: boolean
  kind: 'form' | 'table'
  title: string
  description: string
  /** Plural noun for counts / empty copy. */
  noun: string
  singular: string
  columns: ColumnDef[]
  fields: FieldDef[]
  minWidth: string
}

const YES_NO = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
]

export const SECTIONS: SectionDef[] = [
  {
    key: 'org',
    label: 'Org settings',
    adminOnly: true,
    kind: 'form',
    title: 'Organisation settings',
    description: 'Global defaults for the whole workspace.',
    noun: 'settings',
    singular: 'setting',
    columns: [],
    fields: [],
    minWidth: '0',
  },
  {
    key: 'departments',
    label: 'Departments',
    kind: 'table',
    title: 'Departments',
    description: 'Organisational units employees belong to.',
    noun: 'departments',
    singular: 'department',
    minWidth: '560px',
    columns: [
      { key: 'name', label: 'Department' },
      { key: 'code', label: 'Code', mono: true },
      { key: 'head', label: 'Head' },
      { key: 'employee_count', label: 'Employees' },
    ],
    fields: [
      { key: 'name', label: 'Name', kind: 'text', required: true, placeholder: 'e.g. Marketing' },
      {
        key: 'code',
        label: 'Code',
        kind: 'text',
        required: true,
        placeholder: 'e.g. MKT',
        half: true,
        upper: true,
      },
      {
        key: 'head',
        label: 'Department head',
        kind: 'select',
        half: true,
        options: MANAGERS.map((m) => ({ value: m, label: m })),
      },
    ],
  },
  {
    key: 'empTypes',
    label: 'Employment types',
    kind: 'table',
    title: 'Employment types',
    description: 'How staff are engaged.',
    noun: 'types',
    singular: 'type',
    minWidth: '520px',
    columns: [
      { key: 'name', label: 'Type' },
      { key: 'code', label: 'Code', mono: true },
      { key: 'paid', label: 'Paid', badge: true },
      { key: 'description', label: 'Description' },
    ],
    fields: [
      { key: 'name', label: 'Name', kind: 'text', required: true, half: true },
      { key: 'code', label: 'Code', kind: 'text', required: true, half: true, upper: true },
      { key: 'paid', label: 'Paid', kind: 'select', half: true, options: YES_NO },
      { key: 'description', label: 'Description', kind: 'text' },
    ],
  },
  {
    key: 'leaveTypes',
    label: 'Leave types',
    kind: 'table',
    title: 'Leave types',
    description: 'Categories of time off and their quotas.',
    noun: 'leave types',
    singular: 'leave type',
    minWidth: '560px',
    columns: [
      { key: 'name', label: 'Type' },
      { key: 'code', label: 'Code', mono: true },
      { key: 'annual_quota', label: 'Quota / yr', unit: 'days' },
      { key: 'paid', label: 'Paid', badge: true },
      { key: 'carry_forward', label: 'Carry-forward', badge: true },
    ],
    fields: [
      { key: 'name', label: 'Name', kind: 'text', required: true, half: true },
      { key: 'code', label: 'Code', kind: 'text', required: true, half: true, upper: true },
      {
        key: 'annual_quota',
        label: 'Annual quota (days)',
        kind: 'number',
        required: true,
        half: true,
      },
      { key: 'paid', label: 'Paid', kind: 'select', half: true, options: YES_NO },
      { key: 'carry_forward', label: 'Carry-forward', kind: 'select', half: true, options: YES_NO },
    ],
  },
  {
    key: 'policies',
    label: 'Leave policies',
    kind: 'table',
    title: 'Leave policies',
    description: 'Accrual and carry-forward rules by group.',
    noun: 'policies',
    singular: 'policy',
    minWidth: '600px',
    columns: [
      { key: 'name', label: 'Policy' },
      { key: 'applies_to', label: 'Applies to' },
      { key: 'accrual', label: 'Accrual' },
      { key: 'max_carry_forward', label: 'Max carry', unit: 'days' },
      { key: 'notice_days', label: 'Notice', unit: 'days' },
    ],
    fields: [
      { key: 'name', label: 'Policy name', kind: 'text', required: true },
      {
        key: 'applies_to',
        label: 'Applies to',
        kind: 'select',
        required: true,
        half: true,
        options: [
          { value: 'Full-Time', label: 'Full-Time' },
          { value: 'Trainee', label: 'Trainee' },
          { value: 'Contract', label: 'Contract' },
          { value: 'All', label: 'All employees' },
        ],
      },
      {
        key: 'accrual',
        label: 'Accrual',
        kind: 'select',
        half: true,
        options: [
          { value: 'Monthly', label: 'Monthly' },
          { value: 'Annual', label: 'Annual' },
          { value: 'On joining', label: 'On joining' },
        ],
      },
      { key: 'max_carry_forward', label: 'Max carry-forward (days)', kind: 'number', half: true },
      { key: 'notice_days', label: 'Notice period (days)', kind: 'number', half: true },
    ],
  },
  {
    key: 'shifts',
    label: 'Shifts',
    kind: 'table',
    title: 'Shifts',
    description: 'Working-hour templates and grace windows.',
    noun: 'shifts',
    singular: 'shift',
    minWidth: '560px',
    columns: [
      { key: 'name', label: 'Shift' },
      { key: 'start_time', label: 'Start', mono: true },
      { key: 'end_time', label: 'End', mono: true },
      { key: 'grace_minutes', label: 'Grace', unit: 'min' },
      { key: 'working_days', label: 'Days' },
    ],
    fields: [
      { key: 'name', label: 'Shift name', kind: 'text', required: true },
      { key: 'start_time', label: 'Start time', kind: 'time', required: true, half: true },
      { key: 'end_time', label: 'End time', kind: 'time', required: true, half: true },
      { key: 'grace_minutes', label: 'Grace (minutes)', kind: 'number', half: true },
      {
        key: 'working_days',
        label: 'Working days',
        kind: 'text',
        placeholder: 'e.g. Mon–Fri',
        half: true,
      },
    ],
  },
  {
    key: 'holidays',
    label: 'Holiday calendar',
    kind: 'table',
    title: 'Holiday calendar',
    description: 'Company holidays for 2026.',
    noun: 'holidays',
    singular: 'holiday',
    minWidth: '480px',
    columns: [
      { key: 'date', label: 'Date', date: true },
      { key: 'name', label: 'Holiday' },
      { key: 'mandatory', label: 'Type', badge: true },
    ],
    fields: [
      { key: 'date', label: 'Date', kind: 'date', required: true, half: true },
      {
        key: 'mandatory',
        label: 'Type',
        kind: 'select',
        half: true,
        options: [
          { value: 'true', label: 'Mandatory' },
          { value: 'false', label: 'Optional' },
        ],
      },
      { key: 'name', label: 'Holiday name', kind: 'text', required: true },
    ],
  },
]

export function sectionFor(key: SectionKey): SectionDef {
  return SECTIONS.find((s) => s.key === key) ?? SECTIONS[1]!
}

/** Sections a role may *act* in. HR is "partial — depts/shifts/leave types/holidays". */
export function isSectionLocked(section: SectionDef, isAdmin: boolean) {
  return Boolean(section.adminOnly) && !isAdmin
}

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function formatDate(iso: string) {
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return iso
  return `${Number(day)} ${MONTH_SHORT[Number(month) - 1]} ${year}`
}

/** Rows are `Record<string, unknown>`; only primitives are ever displayable. */
export function asText(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

/** Renders a cell value per its column hints. Booleans become Yes/No chips upstream. */
export function cellText(column: ColumnDef, value: unknown): string {
  if (column.date && typeof value === 'string') return formatDate(value)
  if (column.unit === 'days') {
    const n = Number(value) || 0
    return `${n} ${n === 1 ? 'day' : 'days'}`
  }
  if (column.unit === 'min') return `${Number(value) || 0} min`
  return asText(value)
}

/** The design's yes/no chip label — holidays read Mandatory/Optional. */
export function badgeLabel(sectionKey: SectionKey, value: boolean) {
  if (sectionKey === 'holidays') return value ? 'Mandatory' : 'Optional'
  return value ? 'Yes' : 'No'
}

export function fieldError(field: FieldDef, value: unknown): string {
  const text = asText(value).trim()
  if (field.required && !text) return `${field.label} is required`
  if (field.kind === 'number' && text !== '' && (Number.isNaN(Number(text)) || Number(text) < 0)) {
    return 'Enter a valid number'
  }
  return ''
}
