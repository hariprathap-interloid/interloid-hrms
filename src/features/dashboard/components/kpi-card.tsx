import type { LucideIcon } from 'lucide-react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Sparkline } from '@/components/charts'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * KpiCard — a dashboard metric tile: icon + label, big value, trailing
 * sparkline, and a semantic delta chip + sub-line (design: Company Dashboard
 * KPI cards). Renders as a <button> when `onClick` is given (KPIs deep-link in
 * the design), otherwise a static tile.
 * ------------------------------------------------------------------------- */

type IconTone = 'primary' | 'success' | 'warning' | 'info' | 'neutral'
type DeltaTone = 'success' | 'destructive' | 'muted'
type DeltaDir = 'up' | 'down' | 'flat'

const ICON_TONE: Record<IconTone, string> = {
  primary: 'bg-primary-bg text-primary',
  success: 'bg-success-subtle text-success-subtle-foreground',
  warning: 'bg-warning-subtle text-warning-subtle-foreground',
  info: 'bg-info-subtle text-info-subtle-foreground',
  neutral: 'bg-muted text-muted-foreground',
}

const DELTA_TONE: Record<DeltaTone, string> = {
  success: 'bg-success-subtle text-success-subtle-foreground',
  destructive: 'bg-destructive-subtle text-destructive-subtle-foreground',
  muted: 'bg-muted text-muted-foreground',
}

export interface KpiCardProps {
  label: string
  value: string
  sub: string
  icon: LucideIcon
  iconTone?: IconTone
  delta: string
  deltaTone?: DeltaTone
  deltaDir?: DeltaDir
  spark: number[]
  sparkColor?: string
  onClick?: () => void
}

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  iconTone = 'primary',
  delta,
  deltaTone = 'muted',
  deltaDir = 'flat',
  spark,
  sparkColor,
  onClick,
}: KpiCardProps) {
  const interactive = Boolean(onClick)
  const Element = interactive ? 'button' : 'div'
  const DeltaArrow = deltaDir === 'down' ? ArrowDown : ArrowUp

  return (
    <Element
      {...(interactive ? { type: 'button' as const, onClick } : {})}
      className={cn(
        'border-border bg-card flex flex-col rounded-[13px] border p-[18px] text-left shadow-sm',
        interactive &&
          'hover:border-border/70 focus-visible:ring-ring focus-visible:ring-offset-background cursor-pointer transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex size-[30px] shrink-0 items-center justify-center rounded-lg [&_svg]:size-4',
            ICON_TONE[iconTone],
          )}
        >
          <Icon strokeWidth={1.8} />
        </span>
        <span className="text-muted-foreground min-w-0 flex-1 truncate text-[12.5px] font-medium">
          {label}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="text-foreground text-[26px] leading-none font-bold tracking-[-0.025em]">
          {value}
        </div>
        <Sparkline data={spark} color={sparkColor} />
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-md px-[7px] py-0.5 text-[11.5px] font-semibold',
            DELTA_TONE[deltaTone],
          )}
        >
          {deltaDir !== 'flat' && <DeltaArrow className="size-3" strokeWidth={2.4} />}
          {delta}
        </span>
        <span className="text-muted-foreground truncate text-[11.5px]">{sub}</span>
      </div>
    </Element>
  )
}
