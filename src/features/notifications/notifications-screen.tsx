import { useEffect, useMemo, useState } from 'react'
import { Bell, CalendarDays, CheckCheck, ClipboardCheck, type LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import {
  DataView,
  DataViewList,
  EmptyState,
  SkeletonRows,
  type DataViewStatus,
} from '@/components/data-view'
import { useRole } from '@/features/auth/use-role'
import { cn } from '@/lib/utils'
import {
  DEMO_NOTIFICATIONS,
  GROUP_LABELS,
  type Notification,
  type NotifGroup,
  type NotifKind,
} from './data'

/* ---------------------------------------------------------------------------
 * Notifications (design: Notifications.dc.html) at /notifications — all roles.
 * Grouped avatar+text list via DataViewList (NOT a data grid). Approvals tab is
 * hidden for plain employees. ⚠ The feed is demo data (see ./data) — the persona
 * carries no notifications and the API spec defines no endpoint yet.
 * ------------------------------------------------------------------------- */

const KIND_META: Record<NotifKind, { icon: LucideIcon; tile: string }> = {
  approval: { icon: ClipboardCheck, tile: 'bg-primary-bg text-primary' },
  leave: { icon: CalendarDays, tile: 'bg-success-subtle text-success-subtle-foreground' },
  system: { icon: Bell, tile: 'bg-info-subtle text-info-subtle-foreground' },
}

const GROUP_ORDER: NotifGroup[] = ['today', 'yesterday', 'earlier']

export function NotificationsScreen() {
  const role = useRole()
  const canSeeApprovals = role !== 'employee'

  const [items, setItems] = useState<Notification[]>(DEMO_NOTIFICATIONS)
  const [tab, setTab] = useState('all')
  const [status, setStatus] = useState<DataViewStatus>('loading')

  useEffect(() => {
    // Simulate the initial fetch so SkeletonRows shows.
    const id = setTimeout(() => setStatus('populated'), 500)
    return () => clearTimeout(id)
  }, [])

  // Employees never see approval items at all.
  const visible = useMemo(
    () => items.filter((n) => canSeeApprovals || n.kind !== 'approval'),
    [items, canSeeApprovals],
  )
  const unread = visible.filter((n) => n.unread).length

  const filtered = useMemo(() => {
    switch (tab) {
      case 'unread':
        return visible.filter((n) => n.unread)
      case 'approvals':
        return visible.filter((n) => n.kind === 'approval')
      case 'system':
        return visible.filter((n) => n.kind === 'system')
      default:
        return visible
    }
  }, [visible, tab])

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })))

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread', count: unread || undefined },
    ...(canSeeApprovals ? [{ key: 'approvals', label: 'Approvals' }] : []),
    { key: 'system', label: 'System' },
  ]

  const viewStatus: DataViewStatus =
    status === 'loading' ? 'loading' : filtered.length > 0 ? 'populated' : 'empty'

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 p-6 lg:p-10">
      <PageHeader
        title="Notifications"
        description={
          unread > 0
            ? `${unread} unread · approvals, leave and system updates`
            : "You're all caught up"
        }
        primaryAction={{
          label: 'Mark all read',
          icon: <CheckCheck />,
          onClick: markAllRead,
          disabled: unread === 0,
        }}
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
      />

      <DataViewList className="bg-card shadow-sm">
        <DataView
          status={viewStatus}
          loading={<SkeletonRows rows={5} withStatus />}
          empty={
            <EmptyState
              icon={<CheckCheck />}
              title="You're all caught up"
              description="No notifications here right now."
            />
          }
        >
          {GROUP_ORDER.map((group) => {
            const groupItems = filtered.filter((n) => n.group === group)
            if (groupItems.length === 0) return null
            return (
              <div key={group}>
                <div className="border-border text-muted-foreground bg-muted/30 border-t px-[18px] py-2 text-[11px] font-semibold tracking-[0.04em] uppercase">
                  {GROUP_LABELS[group]}
                </div>
                {groupItems.map((item) => (
                  <NotificationRow key={item.id} item={item} onRead={() => markRead(item.id)} />
                ))}
              </div>
            )
          })}
        </DataView>
      </DataViewList>
    </div>
  )
}

function NotificationRow({ item, onRead }: { item: Notification; onRead: () => void }) {
  const { icon: Icon, tile } = KIND_META[item.kind]
  return (
    <button
      type="button"
      onClick={onRead}
      className={cn(
        'border-border hover:bg-muted/50 flex w-full items-start gap-3 border-t px-[18px] py-3.5 text-left transition-colors',
        item.unread && 'bg-primary-bg/40',
      )}
    >
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
    </button>
  )
}
