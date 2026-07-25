/* ---------------------------------------------------------------------------
 * Demo users — the email → persona seam the real API later replaces.
 *
 * Today this is a static lookup. When a backend arrives, swap the body of
 * `resolveUser` for the login response / `GET /me` mapping and NOTHING else in
 * the app changes: the login flow, the auth provider, the role seam, and every
 * screen already read from the returned `DemoUser`. Three accounts share one
 * demo password (see `DEMO_PASSWORD`, documented in hrms-dev.md).
 * ------------------------------------------------------------------------- */

export type AppRole = 'employee' | 'lead' | 'hr' | 'admin'

export interface DemoUser {
  /** Employee code (mono id shown in the UI). */
  id: string
  name: string
  email: string
  role: AppRole
  /** Human role label for chrome (e.g. "HR Manager"). */
  title: string
  department: string
  /** Personal-data fields screens read (My Leave / My Attendance / Team). */
  leaveBalance: { annual: number; sick: number; casual: number }
  team: { name: string; size: number }
  attendance: {
    checkedInAt: string | null
    monthPct: number
    status: 'present' | 'on_leave' | 'absent'
  }
}

/** Shared demo password for every stub account. Documented in hrms-dev.md. */
export const DEMO_PASSWORD = 'interloid'

// Distinct personas so role-gated screens (via `role`) AND personal-data screens
// (via leaveBalance / team / attendance) render correctly for each account.
const PERSONAS: Record<string, DemoUser> = {
  'admin@interloid.com': {
    id: 'ITL-0001',
    name: 'Devi Krishnan',
    email: 'admin@interloid.com',
    role: 'admin',
    title: 'Super Admin',
    department: 'Administration',
    leaveBalance: { annual: 15, sick: 10, casual: 6 },
    team: { name: 'Organization', size: 1248 },
    attendance: { checkedInAt: '08:50', monthPct: 98, status: 'present' },
  },
  'hr@interloid.com': {
    id: 'ITL-0042',
    name: 'Priya Nair',
    email: 'hr@interloid.com',
    role: 'hr',
    title: 'HR Manager',
    department: 'People Ops',
    leaveBalance: { annual: 12, sick: 8, casual: 5 },
    team: { name: 'People Ops', size: 8 },
    attendance: { checkedInAt: '09:15', monthPct: 97, status: 'present' },
  },
  'employee@interloid.com': {
    id: 'ITL-0205',
    name: 'Arjun Rao',
    email: 'employee@interloid.com',
    role: 'employee',
    title: 'Analyst',
    department: 'Operations',
    leaveBalance: { annual: 8, sick: 6, casual: 4.5 },
    team: { name: 'Operations', size: 12 },
    attendance: { checkedInAt: '09:28', monthPct: 96, status: 'present' },
  },
}

/**
 * Resolve an email to its persona — the one place a real endpoint plugs in.
 * Case/whitespace-insensitive; returns null for an unknown address.
 */
export function resolveUser(email: string): DemoUser | null {
  return PERSONAS[email.trim().toLowerCase()] ?? null
}

/** The default persona (SSO / no-email paths, and the provider fallback). */
export const DEFAULT_DEMO_USER: DemoUser = PERSONAS['hr@interloid.com']!

/** Compact list for the login hint (order: admin, hr, employee). */
export const DEMO_ACCOUNTS = Object.values(PERSONAS).map((user) => ({
  email: user.email,
  title: user.title,
}))
