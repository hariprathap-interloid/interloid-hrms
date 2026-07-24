import { useNavigate } from 'react-router-dom'
import { Blocks, LayoutDashboard, Layers, Palette, Table2 } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import { paths } from '@/config/paths'

/* The ⌘K quick switcher (design: components/CommandPalette), built on shadcn's
   command primitive. Opened from the TopBar search affordance / global ⌘K. */

const SCREENS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: paths.home.getHref(), shortcut: 'G D' },
  { label: 'Design tokens', icon: Palette, href: paths.devTokens.getHref() },
  { label: 'Components', icon: Blocks, href: paths.devComponents.getHref() },
  { label: 'Data-view states', icon: Layers, href: paths.devStates.getHref() },
  { label: 'Data table', icon: Table2, href: paths.devTable.getHref() },
]

const EMPLOYEES = [
  { name: 'Aarav Mehta', code: 'ITL-0042' },
  { name: 'Priya Nair', code: 'ITL-0233' },
  { name: 'Vikram Shah', code: 'ITL-0151' },
]

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()

  const go = (href: string) => {
    onOpenChange(false)
    void navigate(href)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-[520px]"
      title="Command palette"
      description="Jump to a screen or employee"
    >
      <CommandInput placeholder="Jump to a screen or employee…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        <CommandGroup heading="Screens">
          {SCREENS.map((screen) => {
            const Icon = screen.icon
            return (
              <CommandItem key={screen.href} value={screen.label} onSelect={() => go(screen.href)}>
                <span className="bg-primary-bg text-primary flex size-[30px] items-center justify-center rounded-lg">
                  <Icon className="size-4" />
                </span>
                {screen.label}
                {screen.shortcut && <CommandShortcut>{screen.shortcut}</CommandShortcut>}
              </CommandItem>
            )
          })}
        </CommandGroup>
        <CommandGroup heading="Employees">
          {EMPLOYEES.map((person) => (
            <CommandItem
              key={person.code}
              value={`${person.name} ${person.code}`}
              onSelect={() => go(paths.devTable.getHref())}
            >
              <span className="bg-primary text-primary-foreground flex size-[30px] items-center justify-center rounded-full text-[11px] font-semibold">
                {initialsOf(person.name)}
              </span>
              <span className="flex flex-col">
                <span>{person.name}</span>
                <span className="text-muted-foreground font-mono text-[11px]">{person.code}</span>
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
