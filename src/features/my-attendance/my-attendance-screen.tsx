import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
  LogIn,
  LogOut,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import {
  DataView,
  DataViewList,
  EmptyState,
  ErrorState,
  Shimmer,
  SkeletonKpis,
  SkeletonRows,
} from '@/components/data-view'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAuth } from '@/features/auth/use-auth'
import { cn } from '@/lib/utils'
import {
  fullDate,
  getMonth,
  longDate,
  SHIFT_LABEL,
  SHIFT_MINUTES,
  STATUS_META,
  summarize,
  TODAY_ISO,
  workedLabel,
  type AttendanceDay,
  type AttStatus,
} from './data'

/* ---------------------------------------------------------------------------
 * My Attendance (design: My Attendance.dc.html) at /me/attendance — all roles.
 * Header (title + month stepper + Calendar/List toggle) → stat cards → legend →
 * body (a Mon-start calendar grid or the list) → a day-detail drawer (Sheet)
 * with punch log + a regularisation form. ⚠ Only today's snapshot comes from the
 * persona (attendance.checkedInAt); the month ledger, punch log and pending flag
 * are demo, shaped like the real endpoints (see ./data).
 * ------------------------------------------------------------------------- */

type LoadState = 'loading' | 'error' | 'empty' | 'populated'
type ViewMode = 'calendar' | 'list'

const STAT_META = [
  { key: 'present', label: 'Present', dot: 'bg-success' },
  { key: 'late', label: 'Late marks', dot: 'bg-warning' },
  { key: 'onLeave', label: 'On leave', dot: 'bg-primary' },
  { key: 'absent', label: 'Absent', dot: 'bg-destructive' },
] as const

const LEGEND_ORDER: AttStatus[] = [
  'present',
  'absent',
  'on_leave',
  'partial',
  'holiday',
  'weekly_off',
]

