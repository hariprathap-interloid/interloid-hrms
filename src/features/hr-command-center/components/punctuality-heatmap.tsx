import type { HeatDept } from '../data'

/* ---------------------------------------------------------------------------
 * Punctuality heatmap — the one deliberately-non-Recharts chart (deferred from
 * the Recharts pass): Recharts has no first-class heatmap, so this is a CSS
 * grid of dept × day cells. Intensity is `color-mix` over the palette tokens —
 * green (--chart-3) for healthy on-time %, amber (--chart-4) for low — so no raw
 * colours and no new token. Cell rate/heat logic mirrors the design's heat().
 * ------------------------------------------------------------------------- */

const clamp = (lo: number, value: number, hi: number) => Math.max(lo, Math.min(hi, value))

// Deterministic daily wobble around the dept baseline (design's formula; sin,
// no Math.random — cells are stable across renders).
function cellRate(base: number, row: number, day: number): number {
  const wobble = Math.sin(row * 3.1 + day * 1.7) * 0.06 + (day % 4 === 0 ? -0.05 : 0)
  return clamp(0.72, base + wobble, 0.99)
}

function heatStyle(rate: number): { background: string; borderColor: string } {
  if (rate < 0.84) {
    const w = clamp(0.16, (0.86 - rate) * 3, 0.8)
    return {
      background: `color-mix(in srgb, var(--chart-4) ${Math.round(w * 100)}%, transparent)`,
      borderColor: 'transparent',
    }
  }
  const a = clamp(0.12, (rate - 0.68) / 0.32, 0.92)
  return {
    background: `color-mix(in srgb, var(--chart-3) ${Math.round(a * 100)}%, transparent)`,
    borderColor: a < 0.2 ? 'var(--border)' : 'transparent',
  }
}

// Stable string keys (index-as-key is linted away).
const DAY_KEYS = Array.from({ length: 10 }, (_, i) => `day-${i}`)
const LEGEND = [18, 42, 66, 90]

export function PunctualityHeatmap({ depts }: { depts: HeatDept[] }) {
  return (
    <section className="border-border bg-card rounded-[16px] border p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-foreground text-[14px] font-semibold">Punctuality heatmap</div>
          <div className="text-muted-foreground text-[12px]">on-time % · last 10 working days</div>
        </div>
        <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
          Low
          <span className="flex gap-[3px]">
            {LEGEND.map((pct) => (
              <span
                key={pct}
                className="size-3 rounded-[3px]"
                style={{ background: `color-mix(in srgb, var(--chart-3) ${pct}%, transparent)` }}
              />
            ))}
          </span>
          High
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {depts.map((dept, row) => (
          <div key={dept.dept} className="flex items-center gap-2.5">
            <span className="text-muted-foreground w-[82px] shrink-0 truncate text-[11.5px]">
              {dept.dept}
            </span>
            <div className="grid flex-1 grid-cols-10 gap-[5px]">
              {DAY_KEYS.map((key, day) => {
                const rate = cellRate(dept.base, row, day)
                const style = heatStyle(rate)
                return (
                  <div
                    key={key}
                    title={`${Math.round(rate * 100)}% on time`}
                    className="aspect-square rounded-[5px] border"
                    style={{ background: style.background, borderColor: style.borderColor }}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
