import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Bell, CalendarDays, ClipboardCheck, type LucideIcon } from 'lucide-react'
import { paths } from '@/config/paths'
import { PageHeader } from '@/components/layout/page-header'
import { DonutChart } from '@/components/charts'
import { DataViewList, SkeletonKpis } from '@/components/data-view'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/use-auth'
import { buildBalances, DEMO_HISTORY, type LeaveBalance } from '@/features/my-leave/data'
import { getMonth, MONTH_LABEL, summarize } from '@/features/my-attendance/data'
import {
  DEMO_NOTIFICATIONS,
  type Notification,
  type NotifKind,
} from '@/features/notifications/data'
import { AiInsightCard } from './components/ai-insight-card'
import { KpiCard } from './components/kpi-card'
import { buildEmployeeKpis } from './employee-data'

/* ---------------------------------------------------------------------------
 * Company Dashboard — Employee branch (design: Company Dashboard.dc.html, isEmp).
 * Completes the role seam: this is the real Employee/Lead landing (HR/Admin get
 * the org dashboard). It summarises the persona's OWN data — leave-balance rings,
 * an attendance snapshot, recent notifications — reusing the HR branch's
 * PageHeader / KpiCard / DataViewList, and links into My Leave / My Attendance /
 * Notifications.
 * ------------------------------------------------------------------------- */

type Status = 'loading' | 'populated'

const NOTIF_META: Record<NotifKind, { icon: LucideIcon; tile: string }> = {
  approval: { icon: ClipboardCheck, tile: 'bg-primary-bg text-primary' },
  leave: { icon: CalendarDays, tile: 'bg-success-subtle text-success-subtle-foreground' },
  system: { icon: Bell, tile: 'bg-info-subtle text-info-subtle-foreground' },
}

