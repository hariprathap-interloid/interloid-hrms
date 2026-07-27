import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, CornerDownLeft, Download, Search, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { AreaTrend, CategoryBarChart, Sparkline } from '@/components/charts'
import {
  DataView,
  DataViewList,
  SkeletonKpis,
  SkeletonRows,
  StateMessage,
  type DataViewStatus,
} from '@/components/data-view'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/use-auth'
import { cn } from '@/lib/utils'
import { PunctualityHeatmap } from './components/punctuality-heatmap'
import {
  getCommandCenterData,
  type AtRiskPerson,
  type AttentionItem,
  type BentoKpi,
  type HeroKpi,
  type IconTone,
  type Insight,
  type TimelineEvent,
} from './data'

/* ---------------------------------------------------------------------------
 * HR Command Center (design: HR Command Center.dc.html) — org-wide ops for HR /
 * Admin at /command-center. The route is role-gated (see command-center page);
 * this is content only (AppShell owns the chrome). Charts reuse the shared
 * components/charts wrappers; the heatmap is a CSS grid (PunctualityHeatmap).
 * ------------------------------------------------------------------------- */

const TONE_TILE: Record<IconTone, string> = {
  primary: 'bg-primary-bg text-primary',
  success: 'bg-success-subtle text-success-subtle-foreground',
  warning: 'bg-warning-subtle text-warning-subtle-foreground',
  destructive: 'bg-destructive-subtle text-destructive',
  info: 'bg-info-subtle text-info-subtle-foreground',
  violet: 'bg-violet-subtle text-violet-subtle-foreground',
}

type Status = 'loading' | 'populated'

