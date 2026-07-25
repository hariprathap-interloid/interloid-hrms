/* Shared chart layer — token-wired Recharts wrappers (+ inline-SVG Sparkline).
   Colours bind to the app's --chart-1..5 scale (index.css). Reused by the
   Company Dashboard now; HR Command Center + Attendance adopt them next.
   (The design system's readme specifies charts use --chart-1..5; the .dc.html
   prototypes used screen-local hexes, reconciled here to the token scale.) */

export { Sparkline } from './sparkline'
export { AreaTrend, type AreaTrendPoint } from './area-trend'
export { CategoryBarChart, type CategoryBar } from './category-bar-chart'
export { DonutChart, type DonutSegment } from './donut-chart'

/** The app chart palette, in order — brand indigo, sky, green, amber, rose. */
export const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const
