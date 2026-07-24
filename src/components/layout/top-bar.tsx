import { Bell, Clock, LogOut, Search } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
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

/* ---------------------------------------------------------------------------
 * TopBar — the app-shell header (design: components/TopBar). Glass chrome:
 * sidebar toggle + page title/crumb, a ⌘K search affordance that opens the
 * command palette, a notifications bell with a count, and the user button.
 * The user menu folds in the stubbed-session actions (expire / sign out).
 * ------------------------------------------------------------------------- */

interface TopBarUser {
  name: string
  role: string
  initials: string
}

interface TopBarProps {
  title: string
  crumb?: string
  onSearch: () => void
  notificationCount?: number
  user: TopBarUser
  onExpire: () => void
  onSignOut: () => void
}

const NOTIFICATIONS = [
  { id: 'n1', title: 'Leave request approved', desc: 'Aarav Mehta · 12–14 Jul' },
  { id: 'n2', title: '3 timesheets need review', desc: 'Engineering · due today' },
  { id: 'n3', title: 'New employee onboarded', desc: 'Diya Sharma joined People Ops' },
]

export function TopBar({
  title,
  crumb,
  onSearch,
  notificationCount = 0,
  user,
  onExpire,
  onSignOut,
}: TopBarProps) {
  return (
    <header
      data-slot="top-bar"
      className="border-border bg-glass relative z-30 flex h-15 shrink-0 items-center gap-2.5 border-b px-4 backdrop-blur-md"
    >
      <SidebarTrigger />
      <div className="min-w-0">
        <div className="text-foreground truncate text-[15px] font-semibold tracking-[-0.01em]">
          {title}
        </div>
        {crumb && <div className="text-muted-foreground truncate text-[11.5px]">{crumb}</div>}
      </div>

      <div className="flex-1" />

      {/* ⌘K search — full box on md+, icon button on mobile */}
      <button
        type="button"
        onClick={onSearch}
        className="border-border bg-card text-muted-foreground hidden h-[38px] w-[240px] items-center gap-2.5 rounded-[10px] border px-3 text-[13px] md:flex"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="border-border bg-muted rounded-md border px-1.5 py-px font-mono text-[11px]">
          ⌘K
        </kbd>
      </button>
      <Button
        variant="outline"
        size="icon"
        className="md:hidden"
        onClick={onSearch}
        aria-label="Search"
      >
        <Search />
      </Button>

      <ThemeToggle />

      {/* notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
            <Bell />
            {notificationCount > 0 && (
              <span className="bg-destructive ring-background absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2">
                {notificationCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {NOTIFICATIONS.map((item) => (
            <DropdownMenuItem key={item.id} className="flex-col items-start gap-0.5">
              <span className="text-foreground text-[13px] font-medium">{item.title}</span>
              <span className="text-muted-foreground text-[12px]">{item.desc}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* user + stubbed-session actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 gap-2.5 px-1.5">
            <span className="from-primary to-accent text-primary-foreground flex size-8 items-center justify-center rounded-full bg-linear-to-br text-[12px] font-semibold">
              {user.initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="text-foreground block text-[13px] leading-tight font-semibold">
                {user.name}
              </span>
              <span className="text-muted-foreground block text-[11px] leading-tight">
                {user.role}
              </span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="text-foreground text-sm font-semibold">{user.name}</div>
            <div className="text-muted-foreground text-[11px]">{user.role}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExpire}>
            <Clock />
            Simulate session expiry
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onSignOut}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
