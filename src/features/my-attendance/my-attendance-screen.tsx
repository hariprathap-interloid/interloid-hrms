import { useEffect, useMemo, useState } from 'react'
import { CalendarOff, CircleAlert, Clock3, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import {
  DataView,
  DataViewList,
  EmptyState,
  SkeletonKpis,
  SkeletonRows,
  type DataViewStatus,
} from '@/components/data-view'
import { useAuth } from '@/features/auth/use-auth'
import { cn } from '@/lib/utils'
import {
  getMonth,
  longDate,
  MONTH_LABEL,
  SHIFT_MINUTES,
  STATUS_META,
  summarize,
  workedLabel,
  type AttendanceDay,
} from './data'

/* ---------------------------------------------------------------------------
 * My Attendance (design: My Attendance.dc.html) at /me/attendance — all roles.
 * Stat cards (SkeletonKpis loading) + a day list (DataViewList) with per-day
 * status + punch times + a worked-hours bar. ⚠ Only today's snapshot comes from
 * the persona (attendance.checkedInAt/status); the month ledger is demo (./data).
 * The calendar-grid view + day-detail drawer + regularisation form are deferred
 * (they need punch-log data + an approval workflow the persona doesn't carry).
 * ------------------------------------------------------------------------- */

const STAT_META = [
  {
    key: 'present',
    label: 'Present',
    icon: UserCheck,
    tone: 'bg-success-subtle text-success-subtle-foreground',
  },
  {
    key: 'late',
    label: 'Late marks',
    icon: Clock3,
    tone: 'bg-warning-subtle text-warning-subtle-foreground',
  },
  { key: 'onLeave', label: 'On leave', icon: CalendarOff, tone: 'bg-primary-bg text-primary' },
  {
    key: 'absent',
    label: 'Absent',
    icon: CircleAlert,
    tone: 'bg-destructive-subtle text-destructive-subtle-foreground',
  },
] as const

export function MyAttendanceScreen() {
  const { user } = useAuth()
  const days = useMemo(() => getMonth(), [])
  const summary = useMemo(() => summarize(days), [days])

  const [status, setStatus] = useState<DataViewStatus>('loading')
  useEffect(() => {
    const id = setTimeout(() => setStatus('populated'), 500)
    return () => clearTimeout(id)
  }, [])

  const checkedIn = user?.attendance.checkedInAt

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 lg:p-10">
      <PageHeader
        title="Attendance"
        description={
          checkedIn
            ? `${MONTH_LABEL} · checked in today at ${checkedIn}`
            : `${MONTH_LABEL} · your monthly record`
        }
        secondaryActions={[
          {
            label: 'Request correction',
            onClick: () => toast('Regularisation needs the day detail — deferred (see notes).'),
          },
        ]}
      />

      {/* Stat cards */}
      {status === 'loading' ? (
        <SkeletonKpis cards={4} className="grid-cols-2 gap-4 lg:grid-cols-4" />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STAT_META.map((stat) => (
            <div
              key={stat.key}
              className="border-border bg-card rounded-[14px] border p-[18px] shadow-sm"
            >
              <span
                className={cn(
                  'flex size-[30px] items-center justify-center rounded-lg [&_svg]:size-4',
                  stat.tone,
                )}
              >
                <stat.icon strokeWidth={1.8} />
              </span>
              <div className="text-foreground mt-3 text-[26px] leading-none font-bold tracking-[-0.02em] tabular-nums">
                {summary[stat.key]}
              </div>
              <div className="text-muted-foreground mt-1.5 text-[12.5px]">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Day list */}
      <section className="border-border bg-card overflow-hidden rounded-[14px] border shadow-sm">
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <div className="text-foreground text-[14px] font-semibold">Daily log</div>
          <div className="text-muted-foreground text-[12px]">{MONTH_LABEL}</div>
        </div>
        <DataViewList className="rounded-none border-0 shadow-none">
          <DataView
            status={status}
            loading={<SkeletonRows rows={6} withStatus />}
            empty={
              <EmptyState title="No attendance this month" description="Nothing recorded yet." />
            }
          >
            {days.map((day) => (
              <DayRow key={day.iso} day={day} />
            ))}
          </DataView>
        </DataViewList>
      </section>
    </div>
  )
}

function DayRow({ day }: { day: AttendanceDay }) {
  const meta = STATUS_META[day.status]
  const worked = day.workedMin
  const pct = worked != null ? Math.min(100, Math.round((worked / SHIFT_MINUTES) * 100)) : 0
  return (
    <div className="border-border flex items-center gap-3 border-t px-5 py-3">
      <div className="w-[70px] shrink-0">
        <div className="text-foreground text-[13.5px] font-semibold tabular-nums">
          {longDate(day.iso)}
        </div>
        <div className="text-muted-foreground text-[11px]">{day.dow}</div>
      </div>

      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11.5px] font-medium',
          meta.tone,
        )}
      >
        <span className={cn('size-1.5 rounded-full', meta.dot)} />
        {meta.label}
      </span>
      {day.isLate && (
        <span className="bg-warning-subtle text-warning-subtle-foreground shrink-0 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold">
          LATE
        </span>
      )}

      <div className="flex-1" />

      {worked != null ? (
        <>
          <div className="hidden shrink-0 gap-4 font-mono text-[12px] sm:flex">
            <span className="text-muted-foreground">
              in <span className="text-foreground">{day.firstIn}</span>
            </span>
            <span className="text-muted-foreground">
              out <span className="text-foreground">{day.lastOut}</span>
            </span>
          </div>
          <div className="w-[110px] shrink-0">
            <div className="text-muted-foreground mb-1 text-right text-[11.5px] font-medium tabular-nums">
              {workedLabel(worked)}
            </div>
            <div className="bg-muted h-1.5 overflow-hidden rounded-full">
              <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </>
      ) : (
        <span className="text-muted-foreground shrink-0 text-[12px]">—</span>
      )}
    </div>
  )
}
