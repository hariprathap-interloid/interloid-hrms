import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { avatarColor, initialsOf } from './utils'

/* ---------------------------------------------------------------------------
 * DataTable cell renderers — the design's cell "types" (person / mono / badge)
 * as small components for use inside TanStack column `cell` renderers. Badges
 * here are the table's rounded-rect chip (r7); the full-pill status lives in
 * data-view's StatusPill — the design uses different shapes per context.
 * ------------------------------------------------------------------------- */

interface PersonCellProps {
  name: string
  /** Secondary line (email, id, team). */
  sub?: ReactNode
  /** Avatar fill; derived from the name when omitted. */
  color?: string
  /** Overrides the derived monogram. */
  initials?: string
}

/** Avatar + name (+ optional sub-line). */
export function PersonCell({ name, sub, color, initials }: PersonCellProps) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        className="text-primary-foreground flex size-[30px] shrink-0 items-center justify-center rounded-full text-[11.5px] font-semibold"
        style={{ background: color ?? avatarColor(name) }}
      >
        {initials ?? initialsOf(name)}
      </span>
      <span className="min-w-0">
        <span className="text-foreground block truncate font-semibold">{name}</span>
        {sub && <span className="text-muted-foreground block truncate text-[11.5px]">{sub}</span>}
      </span>
    </span>
  )
}

/** Monospace code/id cell (e.g. ITL-0042). */
export function MonoText({ children }: { children: ReactNode }) {
  return <span className="text-muted-foreground font-mono text-[12px]">{children}</span>
}

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'destructive' | 'info' | 'primary'

const BADGE_TONE: Record<BadgeTone, { chip: string; dot: string }> = {
  neutral: { chip: 'bg-muted text-foreground', dot: 'bg-muted-foreground' },
  success: { chip: 'bg-success-subtle text-success-subtle-foreground', dot: 'bg-success' },
  warning: { chip: 'bg-warning-subtle text-warning-subtle-foreground', dot: 'bg-warning' },
  destructive: {
    chip: 'bg-destructive-subtle text-destructive-subtle-foreground',
    dot: 'bg-destructive',
  },
  info: { chip: 'bg-info-subtle text-info-subtle-foreground', dot: 'bg-info' },
  primary: { chip: 'bg-primary-bg text-primary', dot: 'bg-primary' },
}

interface TableBadgeProps {
  tone?: BadgeTone
  /** Show the leading status dot (default true). */
  dot?: boolean
  children: ReactNode
}

/** Rounded-rect status chip (the table's badge cell — r7, not a full pill). */
export function TableBadge({ tone = 'neutral', dot = true, children }: TableBadgeProps) {
  const t = BADGE_TONE[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[7px] px-[9px] py-[3px] text-[11.5px] font-semibold',
        t.chip,
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', t.dot)} />}
      {children}
    </span>
  )
}
