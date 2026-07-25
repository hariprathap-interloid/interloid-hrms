import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, CheckCircle2, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { AreaTrend, CategoryBarChart, DonutChart } from '@/components/charts'
import {
  DataView,
  DataViewList,
  EmptyState,
  Shimmer,
  SkeletonRows,
  SkeletonKpis,
  type DataViewStatus,
} from '@/components/data-view'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/use-auth'
import { useRole } from '@/features/auth/use-role'
import { cn } from '@/lib/utils'
import { AiInsightCard } from './components/ai-insight-card'
import { KpiCard } from './components/kpi-card'
import {
  getDashboardData,
  type ActivityItem,
  type ApprovalItem,
  type DashboardData,
  type DashboardRole,
} from './data'

/* ---------------------------------------------------------------------------
 * Company Dashboard (design: Company Dashboard.dc.html) — the authenticated
 * landing at /dashboard. Role-aware: `useDashboardRole` picks the branch,
 * `getDashboardData` supplies its content (HR/Admin complete today). Chrome
 * (sidebar, top bar, ⌘K) is the AppShell's job; this screen is content only.
 * ------------------------------------------------------------------------- */

// Role seam — reads the shared app role (src/features/auth/use-role). Admin sees
// the HR/Admin dashboard branch; the rest map straight through.
function useDashboardRole(): DashboardRole {
  const role = useRole()
  return role === 'admin' ? 'hr' : role
}

type Status = 'loading' | 'populated'

const ICON_TONE: Record<string, string> = {
  primary: 'bg-primary-bg text-primary',
  success: 'bg-success-subtle text-success-subtle-foreground',
  warning: 'bg-warning-subtle text-warning-subtle-foreground',
  info: 'bg-info-subtle text-info-subtle-foreground',
  neutral: 'bg-muted text-muted-foreground',
}

export function DashboardScreen() {
  const role = useDashboardRole()
  const [status, setStatus] = useState<Status>('loading')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    // Simulate the initial fetch so the skeletons (SkeletonKpis + rows) show.
    timer.current = setTimeout(() => setStatus('populated'), 600)
    return () => clearTimeout(timer.current)
  }, [])

  const data = getDashboardData(role)
  if (!data) return <RoleComingSoon role={role} />
  return <DashboardContent data={data} status={status} />
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-[18px] p-6 lg:p-10">{children}</div>
  )
}