export function EmployeeDashboard({ status }: { status: Status }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  const loading = status === 'loading'
  const firstName = user.name.split(' ')[0]
  const kpis = buildEmployeeKpis(user)
  const balances = buildBalances(user.leaveBalance)
  const totalLeave = +(
    user.leaveBalance.annual +
    user.leaveBalance.sick +
    user.leaveBalance.casual
  ).toFixed(1)
  const attendance = summarize(getMonth())
  const pending = DEMO_HISTORY.filter((request) => request.status === 'pending').length
  const notifications = DEMO_NOTIFICATIONS.filter(
    (item) => user.role !== 'employee' || item.kind !== 'approval',
  ).slice(0, 4)

  // KPI deep-links into the matching ESS screen.
  const kpiHref: Record<string, string> = {
    'leave-balance': paths.meLeave.getHref(),
    attendance: paths.meAttendance.getHref(),
    present: paths.meAttendance.getHref(),
    pending: paths.meLeave.getHref(),
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-[18px] p-6 lg:p-10">
      <PageHeader
        title={`Good morning, ${firstName}`}
        description={`Wednesday, 30 June 2026 · your workspace`}
        badges={[
          user.attendance.checkedInAt
            ? { label: `Checked in ${user.attendance.checkedInAt}`, tone: 'success' }
            : { label: 'Not checked in', tone: 'warning' },
          { label: `${pending} pending`, tone: pending > 0 ? 'warning' : 'neutral' },
        ]}
      />

      <AiInsightCard
        title="Plan your time off"
        body={`You have ${totalLeave} leave days available this year${
          pending > 0 ? `, and ${pending} request${pending === 1 ? '' : 's'} awaiting approval` : ''
        }. Booking ahead helps your team plan around you.`}
        recommendations={['Apply for leave', 'View my balances']}
        onRecommend={() => void navigate(paths.meLeave.getHref())}
      />

      {/* KPI row */}
      {loading ? (
        <SkeletonKpis cards={4} className="grid-cols-2 gap-[14px] lg:grid-cols-4" />
      ) : (
        <div className="grid grid-cols-2 gap-[14px] lg:grid-cols-4">
          {kpis.map(({ key, ...kpi }) => (
            <KpiCard
              key={key}
              {...kpi}
              onClick={kpiHref[key] ? () => void navigate(kpiHref[key]!) : undefined}
            />
          ))}
        </div>
      )}

      {/* Leave rings + attendance snapshot */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <LeaveBalancesCard balances={balances} />
        <AttendanceSnapshotCard
          present={attendance.present}
          late={attendance.late}
          absent={attendance.absent}
          monthPct={user.attendance.monthPct}
          checkedIn={user.attendance.checkedInAt}
        />
      </div>

      {/* Recent notifications */}
      <NotificationsCard items={notifications} />
    </div>
  )
}

/* ----- section header with a "view" deep-link ---------------------------- */

function CardHeader({
  title,
  sub,
  to,
  viewLabel,
}: {
  title: string
  sub?: string
  to: string
  viewLabel: string
}) {
  return (
    <div className="border-border flex items-center justify-between border-b px-5 py-4">
      <div>
        <div className="text-foreground text-[14px] font-semibold">{title}</div>
        {sub && <div className="text-muted-foreground text-[12px]">{sub}</div>}
      </div>
      <Link
        to={to}
        className="text-primary inline-flex items-center gap-1 text-[12.5px] font-medium hover:underline"
      >
        {viewLabel}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}

/* ----- leave balance rings ----------------------------------------------- */

function LeaveBalancesCard({ balances }: { balances: LeaveBalance[] }) {
  return (
    <section className="border-border bg-card overflow-hidden rounded-[14px] border shadow-sm">
      <CardHeader
        title="Leave balance"
        sub="days remaining · 2026"
        to={paths.meLeave.getHref()}
        viewLabel="Manage leave"
      />
      <div className="grid grid-cols-3 gap-2 px-5 py-6">
        {balances.map((balance) => (
          <div key={balance.key} className="flex flex-col items-center gap-2">
            <DonutChart
              className="w-auto"
              showLegend={false}
              centerValue={String(balance.available)}
              centerLabel="left"
              data={[
                { label: 'Available', value: balance.available, color: balance.color },
                { label: 'Used', value: balance.used, color: 'var(--muted)' },
              ]}
            />
            <span className="text-foreground text-[13px] font-medium">{balance.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ----- attendance snapshot ----------------------------------------------- */

function AttendanceSnapshotCard({
  present,
  late,
  absent,
  monthPct,
  checkedIn,
}: {
  present: number
  late: number
  absent: number
  monthPct: number
  checkedIn: string | null
}) {
  const stats = [
    { label: 'Present', value: present, dot: 'bg-success' },
    { label: 'Late', value: late, dot: 'bg-warning' },
    { label: 'Absent', value: absent, dot: 'bg-destructive' },
  ]
  return (
    <section className="border-border bg-card overflow-hidden rounded-[14px] border shadow-sm">
      <CardHeader
        title="Attendance"
        sub={MONTH_LABEL}
        to={paths.meAttendance.getHref()}
        viewLabel="View log"
      />
      <div className="flex flex-col gap-4 px-5 py-5">
        <div className="flex items-end gap-2">
          <div className="text-foreground text-[30px] leading-none font-bold tracking-[-0.02em] tabular-nums">
            {monthPct}%
          </div>
          <div className="text-muted-foreground pb-1 text-[12.5px]">attendance this month</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="border-border rounded-[10px] border p-2.5">
              <div className="text-foreground text-[18px] font-bold tabular-nums">{stat.value}</div>
              <div className="text-muted-foreground mt-0.5 inline-flex items-center gap-1.5 text-[11.5px]">
                <span className={cn('size-1.5 rounded-full', stat.dot)} />
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <div className="text-muted-foreground text-[12.5px]">
          {checkedIn ? (
            <>
              Checked in today at{' '}
              <span className="text-foreground font-mono font-medium">{checkedIn}</span>
            </>
          ) : (
            'Not checked in yet today.'
          )}
        </div>
      </div>
    </section>
  )
}

/* ----- recent notifications (DataViewList) ------------------------------- */

function NotificationsCard({ items }: { items: Notification[] }) {
  return (
    <DataViewList className="bg-card rounded-[14px] shadow-sm">
      <CardHeader
        title="Recent notifications"
        to={paths.notifications.getHref()}
        viewLabel="View all"
      />
      {items.map((item) => {
        const { icon: Icon, tile } = NOTIF_META[item.kind]
        return (
          <div key={item.id} className="border-border flex items-start gap-3 border-t px-5 py-3.5">
            <span
              className={cn(
                'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[10px] [&_svg]:size-[17px]',
                tile,
              )}
            >
              <Icon strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    'text-foreground text-[13.5px]',
                    item.unread ? 'font-semibold' : 'font-medium',
                  )}
                >
                  {item.title}
                </span>
                <span className="text-muted-foreground shrink-0 text-[11.5px]">{item.time}</span>
              </div>
              <div className="text-muted-foreground mt-0.5 text-[12.5px]">{item.body}</div>
            </div>
            {item.unread && <span className="bg-primary mt-2 size-2 shrink-0 rounded-full" />}
          </div>
        )
      })}
    </DataViewList>
  )
}