// Month label from an offset (0 = June 2026, the one populated month).
function monthLabel(offset: number): string {
  return new Date(2026, 5 + offset, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

export function MyAttendanceScreen() {
  const { user } = useAuth()
  const [view, setView] = useState<ViewMode>('calendar')
  const [offset, setOffset] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [recoveredPrev, setRecoveredPrev] = useState(false)
  const [selected, setSelected] = useState<AttendanceDay | null>(null)

  const days = useMemo(() => (offset === 0 ? getMonth() : []), [offset])
  const summary = useMemo(() => summarize(days), [days])
  const label = monthLabel(offset)

  // Derived loading: while the resolved result is stale vs the current query key
  // we show the skeleton, and only ever setState inside the async callback (so we
  // never call setState synchronously in the effect). Simulated month fetch —
  // June (offset 0) → populated; the previous month (offset −1) fails once so the
  // error+retry path is reachable, then recovers to empty; others are empty.
  const queryKey = `${offset}:${reloadKey}`
  const [resolved, setResolved] = useState<{ key: string; state: Exclude<LoadState, 'loading'> }>({
    key: '',
    state: 'populated',
  })

  useEffect(() => {
    const id = setTimeout(() => {
      const next: Exclude<LoadState, 'loading'> =
        offset === 0 ? 'populated' : offset === -1 && !recoveredPrev ? 'error' : 'empty'
      setResolved({ key: queryKey, state: next })
    }, 450)
    return () => clearTimeout(id)
  }, [queryKey, offset, recoveredPrev])

  const state: LoadState = resolved.key === queryKey ? resolved.state : 'loading'

  const retry = () => {
    if (offset === -1) setRecoveredPrev(true)
    setReloadKey((k) => k + 1)
  }
  const refresh = () => setReloadKey((k) => k + 1)

  const checkedIn = offset === 0 ? user?.attendance.checkedInAt : null

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 lg:p-10">
      <PageHeader
        title="Attendance"
        description={
          checkedIn
            ? `Your monthly record · checked in today at ${checkedIn}`
            : 'Your monthly attendance record'
        }
        actions={
          <div className="flex items-center gap-2">
            <MonthStepper
              label={label}
              onPrev={() => setOffset((o) => o - 1)}
              onNext={() => setOffset((o) => o + 1)}
            />
            <ViewToggle view={view} onChange={setView} />
          </div>
        }
      />

      {/* Stat cards — hidden on error (no numbers to trust). */}
      {state === 'loading' ? (
        <SkeletonKpis cards={4} className="grid-cols-2 gap-4 lg:grid-cols-4" />
      ) : state === 'error' ? null : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STAT_META.map((stat) => (
            <div
              key={stat.key}
              className="border-border bg-card rounded-[14px] border p-[18px] shadow-sm"
            >
              <div className="text-foreground text-[26px] leading-none font-bold tracking-[-0.02em] tabular-nums">
                {summary[stat.key]}
              </div>
              <div className="text-muted-foreground mt-2 inline-flex items-center gap-1.5 text-[12.5px]">
                <span className={cn('size-1.5 rounded-full', stat.dot)} />
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <Legend />

      {/* Body — calendar / list, with the loading / error / empty states. */}
      <DataView
        status={state}
        loading={view === 'calendar' ? <CalendarSkeleton /> : <ListSkeleton />}
        error={
          <DataViewList className="bg-card shadow-sm">
            <ErrorState
              title="Couldn't load your attendance"
              description="The attendance service didn't respond. Check your connection and try again."
              code="503 · service_unavailable"
              action={
                <Button variant="outline" onClick={retry}>
                  <RefreshCw />
                  Retry
                </Button>
              }
            />
          </DataViewList>
        }
        empty={
          <DataViewList className="bg-card shadow-sm">
            <EmptyState
              title={`No attendance for ${label}`}
              description="There are no records for this month yet."
              action={
                <Button variant="outline" onClick={refresh}>
                  <RefreshCw />
                  Refresh
                </Button>
              }
            />
          </DataViewList>
        }
      >
        {view === 'calendar' ? (
          <CalendarGrid days={days} onSelect={setSelected} />
        ) : (
          <AttendanceList days={days} onSelect={setSelected} />
        )}
      </DataView>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-[420px]">
          {selected ? (
            <DayDetail key={selected.iso} day={selected} />
          ) : (
            <SheetHeader className="sr-only">
              <SheetTitle>Day detail</SheetTitle>
            </SheetHeader>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

/* ----- header controls --------------------------------------------------- */

function MonthStepper({
  label,
  onPrev,
  onNext,
}: {
  label: string
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="border-border bg-card flex items-center gap-1 rounded-[10px] border p-1">
      <Button variant="ghost" size="icon-sm" onClick={onPrev} aria-label="Previous month">
        <ChevronLeft />
      </Button>
      <span className="text-foreground min-w-[104px] text-center text-[13px] font-semibold tabular-nums">
        {label}
      </span>
      <Button variant="ghost" size="icon-sm" onClick={onNext} aria-label="Next month">
        <ChevronRight />
      </Button>
    </div>
  )
}

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  const options = [
    { key: 'calendar' as const, label: 'Calendar', icon: CalendarDays },
    { key: 'list' as const, label: 'List', icon: List },
  ]
  return (
    <div className="border-border bg-card inline-flex rounded-[10px] border p-1">
      {options.map((option) => {
        const active = view === option.key
        const Icon = option.icon
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[7px] px-3 py-1.5 text-[13px] font-medium transition',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {LEGEND_ORDER.map((status) => (
        <span
          key={status}
          className="text-muted-foreground inline-flex items-center gap-1.5 text-[12px]"
        >
          <span className={cn('size-2 rounded-full', STATUS_META[status].dot)} />
          {STATUS_META[status].label}
        </span>
      ))}
    </div>
  )
}

/* ----- calendar view ----------------------------------------------------- */

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SKELETON_CELLS = Array.from({ length: 35 }, (_, index) => `cell-${index}`)

function CalendarGrid({
  days,
  onSelect,
}: {
  days: AttendanceDay[]
  onSelect: (day: AttendanceDay) => void
}) {
  // Mon-start: how many blank cells before the 1st.
  const firstWeekday = new Date(days[0]!.iso).getDay() // 0 Sun … 6 Sat
  const leading = (firstWeekday + 6) % 7

  return (
    <section className="border-border bg-card overflow-hidden rounded-[14px] border shadow-sm">
      <div className="border-border grid grid-cols-7 border-b">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="text-muted-foreground px-3 py-2.5 text-[11px] font-semibold tracking-wide uppercase"
          >
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {WEEKDAYS.slice(0, leading).map((weekday) => (
          <div
            key={`blank-${weekday}`}
            className="border-border bg-muted/20 min-h-[104px] border-t border-l"
          />
        ))}
        {days.map((day) => (
          <DayCell key={day.iso} day={day} onSelect={onSelect} />
        ))}
      </div>
    </section>
  )
}

function DayCell({
  day,
  onSelect,
}: {
  day: AttendanceDay
  onSelect: (day: AttendanceDay) => void
}) {
  const meta = STATUS_META[day.status]
  const isToday = day.iso === TODAY_ISO
  const isWorkday = day.punches.length > 0
  const pct =
    day.workedMin != null ? Math.min(100, Math.round((day.workedMin / SHIFT_MINUTES) * 100)) : 0

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={cn(
        'group border-border hover:bg-accent focus-visible:ring-ring/50 relative flex min-h-[104px] flex-col border-t border-l p-2 text-left transition focus-visible:ring-2 focus-visible:outline-none',
        isToday && 'ring-primary/40 z-10 ring-2 ring-inset',
      )}
    >
      {/* status accent bar */}
      <span className={cn('absolute inset-y-2 left-0 w-[3px] rounded-full', meta.dot)} />

      <div className="flex items-center justify-between pl-1.5">
        <span
          className={cn(
            'text-[12.5px] font-semibold tabular-nums',
            isToday ? 'text-primary' : 'text-foreground',
          )}
        >
          {day.day}
        </span>
        <span className="flex items-center gap-1">
          {day.isLate && (
            <span className="bg-warning-subtle text-warning-subtle-foreground rounded px-1 py-0.5 text-[9px] leading-none font-bold">
              LATE
            </span>
          )}
          {day.regularisationPending && (
            <span className="bg-primary size-1.5 rounded-full" title="Regularisation pending" />
          )}
        </span>
      </div>

      <div className="mt-auto pl-1.5">
        {isWorkday ? (
          <>
            <div className="text-muted-foreground font-mono text-[10.5px]">
              {day.firstIn}–{day.lastOut}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="bg-muted h-1 flex-1 overflow-hidden rounded-full">
                <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-muted-foreground text-[10px] tabular-nums">
                {workedLabel(day.workedMin)}
              </span>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
            <span className={cn('size-1.5 rounded-full', meta.dot)} />
            {meta.label}
          </span>
        )}
      </div>
    </button>
  )
}

/* ----- list view --------------------------------------------------------- */

function AttendanceList({
  days,
  onSelect,
}: {
  days: AttendanceDay[]
  onSelect: (day: AttendanceDay) => void
}) {
  return (
    <DataViewList className="bg-card shadow-sm">
      {days.map((day) => (
        <DayRow key={day.iso} day={day} onSelect={onSelect} />
      ))}
    </DataViewList>
  )
}

function DayRow({ day, onSelect }: { day: AttendanceDay; onSelect: (day: AttendanceDay) => void }) {
  const meta = STATUS_META[day.status]
  const worked = day.workedMin
  const pct = worked != null ? Math.min(100, Math.round((worked / SHIFT_MINUTES) * 100)) : 0
  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className="border-border hover:bg-accent flex w-full items-center gap-3 border-t px-5 py-3 text-left transition first:border-t-0"
    >
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
      {day.regularisationPending && (
        <span className="bg-primary-bg text-primary shrink-0 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold">
          Reg. pending
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
    </button>
  )
}

/* ----- day-detail drawer ------------------------------------------------- */

function DayDetail({ day }: { day: AttendanceDay }) {
  const meta = STATUS_META[day.status]
  const tiles = [
    { label: 'First in', value: day.firstIn ?? '—', mono: true },
    { label: 'Last out', value: day.lastOut ?? '—', mono: true },
    { label: 'Worked', value: workedLabel(day.workedMin), mono: false },
    { label: 'Shift', value: SHIFT_LABEL, mono: true },
  ]

  return (
    <>
      <SheetHeader className="border-border shrink-0 border-b p-5 pr-12">
        <SheetTitle className="text-[17px]">{fullDate(day.iso)}</SheetTitle>
        <SheetDescription>{day.dow} · times in IST</SheetDescription>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11.5px] font-medium',
              meta.tone,
            )}
          >
            <span className={cn('size-1.5 rounded-full', meta.dot)} />
            {meta.label}
          </span>
          {day.isLate && (
            <span className="bg-warning-subtle text-warning-subtle-foreground rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold">
              LATE
            </span>
          )}
          {day.regularisationPending && (
            <span className="bg-primary-bg text-primary rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold">
              Reg. pending
            </span>
          )}
        </div>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-2.5">
          {tiles.map((tile) => (
            <div key={tile.label} className="border-border rounded-[11px] border p-3">
              <div className="text-muted-foreground text-[11.5px]">{tile.label}</div>
              <div
                className={cn(
                  'text-foreground mt-1 text-[15px] font-semibold',
                  tile.mono && 'font-mono',
                )}
              >
                {tile.value}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="text-foreground mb-2 text-[13px] font-semibold">Punch log</div>
          {day.punches.length > 0 ? (
            <ol className="border-border overflow-hidden rounded-[11px] border">
              {day.punches.map((punch) => (
                <li
                  key={`${punch.type}-${punch.time}`}
                  className="border-border flex items-center gap-3 border-t px-3.5 py-2.5 first:border-t-0"
                >
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full [&_svg]:size-3.5',
                      punch.type === 'in'
                        ? 'bg-success-subtle text-success-subtle-foreground'
                        : 'bg-destructive-subtle text-destructive',
                    )}
                  >
                    {punch.type === 'in' ? <LogIn /> : <LogOut />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-foreground text-[12.5px] font-medium capitalize">
                      Punch {punch.type}
                    </div>
                    <div className="text-muted-foreground text-[11px]">{punch.device}</div>
                  </div>
                  <span className="text-foreground font-mono text-[12.5px] tabular-nums">
                    {punch.time}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-muted-foreground border-border rounded-[11px] border border-dashed px-3.5 py-4 text-center text-[12.5px]">
              No punches recorded for this day.
            </p>
          )}
        </div>

        <RegularisationForm day={day} />
      </div>
    </>
  )
}

function RegularisationForm({ day }: { day: AttendanceDay }) {
  const applicable = day.status !== 'weekly_off' && day.status !== 'holiday'
  const [inTime, setInTime] = useState(day.firstIn ?? '')
  const [outTime, setOutTime] = useState(day.lastOut ?? '')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!applicable) {
    return (
      <div className="border-border text-muted-foreground rounded-[11px] border border-dashed px-4 py-3 text-[12.5px]">
        Regularisation isn’t applicable to a {STATUS_META[day.status].label.toLowerCase()} day.
      </div>
    )
  }

  if (day.regularisationPending) {
    return (
      <div className="bg-primary-bg text-primary rounded-[11px] px-4 py-3 text-[12.5px]">
        <div className="font-semibold">Regularisation submitted</div>
        <p className="text-primary/80 mt-0.5">
          Your correction for this day is awaiting HR approval.
        </p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="bg-success-subtle text-success-subtle-foreground rounded-[11px] px-4 py-3 text-[12.5px]">
        <div className="font-semibold">Request sent to HR</div>
        <p className="mt-0.5 opacity-80">You’ll be notified once it’s reviewed.</p>
      </div>
    )
  }

  const submit = () => {
    if (!reason.trim()) {
      setError('Add a reason for the correction.')
      return
    }
    setError('')
    setBusy(true)
    // Simulate POST /attendance/days/:iso/regularise.
    setTimeout(() => {
      setBusy(false)
      setDone(true)
      toast.success('Regularisation request sent to HR')
    }, 700)
  }

  return (
    <div className="border-border flex flex-col gap-3 rounded-[11px] border p-4">
      <div className="text-foreground text-[13px] font-semibold">Request a correction</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-in" className="text-[12.5px]">
            Proposed in
          </Label>
          <Input
            id="reg-in"
            type="time"
            value={inTime}
            onChange={(event) => setInTime(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-out" className="text-[12.5px]">
            Proposed out
          </Label>
          <Input
            id="reg-out"
            type="time"
            value={outTime}
            onChange={(event) => setOutTime(event.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reg-reason" className="text-[12.5px]">
          Reason
        </Label>
        <Textarea
          id="reg-reason"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value)
            if (error) setError('')
          }}
          placeholder="Why does this day need correcting?"
          rows={3}
        />
      </div>
      {error && <p className="text-destructive-subtle-foreground text-[12px]">{error}</p>}
      <Button onClick={submit} disabled={busy || !reason.trim()} className="self-end">
        {busy ? 'Submitting…' : 'Submit request'}
      </Button>
    </div>
  )
}

/* ----- loading skeletons ------------------------------------------------- */

function CalendarSkeleton() {
  return (
    <section className="border-border bg-card overflow-hidden rounded-[14px] border p-4 shadow-sm">
      <div className="grid grid-cols-7 gap-2">
        {SKELETON_CELLS.map((id) => (
          <Shimmer key={id} className="h-[92px] rounded-[8px]" />
        ))}
      </div>
    </section>
  )
}

function ListSkeleton() {
  return (
    <DataViewList className="bg-card shadow-sm">
      <SkeletonRows rows={8} withStatus />
    </DataViewList>
  )
}
