import type { DemoUser } from '@/features/auth/demo-users'

/* ---------------------------------------------------------------------------
 * My Leave data (design: My Leave.dc.html, project 8f1502f5).
 *
 * The current balance per type comes from the persona (resolveUser →
 * user.leaveBalance). ⚠ FLAG — the opening/accrued/used *ledger* and the entire
 * request *history* are NOT on the persona (it carries only a single available
 * number per type). Entitlements + history below are demo; a real
 * GET /leave/balances/{id}/ledger + GET /leave/requests replaces them.
 * ------------------------------------------------------------------------- */

export const LEAVE_TYPES = ['Annual', 'Sick', 'Casual', 'Unpaid'] as const

export interface LeaveBalance {
  key: string
  label: string
  available: number // real — from persona
  total: number // demo entitlement (opening + accrued)
  opening: number // demo
  accrued: number // demo
  used: number // derived: total - available
  color: string
}

// Demo entitlement split per type; `available` is filled from the persona.
const ENTITLEMENT: {
  key: keyof DemoUser['leaveBalance']
  label: string
  opening: number
  accrued: number
  color: string
}[] = [
  { key: 'annual', label: 'Annual', opening: 12, accrued: 6, color: 'var(--chart-1)' },
  { key: 'sick', label: 'Sick', opening: 12, accrued: 0, color: 'var(--chart-2)' },
  { key: 'casual', label: 'Casual', opening: 6, accrued: 0, color: 'var(--chart-3)' },
]

export function buildBalances(leaveBalance: DemoUser['leaveBalance']): LeaveBalance[] {
  return ENTITLEMENT.map((line) => {
    const total = line.opening + line.accrued
    const available = leaveBalance[line.key]
    return {
      key: line.key,
      label: line.label,
      available,
      total,
      opening: line.opening,
      accrued: line.accrued,
      used: Math.max(0, +(total - available).toFixed(1)),
      color: line.color,
    }
  })
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface LeaveRequest {
  id: string
  type: string
  dates: string
  days: number
  status: LeaveStatus
}

// ⚠ Demo — persona has no leave-request history.
export const DEMO_HISTORY: LeaveRequest[] = [
  { id: 'LR-2041', type: 'Annual', dates: '12–14 Jun', days: 3, status: 'pending' },
  { id: 'LR-2036', type: 'Casual', dates: '08–09 Jun', days: 2, status: 'approved' },
  { id: 'LR-2034', type: 'Annual', dates: '02–06 Jun', days: 5, status: 'approved' },
  { id: 'LR-2030', type: 'Casual', dates: '28 May', days: 1, status: 'rejected' },
]
