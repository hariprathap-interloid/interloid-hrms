import { Bar, BarChart, CartesianGrid, Cell, XAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * CategoryBarChart — one bar per category.
 *   layout="vertical"   (default) → Recharts vertical bars (design: Company
 *                        Dashboard "Attendance by department").
 *   layout="horizontal" → labeled progress meters, track + % fill, no axis
 *                        (design: HR Command Center "Leave taken by type").
 * Each bar can carry its own --chart-* token so the design's highlight bars
 * (e.g. Design=amber, Sales=rose against indigo) survive.
 * ------------------------------------------------------------------------- */

export interface CategoryBar {
  label: string
  value: number
  /** Per-bar colour token; defaults to --chart-1. */
  color?: string
}

interface CategoryBarChartProps {
  data: CategoryBar[]
  seriesLabel?: string
  valueFormatter?: (value: number) => string
  /** Orientation: vertical Recharts bars, or horizontal labeled meters. */
  layout?: 'vertical' | 'horizontal'
  className?: string
}

export function CategoryBarChart({
  data,
  seriesLabel = 'Value',
  valueFormatter,
  layout = 'vertical',
  className,
}: CategoryBarChartProps) {
  if (layout === 'horizontal') {
    const max = Math.max(...data.map((bar) => bar.value), 1)
    return (
      <div className={cn('flex flex-col gap-3.5', className)}>
        {data.map((bar) => (
          <div key={bar.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-foreground font-medium">{bar.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {valueFormatter ? valueFormatter(bar.value) : bar.value}
              </span>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.round((bar.value / max) * 100)}%`,
                  background: bar.color ?? 'var(--chart-1)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const config = { value: { label: seriesLabel, color: 'var(--chart-1)' } } satisfies ChartConfig

  return (
    <ChartContainer config={config} className={cn('aspect-auto h-[150px] w-full', className)}>
      <BarChart data={data} margin={{ left: 4, right: 4, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideIndicator
              formatter={(value) => (valueFormatter ? valueFormatter(Number(value)) : value)}
            />
          }
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={34}>
          {data.map((bar) => (
            <Cell key={bar.label} fill={bar.color ?? 'var(--chart-1)'} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