function DashboardContent({ data, status }: { data: DashboardData; status: Status }) {
  const loading = status === 'loading'
  const { user } = useAuth()
  const { hero, kpis, areaTrend, barChart, donut, approvals, activity } = data
  // Personalise the greeting to the signed-in persona (admin → Devi, hr → Priya).
  const greeting = user ? `Good morning, ${user.name.split(' ')[0]}` : hero.greeting

  return (
    <Shell>
      <PageHeader title={greeting} description={hero.date} badges={hero.badges} />

      <AiInsightCard
        title={hero.aiTitle}
        body={hero.aiBody}
        recommendations={hero.recs}
        onRecommend={(label) => toast(`${label} (demo)`)}
      />

      {/* KPI row */}
      {loading ? (
        <SkeletonKpis cards={6} className="grid-cols-2 gap-[14px] lg:grid-cols-3 2xl:grid-cols-6" />
      ) : (
        <div className="grid grid-cols-2 gap-[14px] lg:grid-cols-3 2xl:grid-cols-6">
          {kpis.map(({ key, ...kpi }) => (
            <KpiCard key={key} {...kpi} />
          ))}
        </div>
      )}

      {/* Analytics + action center */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <ChartCard title={areaTrend.title} sub={areaTrend.sub}>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <AreaTrend
                data={areaTrend.points}
                seriesLabel="Headcount"
                color={areaTrend.color}
                valueFormatter={(value) => value.toLocaleString()}
              />
            )}
          </ChartCard>
          <ChartCard title={barChart.title} sub={barChart.sub}>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <CategoryBarChart
                data={barChart.bars}
                seriesLabel="Attendance"
                valueFormatter={(value) => `${value}%`}
              />
            )}
          </ChartCard>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <ChartCard title={donut.title}>
            {loading ? (
              <ChartSkeleton className="h-[104px]" />
            ) : (
              <DonutChart
                data={donut.segments}
                centerValue={donut.centerValue}
                centerLabel={donut.centerLabel}
              />
            )}
          </ChartCard>
          <ApprovalsCard status={status} approvals={approvals} />
        </div>
      </div>

      {/* Recent activity */}
      <ActivityCard activity={activity} />
    </Shell>
  )
}

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="border-border bg-card rounded-[14px] border px-6 py-[22px] shadow-sm">
      <div className="text-foreground text-[14px] font-semibold">{title}</div>
      {sub && <div className="text-muted-foreground mt-0.5 text-[12px]">{sub}</div>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function ChartSkeleton({ className }: { className?: string }) {
  return <Shimmer className={cn('h-[150px] w-full rounded-[10px]', className)} />
}

function ApprovalsCard({
  status,
  approvals,
}: {
  status: Status
  approvals: DashboardData['approvals']
}) {
  const items = approvals.items
  const viewStatus: DataViewStatus =
    status === 'loading' ? 'loading' : items.length > 0 ? 'populated' : 'empty'

  return (
    <DataViewList className="bg-card rounded-[14px] shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="text-foreground text-[14px] font-semibold">{approvals.title}</div>
        {viewStatus === 'populated' && (
          <span className="bg-destructive-subtle text-destructive-subtle-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold">
            {approvals.count}
          </span>
        )}
      </div>
      <DataView
        status={viewStatus}
        loading={<SkeletonRows rows={3} withStatus />}
        empty={
          <EmptyState
            icon={<CheckCircle2 />}
            title="All caught up"
            description="No approvals are waiting on you."
          />
        }
      >
        {items.map((item) => (
          <ApprovalRow key={item.id} item={item} />
        ))}
      </DataView>
    </DataViewList>
  )
}

function ApprovalRow({ item }: { item: ApprovalItem }) {
  return (
    <div className="border-border flex items-center gap-3 border-t px-5 py-3.5">
      <span
        className="text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
        style={{ background: item.avatarColor }}
      >
        {item.initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-foreground truncate text-[12.5px] font-medium">{item.name}</div>
        <div className="text-muted-foreground truncate text-[11.5px]">{item.detail}</div>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label={`Reject ${item.name}'s request`}
          className="text-destructive hover:bg-destructive-subtle size-[30px]"
          onClick={() => toast(`Rejected ${item.name}'s request`)}
        >
          <X className="size-[15px]" />
        </Button>
        <Button
          type="button"
          size="icon"
          aria-label={`Approve ${item.name}'s request`}
          className="bg-success text-success-foreground hover:bg-success/90 size-[30px]"
          onClick={() => toast.success(`Approved ${item.name}'s request`)}
        >
          <Check className="size-[15px]" />
        </Button>
      </div>
    </div>
  )
}

function ActivityCard({ activity }: { activity: ActivityItem[] }) {
  return (
    <DataViewList className="bg-card rounded-[14px] shadow-sm">
      <div className="flex items-center justify-between px-[17px] py-[15px]">
        <div className="text-foreground text-[14px] font-semibold">Recent activity</div>
        <Button
          variant="link"
          className="text-primary h-auto p-0 text-[12.5px] font-medium"
          onClick={() => toast('Recent activity (demo)')}
        >
          View all
        </Button>
      </div>
      <div className="grid sm:grid-cols-2">
        {activity.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </div>
    </DataViewList>
  )
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = item.icon
  return (
    <div className="border-border flex items-start gap-[11px] border-t px-[17px] py-[13px]">
      <span
        className={cn(
          'mt-0.5 flex size-[30px] shrink-0 items-center justify-center rounded-lg [&_svg]:size-[15px]',
          ICON_TONE[item.tone],
        )}
      >
        <Icon strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-foreground text-[12.5px] leading-[1.4]">{item.text}</div>
        <div className="text-muted-foreground/80 mt-0.5 text-[11px]">{item.time}</div>
      </div>
    </div>
  )
}

function RoleComingSoon({ role }: { role: DashboardRole }) {
  return (
    <Shell>
      <PageHeader title="Dashboard" description="Your workspace overview" />
      <DataViewList className="bg-card">
        <EmptyState
          title="Dashboard coming soon for your role"
          description={`The ${role} dashboard view is being built. The HR/Admin view is available today.`}
        />
      </DataViewList>
    </Shell>
  )
}
