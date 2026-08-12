/* ---------------------------------------------------------------------------
 * Admin Console data (design: project 8f1502f5, `Admin Console.dc.html`).
 *
 * Reads per the manifest: `GET /roles`, `GET /employees` (as the user list),
 * `GET /attendance/sync/status`. Mutations: `POST /attendance/sync`.
 *
 * ⚠ The manifest flags this screen as the most endpoint-starved in the suite:
 *   "Gaps: **role assignment** (`/roles` is read-only in Phase 1a — no user↔role
 *    write endpoint), **user deactivation as a user** (only
 *    `DELETE /employees/{id}` exists), and the **eTimeOffice connection config**
 *    (credentials/test-connection/schedule + unmapped-device-ID queue) have
 *    **no spec endpoints**."
 *   So: the Users tab's role column is READ-ONLY here (no role-change action —
 *   the write endpoint doesn't exist), Deactivate maps to `DELETE /employees/{id}`
 *   rather than a user-level call, and the whole Integrations tab is unbacked.
 *   Invite is likewise unbacked — the manifest notes provisioning is "JIT via
 *   SSO only; there is no invite-accept / set-initial-password path".
 * ------------------------------------------------------------------------- */

export type UserStatus = 'active' | 'inactive' | 'locked' | 'invited'
export type AuthKind = 'sso' | 'fallback'

/** Role labels are display strings from `GET /roles` (read-only in Phase 1a). */
export type RoleLabel = 'Employee' | 'Team Lead' | 'HR Manager' | 'Super Admin'

export const ROLE_LABELS: RoleLabel[] = ['Employee', 'Team Lead', 'HR Manager', 'Super Admin']

export interface AdminUser {
  id: string
  name: string
  email: string
  role: RoleLabel
  auth: AuthKind
  status: UserStatus
}

export const STATUS_META: Record<
  UserStatus,
  { label: string; tone: 'success' | 'neutral' | 'destructive' | 'info' }
> = {
  active: { label: 'Active', tone: 'success' },
  inactive: { label: 'Inactive', tone: 'neutral' },
  locked: { label: 'Locked', tone: 'destructive' },
  invited: { label: 'Invited', tone: 'info' },
}

export function authLabel(auth: AuthKind) {
  return auth === 'sso' ? 'SSO' : 'Fallback'
}

/** Stand-in for `GET /employees` rendered as the user list. */
export function getUsers(): AdminUser[] {
  return [
    {
      id: '1',
      name: 'Devi Krishnan',
      email: 'devi.krishnan@interloid.com',
      role: 'Super Admin',
      auth: 'sso',
      status: 'active',
    },
    {
      id: '2',
      name: 'Priya Nair',
      email: 'priya.nair@interloid.com',
      role: 'HR Manager',
      auth: 'sso',
      status: 'active',
    },
    {
      id: '3',
      name: 'Rohan Das',
      email: 'rohan.das@interloid.com',
      role: 'Team Lead',
      auth: 'sso',
      status: 'active',
    },
    {
      id: '4',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@interloid.com',
      role: 'Employee',
      auth: 'sso',
      status: 'active',
    },
    {
      id: '5',
      name: 'Sameer Roy',
      email: 'sameer.roy@vendor.io',
      role: 'Employee',
      auth: 'fallback',
      status: 'active',
    },
    {
      id: '6',
      name: 'Vikram Shah',
      email: 'vikram.shah@interloid.com',
      role: 'Employee',
      auth: 'sso',
      status: 'locked',
    },
    {
      id: '7',
      name: 'Farhan Ali',
      email: 'farhan.ali@interloid.com',
      role: 'Employee',
      auth: 'sso',
      status: 'inactive',
    },
    {
      id: '8',
      name: 'Neha Joshi',
      email: 'neha.joshi@interloid.com',
      role: 'Employee',
      auth: 'sso',
      status: 'invited',
    },
  ]
}

/* ----- Roles matrix (GET /roles — read-only) ------------------------------ */

/** A matrix cell: full grant, none, or a qualified scope chip. */
export type MatrixValue =
  'yes' | 'no' | 'team' | 'team*' | 'all' | 'partial' | 'scoped' | 'full' | 'own' | 'request'

export interface MatrixRow {
  capability: string
  cells: MatrixValue[]
}

export const MATRIX_COLUMNS: RoleLabel[] = ROLE_LABELS

/** Mirrors the manifest's capability matrix verbatim. */
export const MATRIX_ROWS: MatrixRow[] = [
  {
    capability: 'My dashboard / profile / attendance / leave',
    cells: ['yes', 'yes', 'yes', 'yes'],
  },
  { capability: 'Apply for / cancel own leave', cells: ['yes', 'yes', 'yes', 'yes'] },
  { capability: 'View team attendance & leave', cells: ['no', 'team', 'all', 'all'] },
  { capability: 'Approve / reject leave', cells: ['no', 'team*', 'all', 'all'] },
  { capability: 'Create / edit employee records', cells: ['no', 'no', 'yes', 'yes'] },
  { capability: 'Regularise attendance', cells: ['no', 'request', 'yes', 'yes'] },
  { capability: 'Attendance sync & reg. approval', cells: ['no', 'no', 'yes', 'yes'] },
  { capability: 'Configure depts / shifts / leave types', cells: ['no', 'no', 'partial', 'full'] },
  { capability: 'Manage users, roles & integrations', cells: ['no', 'no', 'no', 'yes'] },
  { capability: 'Unified approvals queue', cells: ['own', 'team*', 'all', 'all'] },
  { capability: 'Audit log', cells: ['no', 'no', 'scoped', 'full'] },
]

export type ScopeTone = 'info' | 'primary' | 'warning' | 'neutral'

/** Tone for the qualified-scope chips (everything that isn't a plain ✓ / —). */
export const SCOPE_TONE: Record<string, ScopeTone> = {
  team: 'info',
  'team*': 'info',
  all: 'primary',
  full: 'primary',
  partial: 'warning',
  scoped: 'warning',
  request: 'warning',
  own: 'neutral',
}

/* ----- Integrations (no spec endpoints — see the header note) ------------- */

export type ConnectorStatus = 'connected' | 'error'

export interface ConnectorField {
  key: string
  label: string
  /** Write-only credential — never echoed back after saving. */
  secret?: boolean
  placeholder?: string
}

export interface Connector {
  key: string
  name: string
  subtitle: string
  status: ConnectorStatus
  lastCheck: string
  errorText?: string
  fields: ConnectorField[]
}

export function getConnectors(): Connector[] {
  return [
    {
      key: 'Entra ID',
      name: 'Microsoft Entra ID',
      subtitle: 'Identity provider · SSO',
      status: 'connected',
      lastCheck: 'today, 09:05',
      fields: [
        { key: 'tenant', label: 'Tenant ID', placeholder: '00000000-0000-…' },
        { key: 'client', label: 'Client ID', placeholder: 'app registration id' },
        { key: 'secret', label: 'Client secret', secret: true },
      ],
    },
    {
      key: 'eTimeOffice',
      name: 'eTimeOffice',
      subtitle: 'Biometric attendance device',
      status: 'error',
      lastCheck: 'today, 09:05',
      errorText: 'ETIMEDOUT · device unreachable',
      fields: [
        { key: 'endpoint', label: 'API endpoint', placeholder: 'https://device.local/api' },
        { key: 'apikey', label: 'API key', secret: true },
      ],
    },
  ]
}

export function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

export function emailError(value: string) {
  const text = value.trim()
  if (!text) return 'Email is required'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text)) return 'Enter a valid email'
  return ''
}
