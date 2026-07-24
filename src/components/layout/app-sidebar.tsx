import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * AppSidebar — the app-shell primary navigation, composed against the design
 * system source (project 8f1502f5, components/Sidebar). The shadcn `Sidebar`
 * primitive owns collapse, the mobile Sheet, and keyboard nav; this file only
 * feeds it the design's structure (brand header, grouped items, active rail,
 * count badges, footer slot) and paints the design's treatment on top.
 *
 * Role-awareness is the caller's job: pass already-filtered `groups`.
 * Rail (icon) width and labeled width are set on SidebarProvider in app-shell.
 * ------------------------------------------------------------------------- */

export interface NavItem {
  /** Stable key compared against `activeKey`. */
  key: string
  label: string
  icon: LucideIcon
  /** Count badge (e.g. pending approvals). */
  badge?: number | string
  /** Destination handed back through `onNavigate`. */
  href: string
}

export interface NavGroup {
  /** Section heading; hidden in rail mode. Omit for an unlabeled group. */
  label?: string
  items: NavItem[]
}

export interface SidebarBrand {
  title: string
  subtitle?: string
  /** Single-letter mark in the logo tile. */
  initial: string
}

interface AppSidebarProps {
  /** Already role-filtered nav groups. */
  groups: NavGroup[]
  activeKey?: string
  brand?: SidebarBrand
  /** Footer node (status chip, upgrade card, etc). */
  footer?: ReactNode
}

const DEFAULT_BRAND: SidebarBrand = {
  title: 'Interloid',
  subtitle: 'Workforce Suite',
  initial: 'I',
}

export function AppSidebar({ groups, activeKey, brand = DEFAULT_BRAND, footer }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      {/* Brand — 60px bar, gradient mark, title + subtitle (subtitle drops in rail) */}
      <SidebarHeader
        className={cn(
          'border-sidebar-border h-15 flex-row items-center gap-2.5 border-b px-4 py-0',
          'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
        )}
      >
        <div className="from-primary to-accent text-primary-foreground flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-linear-to-br text-[15px] font-bold">
          {brand.initial}
        </div>
        <div className="min-w-0 group-data-[collapsible=icon]:hidden">
          <div className="text-sidebar-foreground truncate text-sm font-semibold tracking-[-0.01em]">
            {brand.title}
          </div>
          {brand.subtitle && (
            <div className="text-muted-foreground truncate text-[11px]">{brand.subtitle}</div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1.5 py-2.5">
        {groups.map((group) => (
          <SidebarGroup
            key={group.label ?? group.items.map((item) => item.key).join(',')}
            className="gap-1 py-1"
          >
            {group.label && (
              <SidebarGroupLabel className="text-muted-foreground px-2.5 text-[10.5px] font-semibold tracking-[0.06em] uppercase">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = item.key === activeKey
                  return (
                    <SidebarMenuItem key={item.key}>
                      {/* Active rail — design puts a 3px primary bar at the left edge.
                          Rendered as a sibling (not a ::before on the button, which
                          clips it via overflow-hidden). */}
                      {active && (
                        <span
                          aria-hidden
                          className="bg-primary pointer-events-none absolute top-1/2 left-0 z-10 h-[18px] w-[3px] -translate-y-1/2 rounded-r-full"
                        />
                      )}
                      {/* asChild → renders a real <a href> (react-router Link) so the item
                          keeps anchor semantics: middle-click / open-in-new-tab / right-click. */}
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                        className={cn(
                          'h-9 gap-2.5 rounded-[9px] text-[13.5px] font-medium [&_svg]:size-[18px]',
                          // Active: bg tint + PRIMARY label (design), not accent-foreground.
                          'data-active:text-primary data-active:font-semibold',
                          // Rail: full-width, centered icon (primitive defaults to a 32px left-aligned box).
                          'group-data-[collapsible=icon]:size-auto! group-data-[collapsible=icon]:h-9! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-[9px] group-data-[collapsible=icon]:px-0!',
                        )}
                      >
                        <Link to={item.href}>
                          <Icon strokeWidth={1.8} />
                          <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge != null && item.badge !== '' && (
                        <SidebarMenuBadge
                          className={cn(
                            'bg-primary text-primary-foreground h-[19px] min-w-[19px] rounded-[9px] px-[5px] text-[11px] font-semibold',
                            // Design floats the count badge into the rail corner. The primitive
                            // deliberately hides SidebarMenuBadge in icon mode
                            // (group-data-[collapsible=icon]:hidden); we intentionally override that
                            // display back to `flex` (+ reposition) to keep the badge visible in the
                            // rail, per the design card. These win over the primitive's baked-in
                            // classes via tailwind-merge last-wins on the same variant+property.
                            'group-data-[collapsible=icon]:top-1 group-data-[collapsible=icon]:right-2 group-data-[collapsible=icon]:flex',
                          )}
                        >
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {footer && (
        <SidebarFooter className="border-sidebar-border border-t p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
          {footer}
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
