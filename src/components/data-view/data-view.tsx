import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * Data-view lifecycle — "every table & list cycles these five" (States &
 * Components spec, project 8f1502f5): populated · loading · empty · error ·
 * no-access. `DataView` switches between caller-provided slots; `DataViewList`
 * is the bordered frame shared by populated + loading; `DataViewRow` +
 * `StatusPill` render the populated row treatment.
 * ------------------------------------------------------------------------- */

export type DataViewStatus = 'populated' | 'loading' | 'empty' | 'error' | 'no-access'

interface DataViewProps {
  status: DataViewStatus
  /** Populated content (rows) — usually a <DataViewList> of <DataViewRow>. */
  children?: ReactNode
  loading?: ReactNode
  empty?: ReactNode
  error?: ReactNode
  noAccess?: ReactNode
}

export function DataView({ status, children, loading, empty, error, noAccess }: DataViewProps) {
  switch (status) {
    case 'loading':
      return <>{loading}</>
    case 'empty':
      return <>{empty}</>
    case 'error':
      return <>{error}</>
    case 'no-access':
      return <>{noAccess}</>
    case 'populated':
    default:
      return <>{children}</>
  }
}

/** Bordered r-12 list frame; wraps populated rows and the loading skeleton. */
export function DataViewList({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('border-border overflow-hidden rounded-[12px] border', className)}
      {...props}
    >
      {children}
    </div>
  )
}

type PillTone = 'success' | 'warning' | 'destructive' | 'info' | 'primary' | 'violet' | 'neutral'

const PILL_TONE: Record<PillTone, { pill: string; dot: string }> = {
  success: { pill: 'bg-success-subtle text-success-subtle-foreground', dot: 'bg-success' },
  warning: { pill: 'bg-warning-subtle text-warning-subtle-foreground', dot: 'bg-warning' },
  destructive: {
    pill: 'bg-destructive-subtle text-destructive-subtle-foreground',
    dot: 'bg-destructive',
  },
  info: { pill: 'bg-info-subtle text-info-subtle-foreground', dot: 'bg-info' },
  primary: { pill: 'bg-primary-bg text-primary', dot: 'bg-primary' },
  violet: { pill: 'bg-violet-subtle text-violet-subtle-foreground', dot: 'bg-violet' },
  neutral: { pill: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
}

/** Status pill: subtle-tinted chip with a leading solid dot. */
export function StatusPill({
  tone = 'success',
  children,
}: {
  tone?: PillTone
  children: ReactNode
}) {
  const t = PILL_TONE[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[12px] font-medium',
        t.pill,
      )}
    >
      <span className={cn('size-1.5 rounded-full', t.dot)} />
      {children}
    </span>
  )
}

interface DataViewRowProps {
  /** Avatar initials. */
  initials: string
  /** Avatar background (deterministic per person is the caller's job). */
  avatarColor?: string
  name: string
  /** Mono identifier, e.g. "ITL-0042". */
  code: string
  /** Trailing status pill / action. */
  status?: ReactNode
}

/** Populated row: avatar + name + mono code + trailing status. Not hover-interactive (per spec). */
export function DataViewRow({ initials, avatarColor, name, code, status }: DataViewRowProps) {
  return (
    <div className="border-border flex items-center gap-3 border-t px-[15px] py-3">
      <span
        className="text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
        style={{ background: avatarColor ?? 'var(--primary)' }}
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-foreground truncate font-medium">{name}</div>
        <div className="text-muted-foreground truncate font-mono text-[11px]">{code}</div>
      </div>
      {status}
    </div>
  )
}
