import { Bar, BarChart, CartesianGrid, Cell, XAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * CategoryBarChart — vertical bars, one per category (design: Company
 * Dashboard "Attendance by department", Attendance "hours by project").
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
  className?: string
}

export function CategoryBarChart({
  data,
  seriesLabel = 'Value',
  valueFormatter,
  className,
}: CategoryBarChartProps) {
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
