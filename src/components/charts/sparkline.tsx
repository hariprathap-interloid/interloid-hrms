import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * Sparkline — a tiny inline-SVG trend line for KPI tiles (design: Company
 * Dashboard / Attendance / HR Command Center KPI cards). Deliberately NOT a
 * Recharts instance: a dashboard renders 6+ of these, and one polyline is far
 * cheaper than mounting a chart per card. Stroke is token-wired (defaults to
 * --chart-1); pass any --chart-* to recolor. Matches the design's
 * viewBox="0 0 100 30" + non-scaling-stroke sparkline.
 * ------------------------------------------------------------------------- */

interface SparklineProps {
  /** Series values, oldest → newest. */
  data: number[]
  /** Stroke colour — a token, e.g. 'var(--chart-3)'. */
  color?: string
  width?: number
  height?: number
  className?: string
}

export function Sparkline({
  data,
  color = 'var(--chart-1)',
  width = 74,
  height = 28,
  className,
}: SparklineProps) {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  // Normalise into a 0–100 × 0–30 viewBox, y inverted, 1px inset top/bottom.
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 29 - ((value - min) / range) * 28
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      width={width}
      height={height}
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
