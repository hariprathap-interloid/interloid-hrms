import {
  Building2,
  CalendarDays,
  Clock,
  FileText,
  Lock,
  Settings,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SECTIONS, isSectionLocked, type SectionKey } from '../data'

/* ---------------------------------------------------------------------------
 * Configuration sub-nav (design: left rail; a scrollable row on mobile/tablet).
 *
 * This is the screen's *third* permission layer, under nav-visibility and the
 * route gate: a section the role can't act in stays visible and reachable but
 * carries a lock. That's the manifest's permission-limited case — HR is
 * "partial", not excluded — so the item is never hidden and never disabled;
 * opening it shows the read-only variant.
 * ------------------------------------------------------------------------- */

const SECTION_ICON: Record<SectionKey, LucideIcon> = {
  org: Settings,
  departments: Building2,
  empTypes: UsersRound,
  leaveTypes: CalendarDays,
  policies: FileText,
  shifts: Clock,
  holidays: CalendarDays,
}

export function SectionNav({
  active,
  isAdmin,
  onSelect,
}: {
  active: SectionKey
  isAdmin: boolean
  onSelect: (key: SectionKey) => void
}) {
  return (
    <nav
      aria-label="Configuration sections"
      className="border-border flex shrink-0 gap-1 overflow-x-auto border-b px-4 py-2.5 lg:w-[212px] lg:flex-col lg:border-r lg:border-b-0 lg:px-3 lg:py-4"
    >
      {SECTIONS.map((section) => {
        const Icon = SECTION_ICON[section.key]
        const locked = isSectionLocked(section, isAdmin)
        const isActive = section.key === active
        return (
          <button
            key={section.key}
            type="button"
            onClick={() => onSelect(section.key)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex shrink-0 items-center gap-2.5 rounded-[9px] px-[11px] py-2.5 text-left text-[13px] whitespace-nowrap transition-colors',
              isActive
                ? 'bg-primary-bg text-primary font-semibold'
                : locked
                  ? 'text-muted-foreground hover:bg-muted font-medium'
                  : 'text-foreground hover:bg-muted font-medium',
            )}
          >
            <Icon
              className={cn('size-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
              strokeWidth={2}
            />
            <span className="flex-1">{section.label}</span>
            {locked && (
              <Lock
                className="text-muted-foreground size-3.5 shrink-0"
                aria-label="Read-only for your role"
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
