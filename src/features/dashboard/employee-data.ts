import { CalendarCheck2, CalendarDays, FileClock, UserCheck } from 'lucide-react'
import type { DemoUser } from '@/features/auth/demo-users'
import { getMonth, summarize } from '@/features/my-attendance/data'
import { DEMO_HISTORY } from '@/features/my-leave/data'
import type { Kpi } from './data'

/* ---------------------------------------------------------------------------
 * Employee dashboard KPIs — summarised from the persona (resolveUser) and the
 * same demo sources the ESS screens use (My Leave / My Attendance), so the
 * dashboard and those screens agree. Reuses the HR branch's `Kpi` shape +
 * KpiCard. Each KPI deep-links (wired in employee-dashboard).
 * ------------------------------------------------------------------------- */

export function buildEmployeeKpis(user: DemoUser): Kpi[] {
  const { annual, sick, casual } = user.leaveBalance
  const totalLeave = +(annual + sick + casual).toFixed(1)
  const attendance = summarize(getMonth())
  const pending = DEMO_HISTORY.filter((request) => request.status === 'pending').length

  return [
    {
      key: 'leave-balance',
      label: 'Leave balance',
      value: String(totalLeave),
      sub: 'days available',
      icon: CalendarDays,
      iconTone: 'success',
      delta: '+1.5',
      deltaTone: 'success',
      deltaDir: 'up',
      spark: [
        totalLeave - 4,
        totalLeave - 3,
        totalLeave - 2.5,
        totalLeave - 1.5,
        totalLeave - 1,
        totalLeave,
      ],
      sparkColor: 'var(--chart-3)',
    },
    {
      key: 'attendance',
      label: `Attendance (${'June'})`,
      value: `${user.attendance.monthPct}%`,
      sub: 'vs 94% last month',
      icon: CalendarCheck2,
      iconTone: 'primary',
      delta: '+2%',
      deltaTone: 'success',
      deltaDir: 'up',
      spark: [90, 92, 91, 94, 93, user.attendance.monthPct],
      sparkColor: 'var(--chart-3)',
    },
    {
      key: 'present',
      label: 'Present days',
      value: String(attendance.present),
      sub: `${attendance.late} late · ${attendance.absent} absent`,
      icon: UserCheck,
      iconTone: 'info',
      delta: 'on track',
      deltaTone: 'muted',
      deltaDir: 'flat',
      spark: [10, 11, 12, 11, 12, attendance.present],
      sparkColor: 'var(--chart-1)',
    },
    {
      key: 'pending',
      label: 'Pending requests',
      value: String(pending),
      sub: 'awaiting approval',
      icon: FileClock,
      iconTone: 'warning',
      delta: pending > 0 ? `${pending} open` : 'none',
      deltaTone: 'muted',
      deltaDir: 'flat',
      spark: [0, 1, 1, 2, 1, pending],
      sparkColor: 'var(--chart-1)',
    },
  ]
}
