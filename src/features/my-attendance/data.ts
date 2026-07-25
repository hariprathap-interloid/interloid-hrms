/* ---------------------------------------------------------------------------
 * My Attendance data (design: My Attendance.dc.html, project 8f1502f5).
 *
 * ⚠ FLAG — the persona carries only `attendance {checkedInAt, monthPct, status}`
 * (a single current snapshot). The day-by-day ledger below — per-day status,
 * punch in/out, worked minutes, late marks, shift, regularisation state — is
 * demo, shaped like the endpoints that will replace it:
 *   • getMonth()  → GET /attendance/days?month=YYYY-MM   (AttendanceDay[])
 *   • day.punches → GET /attendance/days/:iso/punches    (Punch[])
 *   • day.regularisationPending → the row's open regularisation request.
 * Swapping in the API means replacing getMonth(); the UI already renders punches
 * and the pending flag, so those two pieces are complete-pending-API, not stubs.
 * ------------------------------------------------------------------------- */

export type AttStatus = 'present' | 'absent' | 'weekly_off' | 'holiday' | 'on_leave' | 'partial'

/** A single device punch — shaped like a GET /punches row. */
export interface Punch {
  type: 'in' | 'out'
  time: string
  /** Reader + gate, e.g. "eSSL · Gate A". */
  device: string
}

export interface AttendanceDay {
  iso: string
  day: number
  dow: string
  status: AttStatus
  isLate: boolean
  firstIn: string | null
  lastOut: string | null
  workedMin: number | null
  /** Raw device punches for the day (empty on off days). */
  punches: Punch[]
  /** A regularisation request is open and awaiting HR approval. */
  regularisationPending: boolean
}

export const SHIFT_MINUTES = 540 // 9h
export const SHIFT_LABEL = '09:30 – 18:30' // fixed shift window (static, as the design shows it)
export const MONTH_LABEL = 'June 2026'
/** The current day — gets the calendar's "today" ring. */
export const TODAY_ISO = '2026-06-30'

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
  // On leave = brand/indigo, distinct from Partial's amber so the legend reads clearly.
  on_leave: { label: 'On leave', tone: 'bg-primary-bg text-primary', dot: 'bg-primary' },
  partial: {
    label: 'Partial',
    tone: 'bg-warning-subtle text-warning-subtle-foreground',
    dot: 'bg-warning',
  },
  holiday: { label: 'Holiday', tone: 'bg-info-subtle text-info-subtle-foreground', dot: 'bg-info' },
  weekly_off: {
    label: 'Weekly off',
    tone: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const GATE_A = 'eSSL · Gate A'
const GATE_B = 'eSSL · Gate B'

/** Deterministic demo month — the full June 2026 (30 days), Mon-start. */
export function getMonth(): AttendanceDay[] {
  const days: AttendanceDay[] = []
  for (let day = 1; day <= 30; day += 1) {
    const date = new Date(2026, 5, day)
    const weekday = date.getDay()
    const iso = `2026-06-${String(day).padStart(2, '0')}`
    const base = {
      iso,
      day,
      dow: DOW[weekday]!,
      isLate: false,
      firstIn: null,
      lastOut: null,
      workedMin: null,
      punches: [] as Punch[],
      regularisationPending: false,
    }

    if (weekday === 0 || weekday === 6) {
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
      // Left early → a regularisation request is open, awaiting HR.
      days.push({
        ...base,
        status: 'partial',
        firstIn: '09:30',
        lastOut: '13:28',
        workedMin: 238,
        punches: [
          { type: 'in', time: '09:30', device: GATE_A },
          { type: 'out', time: '13:28', device: GATE_B },
        ],
        regularisationPending: true,
      })
      continue
    }
    if (day === 3) {
      // A richer punch log — out for lunch, back in.
      days.push({
        ...base,
        status: 'present',
        firstIn: '09:16',
        lastOut: '18:20',
        workedMin: 505,
        punches: [
          { type: 'in', time: '09:16', device: GATE_A },
          { type: 'out', time: '13:02', device: GATE_B },
          { type: 'in', time: '13:41', device: GATE_B },
          { type: 'out', time: '18:20', device: GATE_A },
        ],
      })
      continue
    }
    const late = day === 2 || day === 9 || day === 23
    const firstIn = late ? '09:52' : '09:18'
    const lastOut = '18:24'
    days.push({
      ...base,
      status: 'present',
      isLate: late,
      firstIn,
      lastOut,
      workedMin: late ? 452 : 486,
      punches: [
        { type: 'in', time: firstIn, device: GATE_A },
        { type: 'out', time: lastOut, device: GATE_A },
      ],
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

/** "18 Jun" — compact date for list rows. */
export function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

/** "18 June 2026" — full date for the day-detail drawer header. */
export function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
