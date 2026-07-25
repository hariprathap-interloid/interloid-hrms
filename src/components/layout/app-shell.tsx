import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Blocks, LayoutDashboard, Layers, Palette, Radar, Table2 } from 'lucide-react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { paths } from '@/config/paths'
import { useAuth } from '@/features/auth/use-auth'
import { AppSidebar, type NavGroup } from './app-sidebar'
import { CommandPalette } from './command-palette'
import { TopBar } from './top-bar'

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
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: paths.dashboard.getHref(),
      },
      {
        // HR/Admin-only screen — the route itself is role-gated; nav
        // role-filtering is a later enhancement (today the only role is HR).
        key: 'command-center',
        label: 'Command center',
        icon: Radar,
        href: paths.commandCenter.getHref(),
      },
    ],
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

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { user, signOut, expire } = useAuth()
  const [paletteOpen, setPaletteOpen] = useState(false)

  const activeKey = useMemo(
    () => resolveActiveKey(NAV_GROUPS, location.pathname),
    [location.pathname],
  )

  // Page title/crumb for the TopBar, derived from the active nav item.
  let title = 'Interloid'
  let crumb: string | undefined
  for (const group of NAV_GROUPS) {
    const item = group.items.find((navItem) => navItem.key === activeKey)
    if (item) {
      title = item.label
      crumb = group.label
      break
    }
  }

  // Global ⌘K / Ctrl-K toggles the command palette.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const topBarUser = {
    name: user?.name ?? 'Interloid User',
    role: user?.title ?? 'Interloid',
    initials: initialsOf(user?.name ?? 'Interloid User'),
  }

  return (
    <SidebarProvider style={SIDEBAR_SIZES}>
      {/* Nav items navigate via react-router <Link> (built inside AppSidebar), so
          no onNavigate handler is needed here — hrefs carry the destinations. */}
      <AppSidebar groups={NAV_GROUPS} activeKey={activeKey} footer={<FooterStatus />} />
      <SidebarInset>
        <TopBar
          title={title}
          crumb={crumb}
          onSearch={() => setPaletteOpen(true)}
          notificationCount={3}
          user={topBarUser}
          onExpire={expire}
          onSignOut={signOut}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </SidebarProvider>
  )
}
