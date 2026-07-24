import type { ReactNode } from 'react'
import { useState } from 'react'
import { Plus, RefreshCw, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DataView,
  DataViewList,
  DataViewRow,
  EmptyState,
  ErrorState,
  NoAccessState,
  SkeletonForm,
  SkeletonKpis,
  SkeletonRows,
  StatusPill,
  type DataViewStatus,
} from '@/components/data-view'

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-border border-b px-[18px] py-4">
        <div className="text-foreground text-[14.5px] font-semibold">{title}</div>
        {subtitle && <div className="text-small text-muted-foreground mt-px">{subtitle}</div>}
      </div>
      <div className="p-[18px]">{children}</div>
    </section>
  )
}

const STATE_TABS: { key: DataViewStatus; label: string }[] = [
  { key: 'populated', label: 'Data' },
  { key: 'loading', label: 'Loading' },
  { key: 'empty', label: 'Empty' },
  { key: 'error', label: 'Error' },
  { key: 'no-access', label: 'No access' },
]

const SAMPLE_ROWS = [
  { initials: 'AM', name: 'Aarav Mehta', code: 'ITL-0042', color: 'var(--chart-1)' },
  { initials: 'PN', name: 'Priya Nair', code: 'ITL-0233', color: 'var(--chart-2)' },
  { initials: 'NJ', name: 'Neha Joshi', code: 'ITL-0188', color: 'var(--chart-3)' },
]

export function DataViewGallery() {
  const [status, setStatus] = useState<DataViewStatus>('populated')

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Data-view states" subtitle="Every table & list cycles these five.">
        {/* Segmented state switcher (design treatment: active = card bg + primary text) */}
        <div className="bg-muted mb-4 inline-flex gap-0.5 rounded-[9px] p-[3px]">
          {STATE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatus(tab.key)}
              aria-pressed={status === tab.key}
              className={
                status === tab.key
                  ? 'bg-card text-small text-primary rounded-md px-[11px] py-[5px] font-medium'
                  : 'text-small text-muted-foreground rounded-md px-[11px] py-[5px] font-medium'
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <DataView
          status={status}
          loading={
            <DataViewList>
              <SkeletonRows rows={3} withStatus />
            </DataViewList>
          }
          empty={
            <EmptyState
              title="No employees yet"
              description="Add your first employee or import from your HRIS to get started."
              action={
                <Button>
                  <Plus />
                  Add employee
                </Button>
              }
            />
          }
          error={
            <ErrorState
              title="Couldn't load employees"
              description="The service didn't respond. Check your connection and try again."
              code="503 · service_unavailable"
              action={
                <Button variant="outline">
                  <RefreshCw />
                  Retry
                </Button>
              }
            />
          }
          noAccess={
            <NoAccessState
              title="You don't have access"
              description="This section is limited to HR Managers and Super Admins. Actions you can't perform are hidden."
            />
          }
        >
          <DataViewList>
            {SAMPLE_ROWS.map((row) => (
              <DataViewRow
                key={row.code}
                initials={row.initials}
                avatarColor={row.color}
                name={row.name}
                code={row.code}
                status={<StatusPill tone="success">Active</StatusPill>}
              />
            ))}
          </DataViewList>
        </DataView>
      </Panel>

      <div className="grid gap-6 md:grid-cols-3">
        <Panel title="Skeleton — table rows" subtitle="Avatar + two bars.">
          <SkeletonRows rows={3} />
        </Panel>
        <Panel title="Skeleton — KPI cards" subtitle="Metric tile placeholders.">
          <SkeletonKpis cards={4} />
        </Panel>
        <Panel title="Skeleton — form" subtitle="Label + field placeholders.">
          <SkeletonForm fields={3} />
        </Panel>
      </div>

      <p className="text-small text-muted-foreground">
        <UserPlus className="mr-1 inline size-3.5 align-[-2px]" />
        No-access deliberately shows{' '}
        <strong className="text-foreground font-medium">no action</strong> button — permission
        failures hide actions rather than disabling them.
      </p>
    </div>
  )
}