export function CommandCenterScreen() {
  const data = getCommandCenterData()
  const { user } = useAuth()
  const [status, setStatus] = useState<Status>('loading')
  const [attention, setAttention] = useState<AttentionItem[]>(data.attention)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    timer.current = setTimeout(() => setStatus('populated'), 600)
    return () => clearTimeout(timer.current)
  }, [])

  const resolve = (item: AttentionItem, message: string) => {
    setAttention((current) => current.filter((a) => a.id !== item.id))
    toast.success(message)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-6 lg:p-10">
      <PageHeader
        title={`${data.greeting}, ${user?.name.split(' ')[0] ?? data.name}`}
        description={`${data.dateLine} · ${user?.title ?? data.roleLabel} · org-wide`}
        secondaryActions={[
          {
            label: 'Export',
            icon: <Download className="size-4" />,
            onClick: () => toast('Exporting workforce report (PDF)…'),
          },
        ]}
        primaryAction={{
          label: 'Ask AI',
          icon: <Sparkles className="size-4" />,
          onClick: () => toast('Interloid AI is thinking…'),
        }}
      />

      <HeroSpotlight presentPct={data.presentPct} kpis={data.heroKpis} />

      {/* Attention lane + AI */}
      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <AttentionCard
          status={status}
          items={attention}
          dayShort={data.dayShort}
          onResolve={resolve}
        />
        <AiCard insights={data.insights} atRisk={data.atRisk} />
      </div>

      {/* Secondary KPI bento */}
      {status === 'loading' ? (
        <SkeletonKpis cards={4} className="grid-cols-2 gap-3.5 lg:grid-cols-4" />
      ) : (
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {data.bento.map((kpi) => (
            <BentoTile key={kpi.key} kpi={kpi} />
          ))}
        </div>
      )}

      {/* Charts — reuse the shared wrappers */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <ChartCard
          title="Attendance rate"
          sub="Jan – Jul 2026 · org-wide"
          badge={data.attendanceTrend.badge}
        >
          <AreaTrend
            data={data.attendanceTrend.points}
            seriesLabel="Attendance"
            color="var(--chart-1)"
            valueFormatter={(value) => `${value}%`}
          />
        </ChartCard>
        <ChartCard title="Leave taken by type" sub="days · 2026 YTD">
          <CategoryBarChart
            data={data.leaveByType}
            layout="horizontal"
            seriesLabel="Days"
            valueFormatter={(value) => `${value} d`}
          />
        </ChartCard>
      </div>

      {/* Heatmap + activity */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <PunctualityHeatmap depts={data.heatDepts} />
        <TimelineCard events={data.timeline} dayShort={data.dayShort} />
      </div>
    </div>
  )
}

/* ----- Hero KPI spotlight (fixed brand-gradient banner) ------------------- */

function HeroSpotlight({ presentPct, kpis }: { presentPct: string; kpis: HeroKpi[] }) {
  return (
    <section
      className="relative overflow-hidden rounded-[18px] p-6 shadow-lg sm:px-7"
      style={{ background: 'var(--login-hero)' }}
    >
      <div className="relative flex flex-col gap-5">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11.5px] font-semibold text-white backdrop-blur-sm">
          <span className="relative flex size-[7px]">
            <span className="bg-success absolute inset-0 animate-ping rounded-full opacity-70" />
            <span className="bg-success relative size-[7px] rounded-full" />
          </span>
          {presentPct}% present · live
        </span>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.key}
              className="rounded-[14px] border border-white/[0.18] bg-white/[0.11] p-4 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11.5px] text-white/75">{kpi.label}</span>
                <span className="rounded-full bg-white/[0.16] px-[7px] py-0.5 text-[11px] font-semibold text-white">
                  {kpi.delta}
                </span>
              </div>
              <div className="mt-1.5 flex items-end justify-between gap-2.5">
                <div className="text-[27px] leading-none font-bold tracking-[-0.02em] text-white tabular-nums">
                  {kpi.value}
                </div>
                <Sparkline data={kpi.spark} color="rgb(255 255 255 / 0.9)" width={76} height={26} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ----- Needs your attention (DataViewList) ------------------------------- */

function AttentionCard({
  status,
  items,
  dayShort,
  onResolve,
}: {
  status: Status
  items: AttentionItem[]
  dayShort: string
  onResolve: (item: AttentionItem, message: string) => void
}) {
  const viewStatus: DataViewStatus =
    status === 'loading' ? 'loading' : items.length > 0 ? 'populated' : 'empty'

  return (
    <DataViewList className="bg-card rounded-[16px] shadow-sm">
      <div className="border-border flex items-center gap-2.5 border-b px-[18px] py-[15px]">
        <span className="bg-warning-subtle text-warning-subtle-foreground flex size-[30px] shrink-0 items-center justify-center rounded-[9px] [&_svg]:size-4">
          <Sparkles strokeWidth={2} />
        </span>
        <div className="flex-1">
          <div className="text-foreground text-[14px] font-semibold">Needs your attention</div>
          <div className="text-muted-foreground text-[12px]">Prioritised for {dayShort}</div>
        </div>
        {viewStatus === 'populated' && (
          <span className="bg-warning-subtle text-warning-subtle-foreground rounded-full px-2.5 py-[3px] text-[12px] font-semibold">
            {items.length}
          </span>
        )}
      </div>
      <DataView
        status={viewStatus}
        loading={<SkeletonRows rows={4} withStatus />}
        empty={
          <StateMessage
            tone="success"
            icon={<CheckCircle2 />}
            title="You're all caught up"
            description="No approvals or exceptions need you right now."
          />
        }
      >
        {items.map((item) => (
          <AttentionRow key={item.id} item={item} onResolve={onResolve} />
        ))}
      </DataView>
    </DataViewList>
  )
}

function AttentionRow({
  item,
  onResolve,
}: {
  item: AttentionItem
  onResolve: (item: AttentionItem, message: string) => void
}) {
  const Icon = item.icon
  const primaryName = item.title.split(' · ')[0]
  return (
    <div className="border-border hover:bg-muted/50 flex items-center gap-[13px] border-t px-[18px] py-3.5 transition-colors">
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-[10px] [&_svg]:size-[17px]',
          TONE_TILE[item.tone],
        )}
      >
        <Icon strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-foreground text-[13.5px] font-semibold">{item.title}</span>
          {item.ai && (
            <span className="text-violet-subtle-foreground bg-violet-subtle inline-flex items-center gap-1 rounded-full px-[7px] py-px text-[10.5px] font-semibold [&_svg]:size-2.5">
              <Sparkles fill="currentColor" strokeWidth={0} />
              {item.ai}
            </span>
          )}
        </div>
        <div className="text-muted-foreground mt-0.5 text-[12px]">{item.meta}</div>
      </div>
      <div className="flex shrink-0 gap-[7px]">
        {item.ghostLabel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-[11px] text-[12.5px]"
            onClick={() => onResolve(item, `${item.ghostLabel} · ${primaryName}`)}
          >
            {item.ghostLabel}
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          className={cn(
            'h-8 px-3 text-[12.5px]',
            item.primaryTone === 'destructive' &&
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            item.primaryTone === 'violet' && 'bg-violet text-violet-foreground hover:bg-violet/90',
          )}
          onClick={() => onResolve(item, `${item.primaryLabel} · ${primaryName}`)}
        >
          {item.primaryLabel}
        </Button>
      </div>
    </div>
  )
}

/* ----- Interloid AI card -------------------------------------------------- */

