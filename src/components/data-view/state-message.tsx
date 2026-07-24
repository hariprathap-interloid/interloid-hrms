import type { ReactNode } from 'react'
import { Inbox, Lock, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * Centred state messages — empty / error / no-access from the States &
 * Components spec (project 8f1502f5). One shell (StateMessage): a 52px tinted
 * icon tile, a copy slot (title + description + optional mono code), and an
 * action slot. Tints use the semantic `-subtle` tokens.
 * ------------------------------------------------------------------------- */

type StateTone = 'muted' | 'success' | 'warning' | 'destructive' | 'info'

const TONE_TILE: Record<StateTone, string> = {
  muted: 'bg-muted text-muted-foreground',
  success: 'bg-success-subtle text-success-subtle-foreground',
  warning: 'bg-warning-subtle text-warning-subtle-foreground',
  destructive: 'bg-destructive-subtle text-destructive',
  info: 'bg-info-subtle text-info-subtle-foreground',
}

interface StateMessageProps {
  /** Glyph for the tile (e.g. a lucide icon); sized to 25px by the tile. */
  icon: ReactNode
  tone?: StateTone
  title: string
  description?: ReactNode
  /** Mono status line, e.g. "503 · service_unavailable". */
  code?: string
  /** Action slot — a button, or nothing. Omitted entirely by NoAccessState. */
  action?: ReactNode
  /** Cap the description width (design: 280 for empty, 300 for no-access). */
  descriptionMaxWidth?: number
  className?: string
}

export function StateMessage({
  icon,
  tone = 'muted',
  title,
  description,
  code,
  action,
  descriptionMaxWidth,
  className,
}: StateMessageProps) {
  return (
    <div className={cn('flex flex-col items-center gap-[13px] px-5 py-11 text-center', className)}>
      <span
        className={cn(
          'flex size-[52px] items-center justify-center rounded-[15px] [&_svg]:size-[25px]',
          TONE_TILE[tone],
        )}
      >
        {icon}
      </span>
      <div>
        <div className="text-foreground text-[15px] font-semibold">{title}</div>
        {description && (
          <div
            className="text-muted-foreground mx-auto mt-[3px] text-[13px]"
            style={descriptionMaxWidth ? { maxWidth: descriptionMaxWidth } : undefined}
          >
            {description}
          </div>
        )}
        {code && <div className="text-muted-foreground mt-[7px] font-mono text-[11px]">{code}</div>}
      </div>
      {action}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
}

/** Empty view — muted tile + a primary CTA in the action slot. */
export function EmptyState({ title, description, action, icon = <Inbox /> }: EmptyStateProps) {
  return (
    <StateMessage
      tone="muted"
      icon={icon}
      title={title}
      description={description}
      action={action}
      descriptionMaxWidth={280}
    />
  )
}

interface ErrorStateProps {
  title: string
  description?: ReactNode
  /** Mono status code (error states always surface one). */
  code?: string
  action?: ReactNode
  icon?: ReactNode
}

/** Error view — destructive-subtle tile, mono code line, an outline retry in the action slot. */
export function ErrorState({
  title,
  description,
  code,
  action,
  icon = <TriangleAlert />,
}: ErrorStateProps) {
  return (
    <StateMessage
      tone="destructive"
      icon={icon}
      title={title}
      description={description}
      code={code}
      action={action}
    />
  )
}

interface NoAccessStateProps {
  title: string
  description?: ReactNode
  icon?: ReactNode
}

/**
 * No-access view — warning-subtle tile. Per the spec, permission failures
 * HIDE actions rather than disabling them, so there is deliberately no `action`
 * slot on this component: a role that can't act simply sees no button.
 */
export function NoAccessState({ title, description, icon = <Lock /> }: NoAccessStateProps) {
  return (
    <StateMessage
      tone="warning"
      icon={icon}
      title={title}
      description={description}
      descriptionMaxWidth={300}
    />
  )
}
