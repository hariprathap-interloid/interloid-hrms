import { Check, ChevronDown, ChevronUp, Funnel, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * FilterBar — faceted filtering strip (design: components/FilterBar). Sits in a
 * DataTable's `toolbar` slot (or directly under the header). A leading label, a
 * row of facet dropdowns (single or multi select), the resulting removable
 * chips, and "Clear all". Chips derive from `values` unless `chips` is passed.
 * Active facets + chips use the indigo `--primary-bg` tint; the strip itself is
 * transparent so it layers onto the table card.
 * ------------------------------------------------------------------------- */

export interface FacetOption {
  value: string
  label?: string
}

export interface Facet {
  /** Field key written back through `onChange`. */
  key: string
  /** Button label when nothing is selected (also the chip prefix). */
  label: string
  options: (string | FacetOption)[]
  /** Allow several values (checkbox behaviour) instead of one. */
  multi?: boolean
}

export interface FilterChip {
  key: string
  value: string
  label: string
  onRemove?: () => void
}

export interface FilterBarProps {
  facets: Facet[]
  /** Current selections keyed by facet key. Multi facets hold an array. */
  values?: Record<string, string | string[]>
  /** Called as `(facetKey, nextValue)` — string for single, string[] for multi. */
  onChange?: (key: string, value: string | string[]) => void
  onClearAll?: () => void
  /** Leading label (default "Filter"). */
  label?: string
  /** Override the auto-derived chips. */
  chips?: FilterChip[]
}

function normalizeOption(option: string | FacetOption): FacetOption {
  return typeof option === 'object' ? option : { value: option, label: option }
}

function FacetDropdown({
  facet,
  value,
  onChange,
}: {
  facet: Facet
  value: string | string[] | undefined
  onChange?: FilterBarProps['onChange']
}) {
  const selected = facet.multi ? (Array.isArray(value) ? value : []) : value
  const active = facet.multi
    ? (selected as string[]).length > 0
    : selected != null && selected !== ''
  const display = facet.multi
    ? (selected as string[]).length === 0
      ? facet.label
      : (selected as string[]).length === 1
        ? String((selected as string[])[0])
        : `${facet.label} · ${(selected as string[]).length}`
    : active
      ? String(selected)
      : facet.label

  const pick = (optionValue: string) => {
    if (facet.multi) {
      const list = selected as string[]
      const next = list.includes(optionValue)
        ? list.filter((item) => item !== optionValue)
        : [...list, optionValue]
      onChange?.(facet.key, next)
    } else {
      onChange?.(facet.key, selected === optionValue ? '' : optionValue)
    }
  }

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'inline-flex h-[33px] items-center gap-1.5 rounded-[9px] border px-[11px] text-[12.5px] font-medium',
          active
            ? 'border-primary bg-primary-bg text-primary'
            : 'border-border bg-card text-foreground',
          'data-[state=open]:[&>svg.caret-down]:hidden [&>svg.caret-up]:hidden data-[state=open]:[&>svg.caret-up]:inline',
        )}
      >
        {display}
        <ChevronDown className="caret-down size-3.5" />
        <ChevronUp className="caret-up size-3.5" />
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-[260px] w-[200px] overflow-y-auto p-1.5">
        {facet.options.map((option) => {
          const o = normalizeOption(option)
          const checked = facet.multi
            ? (selected as string[]).includes(o.value)
            : selected === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => pick(o.value)}
              className={cn(
                'flex w-full items-center justify-between gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px]',
                checked ? 'bg-muted text-foreground' : 'text-foreground hover:bg-muted',
              )}
            >
              <span className="min-w-0 truncate">{o.label}</span>
              {checked && <Check className="text-primary size-4 shrink-0" />}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

export function FilterBar({
  facets,
  values = {},
  onChange,
  onClearAll,
  label = 'Filter',
  chips: chipsProp,
}: FilterBarProps) {
  const chips: FilterChip[] =
    chipsProp ??
    facets.flatMap((facet) => {
      const value = values[facet.key]
      if (facet.multi) {
        return (Array.isArray(value) ? value : []).map((item) => ({
          key: facet.key,
          value: item,
          label: `${facet.label}: ${item}`,
        }))
      }
      if (typeof value === 'string' && value !== '') {
        return [{ key: facet.key, value, label: `${facet.label}: ${value}` }]
      }
      return []
    })

  const removeChip = (chip: FilterChip) => {
    if (chip.onRemove) return chip.onRemove()
    const facet = facets.find((f) => f.key === chip.key)
    if (!facet || !onChange) return
    if (facet.multi) {
      const list = Array.isArray(values[facet.key]) ? (values[facet.key] as string[]) : []
      onChange(
        facet.key,
        list.filter((item) => item !== chip.value),
      )
    } else {
      onChange(facet.key, '')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground mr-0.5 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.04em] uppercase">
        <Funnel className="size-3.5" />
        {label}
      </span>
      {facets.map((facet) => (
        <FacetDropdown
          key={facet.key}
          facet={facet}
          value={values[facet.key]}
          onChange={onChange}
        />
      ))}
      {chips.map((chip) => (
        <span
          key={`${chip.key}:${chip.value}`}
          className="border-primary-bg bg-primary-bg text-primary inline-flex h-[30px] items-center gap-1.5 rounded-lg border py-0 pr-1.5 pl-[11px] text-[12px] font-medium"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => removeChip(chip)}
            aria-label={`Remove ${chip.label}`}
            className="text-primary hover:bg-primary/10 flex size-[18px] items-center justify-center rounded-[5px]"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      {chips.length > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-muted-foreground hover:text-foreground h-[30px] rounded-lg px-2.5 text-[12.5px] font-medium"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
