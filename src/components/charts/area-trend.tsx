import { useId } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * AreaTrend — a single-series area/line trend (design: Company Dashboard
 * "Headcount trend", HR Command Center "Attendance rate", Attendance screen).
 * Thin Recharts wrapper: the line + gradient fill are token-wired via the
 * chart config (--color-value resolves to the passed --chart-* token).
 * ------------------------------------------------------------------------- */

export interface AreaTrendPoint {
  /** X-axis label (e.g. "Jan", "W1"). */
  label: string
  value: number
}

interface AreaTrendProps {
  data: AreaTrendPoint[]
  /** Series name shown in the tooltip. */
  seriesLabel?: string
  /** Line/fill colour token (defaults to --chart-1). */
  color?: string
  /** Tooltip value formatter. */
  valueFormatter?: (value: number) => string
  className?: string
}

export function AreaTrend({
  data,
  seriesLabel = 'Value',
  color = 'var(--chart-1)',
  valueFormatter,
  className,
}: AreaTrendProps) {
  const gradientId = useId().replace(/:/g, '')
  const config = { value: { label: seriesLabel, color } } satisfies ChartConfig

  // Data-relative Y domain (numeric — Recharts' function form is unreliable in
  // v3) so a small trend reads as a curve, not a flat line pinned to 0.
  const values = data.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = (max - min || Math.abs(max) || 1) * 0.15
  const domain: [number, number] = [min - pad, max + pad]

  return (
    <ChartContainer config={config} className={cn('aspect-auto h-[150px] w-full', className)}>
      <AreaChart data={data} margin={{ left: 4, right: 6, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.18} />
            <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis hide domain={domain} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideIndicator
              formatter={(value) => (valueFormatter ? valueFormatter(Number(value)) : value)}
            />
          }
        />
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          fillOpacity={1}
          dot={false}
          activeDot={{ r: 3.5 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