function AiCard({ insights, atRisk }: { insights: Insight[]; atRisk: AtRiskPerson[] }) {
  return (
    <section className="from-violet to-brand-accent rounded-[16px] bg-linear-to-br p-px shadow-sm">
      <div className="bg-card h-full rounded-[15px] p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="from-violet to-brand-accent text-primary-foreground flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-linear-to-br [&_svg]:size-4">
            <Sparkles fill="currentColor" strokeWidth={0} />
          </span>
          <div className="flex-1">
            <div className="text-foreground text-[14px] font-semibold">Interloid AI</div>
            <div className="text-muted-foreground text-[11.5px]">Insights for this week</div>
          </div>
          <span className="text-violet-subtle-foreground bg-violet-subtle rounded-md px-[7px] py-0.5 text-[10px] font-bold tracking-[0.05em]">
            BETA
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {insights.map((insight) => (
            <div key={insight.id} className="flex items-start gap-2.5">
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full"
                style={{ background: insight.dot }}
              />
              <p className="text-foreground text-[12.5px] leading-[1.5]">{insight.text}</p>
            </div>
          ))}
        </div>

        <div className="border-border mt-3.5 border-t pt-3">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.03em] uppercase">
              Leave at risk · expires soon
            </span>
            <Button
              variant="link"
              className="text-primary h-auto p-0 text-[11.5px] font-semibold"
              onClick={() => toast('Opening leave-at-risk report…')}
            >
              View all
            </Button>
          </div>
          <div className="flex flex-col gap-0.5">
            {atRisk.map((person) => (
              <button
                key={person.id}
                type="button"
                className="hover:bg-muted -mx-2 flex items-center gap-2.5 rounded-[9px] px-2 py-1.5 text-left transition-colors"
                onClick={() => toast(`Opening ${person.name.split(' ')[0]}'s leave balance…`)}
              >
                <span
                  className="text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{ background: person.avatarColor }}
                >
                  {person.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-foreground truncate text-[12.5px] font-medium">
                    {person.name}
                  </div>
                  <div className="text-muted-foreground text-[11px]">{person.dept}</div>
                </div>
                <span className="text-warning-subtle-foreground shrink-0 text-[11.5px] font-semibold tabular-nums">
                  {person.days}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="text-muted-foreground bg-background border-border hover:border-ring mt-3 flex h-[38px] w-full items-center gap-2.5 rounded-[10px] border px-3 text-[12.5px] transition-colors"
          onClick={() => toast('Interloid AI is thinking…')}
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left">Ask about attendance, leave, payroll…</span>
          <kbd className="border-border rounded-md border px-1.5 py-px font-mono text-[10px]">
            <CornerDownLeft className="size-3" />
          </kbd>
        </button>
      </div>
    </section>
  )
}

/* ----- Chart card shell --------------------------------------------------- */

function ChartCard({
  title,
  sub,
  badge,
  children,
}: {
  title: string
  sub?: string
  badge?: string
  children: ReactNode
}) {
  return (
    <section className="border-border bg-card rounded-[16px] border p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-foreground text-[14px] font-semibold">{title}</div>
          {sub && <div className="text-muted-foreground text-[12px]">{sub}</div>}
        </div>
        {badge && (
          <span className="bg-success-subtle text-success-subtle-foreground rounded-md px-2 py-1 text-[12px] font-semibold">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}

/* ----- Secondary KPI bento tile ------------------------------------------ */

function BentoTile({ kpi }: { kpi: BentoKpi }) {
  return (
    <div className="border-border bg-card rounded-[14px] border p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-[11.5px]">{kpi.label}</span>
        <span
          className={cn(
            'rounded-full px-[7px] py-0.5 text-[11px] font-semibold',
            kpi.good
              ? 'bg-success-subtle text-success-subtle-foreground'
              : 'bg-destructive-subtle text-destructive-subtle-foreground',
          )}
        >
          {kpi.delta}
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2.5">
        <div className="text-foreground text-[24px] leading-none font-bold tracking-[-0.02em] tabular-nums">
          {kpi.value}
        </div>
        <Sparkline
          data={kpi.spark}
          color={kpi.good ? 'var(--chart-3)' : 'var(--chart-5)'}
          width={72}
          height={24}
        />
      </div>
    </div>
  )
}

/* ----- What changed today (timeline) ------------------------------------- */

function TimelineCard({ events, dayShort }: { events: TimelineEvent[]; dayShort: string }) {
  return (
    <DataViewList className="bg-card rounded-[16px] shadow-sm">
      <div className="border-border flex items-center justify-between border-b px-[18px] py-[15px]">
        <span className="text-foreground text-[14px] font-semibold">What changed today</span>
        <span className="text-muted-foreground text-[11.5px]">{dayShort}</span>
      </div>
      <div className="px-[18px] pt-1.5 pb-4">
        {events.map((event, index) => {
          const Icon = event.icon
          const last = index === events.length - 1
          return (
            <div key={event.id} className="flex gap-[13px]">
              <div className="flex flex-none flex-col items-center">
                <span
                  className={cn(
                    'mt-2.5 flex size-[26px] items-center justify-center rounded-lg [&_svg]:size-[13px]',
                    TONE_TILE[event.tone],
                  )}
                >
                  <Icon strokeWidth={2.2} />
                </span>
                {!last && <span className="bg-border w-0.5 flex-1" />}
              </div>
              <div className="min-w-0 pt-2.5 pb-1.5">
                <div className="text-foreground text-[12.5px]">{event.text}</div>
                <div className="text-muted-foreground mt-px text-[11px]">{event.time}</div>
              </div>
            </div>
          )
        })}
      </div>
    </DataViewList>
  )
}
