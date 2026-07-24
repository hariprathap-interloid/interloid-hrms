import type { CSSProperties, ReactNode } from 'react'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Blocks, Clock, LayoutDashboard, Layers, LogOut, Palette, Table2 } from 'lucide-react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { env } from '@/config/env'
import { paths } from '@/config/paths'
import { useAuth } from '@/features/auth/use-auth'
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

/** Account menu — exposes the stubbed auth actions. `expire` lets the guard
    route to /session-expired; `signOut` sends the guard to /login. */
function AccountMenu() {
  const { user, signOut, expire } = useAuth()
  const initials =
    user?.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? '?'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Account menu">
          <span className="from-primary to-accent text-primary-foreground flex size-7 items-center justify-center rounded-full bg-linear-to-br text-[11px] font-semibold">
            {initials}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user && (
          <DropdownMenuLabel className="font-normal">
            <div className="text-foreground text-sm font-semibold">{user.name}</div>
            <div className="text-muted-foreground truncate font-mono text-[11px]">{user.email}</div>
          </DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={expire}>
          <Clock />
          Simulate session expiry
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <AccountMenu />
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
