import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * Shimmer skeletons — from the States & Components spec (project 8f1502f5).
 * Distinct from the stock `ui/skeleton` (which is animate-pulse): these use the
 * design's moving-highlight shimmer via the reconciled `--skeleton` gradient
 * (stops 25/37/63) + background-size:640px + the `iws-shimmer` keyframe.
 * ------------------------------------------------------------------------- */

/** One shimmering placeholder bar. Size/radius come from `className`. */
export function Shimmer({ className, style, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      aria-hidden
      className={cn('rounded-[5px]', className)}
      style={{
        background: 'var(--skeleton)',
        backgroundSize: '640px 100%',
        animation: 'iws-shimmer 1.3s infinite linear',
        ...style,
      }}
      {...props}
    />
  )
}

// Stable, non-index keys for placeholder lists (satisfies react-x/no-array-index-key).
const PLACEHOLDER_KEYS = Array.from({ length: 12 }, (_, i) => `sk-${i}`)

/** Table-row placeholders: avatar + two text bars, optionally a trailing status pill. */
export function SkeletonRows({
  rows = 3,
  withStatus = false,
}: {
  rows?: number
  withStatus?: boolean
}) {
  return (
    <>
      {PLACEHOLDER_KEYS.slice(0, rows).map((key) => (
        <div
          key={key}
          className="border-border flex items-center gap-3 border-t px-[15px] py-[13px]"
        >
          <Shimmer className="size-8 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-[7px]">
            <Shimmer className="h-[11px] w-[42%]" />
            <Shimmer className="h-[9px] w-[24%]" />
          </div>
          {withStatus && <Shimmer className="h-[22px] w-[70px] rounded-full" />}
        </div>
      ))}
    </>
  )
}

/** KPI-card placeholders: label / value / sub bars in a bordered tile. */
export function SkeletonKpis({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PLACEHOLDER_KEYS.slice(0, cards).map((key) => (
        <div
          key={key}
          className="border-border flex flex-col gap-2.5 rounded-[12px] border p-[14px]"
        >
          <Shimmer className="h-[9px] w-[56%]" />
          <Shimmer className="h-[22px] w-[44%] rounded-[6px]" />
          <Shimmer className="h-[8px] w-[70%]" />
        </div>
      ))}
    </div>
  )
}

// Design's form-skeleton label widths (34% / 28% / 40%), unique so they key cleanly.
const FIELD_LABEL_WIDTHS = ['34%', '28%', '40%']

/** Form placeholders: label bar + 38px field ×n, plus a submit-button block. */
export function SkeletonForm({
  fields = 3,
  withSubmit = true,
}: {
  fields?: number
  withSubmit?: boolean
}) {
  return (
    <div className="flex flex-col gap-[15px]">
      {FIELD_LABEL_WIDTHS.slice(0, fields).map((width) => (
        <div key={width} className="flex flex-col gap-[7px]">
          <Shimmer className="h-[9px]" style={{ width }} />
          <Shimmer className="h-[38px] rounded-[9px]" />
        </div>
      ))}
      {withSubmit && <Shimmer className="h-[40px] w-[130px] rounded-[10px]" />}
    </div>
  )
}
