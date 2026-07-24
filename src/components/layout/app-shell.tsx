import type { CSSProperties, ReactNode } from 'react'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Blocks, LayoutDashboard, Layers, Palette, Table2 } from 'lucide-react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { env } from '@/config/env'
import { paths } from '@/config/paths'
import { AppSidebar, type NavGroup } from './app-sidebar'

/* Design widths (components/Sidebar): labeled 248px, icon rail 68px. The
   primitive reads these from SidebarProvider. */
const SIDEBAR_SIZES = {
  '--sidebar-width': '248px',
  '--sidebar-width-icon': '68px',
} as CSSProperties

/* App nav — already the "role-filtered groups" the design expects the caller
   to build. Today only the dev routes exist; product destinations land here
   as they ship. */
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ key: 'home', label: 'Dashboard', icon: LayoutDashboard, href: paths.home.getHref() }],
  },
  {
    label: 'Design System',
    items: [
      { key: 'dev-tokens', label: 'Tokens', icon: Palette, href: paths.devTokens.getHref() },
      {
        key: 'dev-components',
        label: 'Components',
        icon: Blocks,
        href: paths.devComponents.getHref(),
        badge: 6, // demo count — swap for a live value when one exists
      },
      { key: 'dev-states', label: 'States', icon: Layers, href: paths.devStates.getHref() },
      { key: 'dev-table', label: 'Data table', icon: Table2, href: paths.devTable.getHref() },
    ],
  },
]

/** Longest-prefix match so nested routes keep their top-level item active. */
function resolveActiveKey(groups: NavGroup[], pathname: string) {
  let match: { key: string; length: number } | undefined
  for (const group of groups) {
    for (const item of group.items) {
      const isMatch = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
      if (isMatch && (!match || item.href.length > match.length)) {
        match = { key: item.key, length: item.href.length }
      }
    }
  }
  return match?.key
}

function FooterStatus() {
  return (
    <div className="border-sidebar-border flex items-center gap-2 rounded-lg border px-2.5 py-1.5 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:px-0">
      <span className="bg-success size-1.5 shrink-0 rounded-full" />
      <span className="text-muted-foreground truncate text-[11px] font-medium group-data-[collapsible=icon]:hidden">
        Phase 1a · Live
      </span>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const activeKey = useMemo(
    () => resolveActiveKey(NAV_GROUPS, location.pathname),
    [location.pathname],
  )

  return (
    <SidebarProvider style={SIDEBAR_SIZES}>
      {/* Nav items navigate via react-router <Link> (built inside AppSidebar), so
          no onNavigate handler is needed here — hrefs carry the destinations. */}
      <AppSidebar groups={NAV_GROUPS} activeKey={activeKey} footer={<FooterStatus />} />
      <SidebarInset>
        <header className="border-border flex h-15 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <span className="text-foreground text-sm font-semibold">{env.VITE_APP_NAME}</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
