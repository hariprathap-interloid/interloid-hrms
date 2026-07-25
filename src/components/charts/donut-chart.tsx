import { Label, Pie, PieChart } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * DonutChart — a ring breakdown with a centred total and an optional legend
 * (design: Company Dashboard "Attendance today" / "Leave balance", Attendance
 * donut). Segment colours are --chart-* tokens passed per segment.
 * ------------------------------------------------------------------------- */

export interface DonutSegment {
  label: string
  value: number
  /** Optional pre-formatted value for the legend (e.g. "1,096"). */
  display?: string
  /** Segment colour token, e.g. 'var(--chart-3)'. */
  color: string
}

interface DonutChartProps {
  data: DonutSegment[]
  /** Big number in the ring centre. */
  centerValue?: string
  /** Sub-label under the centre value. */
  centerLabel?: string
  showLegend?: boolean
  className?: string
}

export function DonutChart({
  data,
  centerValue,
  centerLabel,
  showLegend = true,
  className,
}: DonutChartProps) {
  const config = Object.fromEntries(
    data.map((segment) => [segment.label, { label: segment.label, color: segment.color }]),
  ) satisfies ChartConfig

  return (
    <div className={cn('flex items-center gap-[18px]', className)}>
      <ChartContainer config={config} className="aspect-square size-[104px] shrink-0">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={34}
            outerRadius={50}
            paddingAngle={2}
            strokeWidth={0}
            startAngle={90}
            endAngle={-270}
          >
            {(centerValue || centerLabel) && (
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !('cx' in viewBox)) return null
                  const { cx, cy } = viewBox
                  return (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                      {centerValue && (
                        <tspan
                          x={cx}
                          y={cy}
                          className="fill-foreground text-[19px] font-bold tracking-[-0.02em]"
                        >
                          {centerValue}
                        </tspan>
                      )}
                      {centerLabel && (
                        <tspan
                          x={cx}
                          y={(cy ?? 0) + 16}
                          className="fill-muted-foreground text-[10.5px]"
                        >
                          {centerLabel}
                        </tspan>
                      )}
                    </text>
                  )
                }}
              />
            )}
          </Pie>
        </PieChart>
      </ChartContainer>

      {showLegend && (
        <div className="flex min-w-0 flex-1 flex-col gap-[9px]">
          {data.map((segment) => (
            <div key={segment.label} className="flex items-center gap-2">
              <span
                className="size-[9px] shrink-0 rounded-[3px]"
                style={{ background: segment.color }}
              />
              <span className="text-foreground/80 min-w-0 flex-1 truncate text-[12.5px]">
                {segment.label}
              </span>
              <span className="text-foreground text-[12.5px] font-semibold tabular-nums">
                {segment.display ?? segment.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
