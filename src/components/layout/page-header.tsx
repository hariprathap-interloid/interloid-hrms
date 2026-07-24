import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * PageHeader — the title block that opens a screen (design: components/
 * PageHeader). Optional breadcrumb + icon tile, title with status badges and a
 * description, primary/secondary actions, and an optional in-page tab row. One
 * header for every screen so titles, actions and tabs stay consistent.
 * ------------------------------------------------------------------------- */

type BadgeTone = 'neutral' | 'success' | 'warning' | 'destructive' | 'info' | 'primary'

const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: 'bg-muted text-foreground',
  success: 'bg-success-subtle text-success-subtle-foreground',
  warning: 'bg-warning-subtle text-warning-subtle-foreground',
  destructive: 'bg-destructive-subtle text-destructive-subtle-foreground',
  info: 'bg-info-subtle text-info-subtle-foreground',
  primary: 'bg-primary-bg text-primary',
}

export interface HeaderBadge {
  label: string
  tone?: BadgeTone
}

export interface HeaderAction {
  label: string
  onClick?: () => void
  icon?: ReactNode
  disabled?: boolean
}

export interface HeaderTab {
  key: string
  label: string
  /** Optional count pill (e.g. pending approvals). */
  count?: number
}

export interface Crumb {
  label: string
  href?: string
}

export interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  breadcrumbs?: Crumb[]
  /** Status pills beside the title. */
  badges?: HeaderBadge[]
  /** Filled primary button (rightmost). */
  primaryAction?: HeaderAction
  /** Outline buttons left of the primary. */
  secondaryActions?: HeaderAction[]
  /** Escape hatch: arbitrary nodes before the generated buttons. */
  actions?: ReactNode
  tabs?: HeaderTab[]
  activeTab?: string
  onTabChange?: (key: string) => void
  /** Leading icon tile. */
  icon?: ReactNode
  /** Bottom hairline (default true; false when a tab row owns the divider). */
  bordered?: boolean
}

function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2.5 flex flex-wrap items-center gap-1 text-[12.5px]">
      {items.map((crumb, index) => {
        const last = index === items.length - 1
        return (
          <span key={crumb.label} className="inline-flex items-center gap-1">
            {crumb.href && !last ? (
              <Link to={crumb.href} className="text-muted-foreground hover:text-foreground">
                {crumb.label}
              </Link>
            ) : (
              <span className={last ? 'text-foreground' : 'text-muted-foreground'}>
                {crumb.label}
              </span>
            )}
            {!last && <ChevronRight className="text-muted-foreground/60 size-3.5" />}
          </span>
        )
      })}
    </nav>
  )
}

function ActionButton({ action, primary }: { action: HeaderAction; primary?: boolean }) {
  return (
    <Button
      variant={primary ? 'default' : 'outline'}
      onClick={action.onClick}
      disabled={action.disabled}
    >
      {action.icon}
      {action.label}
    </Button>
  )
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  badges = [],
  primaryAction,
  secondaryActions = [],
  actions,
  tabs = [],
  activeTab,
  onTabChange,
  icon,
  bordered = true,
}: PageHeaderProps) {
  const hasActions = primaryAction || secondaryActions.length > 0 || actions
  return (
    <header
      className={cn(
        'border-border',
        bordered && 'border-b',
        tabs.length > 0 ? 'pb-0' : 'pb-[18px]',
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-[13px]">
          {icon && (
            <span className="bg-primary-bg text-primary flex size-[42px] shrink-0 items-center justify-center rounded-[11px] [&_svg]:size-[21px]">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-foreground text-[22px] leading-[1.2] font-bold tracking-[-0.02em]">
                {title}
              </h1>
              {badges.map((badge) => (
                <span
                  key={badge.label}
                  className={cn(
                    'rounded-full px-2.5 py-[3px] text-[12px] font-semibold',
                    BADGE_TONE[badge.tone ?? 'neutral'],
                  )}
                >
                  {badge.label}
                </span>
              ))}
            </div>
            {description && (
              <p className="text-muted-foreground mt-[5px] max-w-[620px] text-[13.5px] leading-[1.5] text-pretty">
                {description}
              </p>
            )}
          </div>
        </div>
        {hasActions && (
          <div className="flex flex-wrap items-center gap-2.5">
            {actions}
            {secondaryActions.map((action) => (
              <ActionButton key={action.label} action={action} />
            ))}
            {primaryAction && <ActionButton action={primaryAction} primary />}
          </div>
        )}
      </div>

      {tabs.length > 0 && (
        <div className="mt-4 flex items-center gap-0.5 overflow-x-auto">
          {tabs.map((tab) => {
            const active = tab.key === activeTab
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange?.(tab.key)}
                className={cn(
                  'relative px-[13px] py-2.5 text-[13.5px] whitespace-nowrap',
                  active ? 'text-foreground font-semibold' : 'text-muted-foreground font-medium',
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  {tab.label}
                  {tab.count != null && (
                    <span
                      className={cn(
                        'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold',
                        active ? 'bg-primary-bg text-primary' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'absolute inset-x-2 bottom-0 h-0.5 rounded-t-sm',
                    active ? 'bg-primary' : 'bg-transparent',
                  )}
                />
              </button>
            )
          })}
        </div>
      )}
    </header>
  )
}
