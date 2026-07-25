/* ---------------------------------------------------------------------------
 * My Attendance data (design: My Attendance.dc.html, project 8f1502f5).
 *
 * ⚠ FLAG — the persona carries only `attendance {checkedInAt, monthPct, status}`
 * (a single current snapshot). The day-by-day ledger below — per-day status,
 * punch in/out, worked minutes, late marks, shift, regularisation state — is
 * demo. A real GET /attendance/days + /punch_logs replaces `getMonth()`.
 * ------------------------------------------------------------------------- */

export type AttStatus = 'present' | 'absent' | 'weekly_off' | 'holiday' | 'on_leave' | 'partial'

export interface AttendanceDay {
  iso: string
  day: number
  dow: string
  status: AttStatus
  isLate: boolean
  firstIn: string | null
  lastOut: string | null
  workedMin: number | null
}

export const SHIFT_MINUTES = 540 // 9h (09:30–18:30)

export const STATUS_META: Record<AttStatus, { label: string; tone: string; dot: string }> = {
  present: {
    label: 'Present',
    tone: 'bg-success-subtle text-success-subtle-foreground',
    dot: 'bg-success',
  },
  absent: {
    label: 'Absent',
    tone: 'bg-destructive-subtle text-destructive-subtle-foreground',
    dot: 'bg-destructive',
  },
  weekly_off: {
    label: 'Weekly off',
    tone: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
  holiday: { label: 'Holiday', tone: 'bg-info-subtle text-info-subtle-foreground', dot: 'bg-info' },
  on_leave: {
    label: 'On leave',
    tone: 'bg-warning-subtle text-warning-subtle-foreground',
    dot: 'bg-warning',
  },
  partial: {
    label: 'Partial',
    tone: 'bg-warning-subtle text-warning-subtle-foreground',
    dot: 'bg-warning',
  },
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const MONTH_LABEL = 'June 2026'

/** Deterministic demo month (June 2026, days 1–20). */
export function getMonth(): AttendanceDay[] {
  const days: AttendanceDay[] = []
  for (let day = 1; day <= 20; day += 1) {
    const date = new Date(2026, 5, day)
    const dow = DOW[date.getDay()]!
    const iso = `2026-06-${String(day).padStart(2, '0')}`
    const base = { iso, day, dow, isLate: false, firstIn: null, lastOut: null, workedMin: null }

    if (date.getDay() === 0 || date.getDay() === 6) {
      days.push({ ...base, status: 'weekly_off' })
      continue
    }
    if (day === 5) {
      days.push({ ...base, status: 'absent' })
      continue
    }
    if (day === 12) {
      days.push({ ...base, status: 'on_leave' })
      continue
    }
    if (day === 16) {
      days.push({ ...base, status: 'holiday' })
      continue
    }
    if (day === 18) {
      days.push({ ...base, status: 'partial', firstIn: '09:30', lastOut: '13:28', workedMin: 238 })
      continue
    }
    const late = day === 2 || day === 9
    days.push({
      ...base,
      status: 'present',
      isLate: late,
      firstIn: late ? '09:52' : '09:18',
      lastOut: '18:24',
      workedMin: late ? 452 : 486,
    })
  }
  return days
}

export interface AttendanceSummary {
  present: number
  late: number
  onLeave: number
  absent: number
}

export function summarize(days: AttendanceDay[]): AttendanceSummary {
  return {
    present: days.filter((d) => d.status === 'present' || d.status === 'partial').length,
    late: days.filter((d) => d.isLate).length,
    onLeave: days.filter((d) => d.status === 'on_leave').length,
    absent: days.filter((d) => d.status === 'absent').length,
  }
}

export function workedLabel(minutes: number | null): string {
  if (minutes == null) return '—'
  return `${(minutes / 60).toFixed(1)}h`
}

export function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}
