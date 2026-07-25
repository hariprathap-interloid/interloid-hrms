import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, ClipboardCheck, Clock, PlayCircle, Users } from 'lucide-react'
import { paths } from '@/config/paths'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * Marketing landing (design: Home.dc.html, project 8f1502f5) — the PUBLIC
 * pre-auth splash at "/". Its own glass chrome (not the AppShell): brand nav,
 * mesh hero + gradient headline, an approvals-queue glimpse, module cards,
 * role rows, footer. Links into /login. Authenticated visitors are redirected
 * to /dashboard by the page wrapper before this ever renders.
 * ------------------------------------------------------------------------- */

interface Module {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  body: string
}

const MODULES: Module[] = [
  {
    icon: Clock,
    title: 'Attendance',
    body: 'Biometric sync, shift views and one-tap regularisation requests.',
  },
  {
    icon: CalendarDays,
    title: 'Leave',
    body: 'Apply in seconds with live balances and inline validation.',
  },
  {
    icon: ClipboardCheck,
    title: 'Approvals',
    body: 'A single queue for every decision, with optimistic actions.',
  },
  {
    icon: Users,
    title: 'People',
    body: 'Employee records, directory and role-scoped access.',
  },
]

const ROLES: { initials: string; title: string; body: string }[] = [
  { initials: 'E', title: 'Employee', body: 'your day, your leave, your punches' },
  { initials: 'TL', title: 'Team Lead', body: "your team's attendance and leave at a glance" },
  {
    initials: 'HR',
    title: 'HR Manager',
    body: 'approvals, records and regularisation across the org',
  },
  { initials: 'SA', title: 'Super Admin', body: 'configuration, users and the full audit trail' },
]

const DEMO_ROWS: {
  initials: string
  title: string
  meta: string
  chip: string
  chipTone: 'warning' | 'success'
}[] = [
  {
    initials: 'DS',
    title: 'Diya Sharma · Casual leave',
    meta: '9–10 Jul · 2 days · balance 6.5',
    chip: 'Pending',
    chipTone: 'warning',
  },
  {
    initials: 'KN',
    title: 'Kabir Nair · Regularisation',
    meta: 'Missed punch-out · 4 Jul',
    chip: 'Pending',
    chipTone: 'warning',
  },
  {
    initials: 'AM',
    title: 'Aarav Mehta · Earned leave',
    meta: '21–25 Jul · 5 days',
    chip: 'Approved',
    chipTone: 'success',
  },
]

const CHIP_TONE = {
  warning: 'bg-warning-subtle text-warning-subtle-foreground',
  success: 'bg-success-subtle text-success-subtle-foreground',
} as const

function BrandMark({ className, glyphClassName }: { className?: string; glyphClassName?: string }) {
  return (
    <span
      className={cn(
        'from-primary to-brand-accent text-primary-foreground flex items-center justify-center rounded-[9px] bg-linear-to-br font-bold',
        className,
      )}
    >
      <span className={glyphClassName}>I</span>
    </span>
  )
}

export function MarketingHome() {
  const loginHref = paths.login.getHref()

  return (
    <div className="text-foreground bg-background relative min-h-dvh overflow-hidden">
      {/* mesh wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'var(--mesh)' }}
      />

      {/* NAV */}
      <header className="border-glass-border bg-glass sticky top-0 z-30 flex h-16 items-center gap-3.5 border-b px-[clamp(18px,4vw,44px)] backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <BrandMark className="size-8 text-base" />
          <div className="leading-tight">
            <div className="font-semibold tracking-[-0.01em]">Interloid</div>
            <div className="text-muted-foreground text-[11px]">Workforce Suite</div>
          </div>
        </div>
        <div className="flex-1" />
        <nav className="mr-2 hidden items-center gap-6 text-[13.5px] font-medium sm:flex">
          <a href="#modules" className="text-muted-foreground hover:text-foreground">
            Modules
          </a>
          <a href="#roles" className="text-muted-foreground hover:text-foreground">
            Roles
          </a>
        </nav>
        <ThemeToggle />
        <Button asChild>
          <Link to={loginHref}>Sign in</Link>
        </Button>
      </header>

      {/* HERO */}
      <section className="relative mx-auto max-w-[1080px] animate-[iws-in_0.5s_cubic-bezier(0.22,0.61,0.36,1)_both] px-6 pt-[clamp(56px,9vh,96px)] pb-10 text-center">
        <div className="border-glass-border bg-glass text-muted-foreground mb-[22px] inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium backdrop-blur-md">
          <span className="bg-success size-[7px] rounded-full" />
          Phase 1a · Attendance, Leave &amp; Approvals
        </div>
        <h1 className="text-[clamp(34px,5.4vw,56px)] leading-[1.12] font-bold tracking-[-0.03em]">
          Your workday,
          <br />
          <span className="from-primary to-brand-accent bg-linear-to-br bg-clip-text text-transparent">
            in one place.
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-[18px] max-w-[520px] text-[clamp(15px,1.8vw,17px)]">
          Interloid brings attendance, leave and approvals together for every employee, lead and HR
          manager — with one queue for everything that needs a decision.
        </p>
        <div className="mt-[30px] flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="h-12 gap-2 rounded-xl px-[26px] text-[15px]">
            <Link to={loginHref}>
              Sign in to your workspace
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 gap-2 rounded-xl px-[26px] text-[15px]"
          >
            <a href="#modules">
              <PlayCircle className="size-4" />
              Take the tour
            </a>
          </Button>
        </div>

        {/* product glimpse — approvals queue */}
        <div className="border-glass-border bg-glass mx-auto mt-[52px] max-w-[720px] rounded-[18px] border p-[18px] text-left shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2.5 px-1 pb-3">
            <span className="text-[13px] font-semibold">Approvals queue</span>
            <span className="bg-primary-bg text-primary rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              3 pending
            </span>
            <div className="flex-1" />
            <span className="text-muted-foreground hidden font-mono text-[11px] sm:inline">
              ⌘K to search
            </span>
          </div>
          {DEMO_ROWS.map((row) => (
            <div
              key={row.initials}
              className="border-border bg-card mt-2 flex items-center gap-[13px] rounded-[11px] border px-3.5 py-3"
            >
              <span className="bg-primary-bg text-primary flex size-[34px] shrink-0 items-center justify-center rounded-full text-[12px] font-semibold">
                {row.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold">{row.title}</div>
                <div className="text-muted-foreground text-[12px]">{row.meta}</div>
              </div>
              <span
                className={cn(
                  'hidden shrink-0 rounded-full px-2.5 py-[3px] text-[11px] font-semibold sm:inline',
                  CHIP_TONE[row.chipTone],
                )}
              >
                {row.chip}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* MODULES */}
      <section id="modules" className="relative mx-auto max-w-[1080px] px-6 py-12">
        <div className="mb-8 text-center">
          <div className="text-primary text-[12px] font-semibold tracking-[0.08em] uppercase">
            Modules
          </div>
          <h2 className="mt-2 text-[clamp(24px,3.2vw,32px)] font-bold tracking-[-0.02em]">
            Everything Phase 1a covers
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((module) => {
            const Icon = module.icon
            return (
              <div
                key={module.title}
                className="border-border bg-card rounded-[15px] border p-[22px]"
              >
                <span className="bg-primary-bg text-primary mb-3.5 flex size-[42px] items-center justify-center rounded-xl [&_svg]:size-5">
                  <Icon strokeWidth={2} />
                </span>
                <div className="text-[15.5px] font-semibold">{module.title}</div>
                <div className="text-muted-foreground mt-1.5 text-[13.5px]">{module.body}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="relative mx-auto max-w-[1080px] px-6 pt-6 pb-16">
        <div className="border-glass-border bg-glass rounded-[18px] border p-[clamp(24px,4vw,40px)] backdrop-blur-xl">
          <div className="grid items-center gap-7 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <div className="text-primary text-[12px] font-semibold tracking-[0.08em] uppercase">
                Role-aware by design
              </div>
              <h2 className="mt-2 text-[clamp(22px,2.8vw,28px)] font-bold tracking-[-0.02em]">
                One suite, four views
              </h2>
              <p className="text-muted-foreground mt-2.5 text-[14px]">
                Everyone signs into the same place. What you see — and what you can approve,
                configure or audit — follows your role automatically.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              {ROLES.map((role) => (
                <div
                  key={role.initials}
                  className="border-border bg-card flex items-center gap-3 rounded-[11px] border px-3.5 py-2.5"
                >
                  <span className="bg-primary-bg text-primary flex size-8 shrink-0 items-center justify-center rounded-[9px] text-[12px] font-semibold">
                    {role.initials}
                  </span>
                  <div className="min-w-0 text-[13.5px]">
                    <span className="font-semibold">{role.title}</span>
                    <span className="text-muted-foreground"> — {role.body}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-glass-border bg-glass relative border-t backdrop-blur-md">
        <div className="text-muted-foreground mx-auto flex max-w-[1080px] flex-wrap items-center gap-3.5 px-6 py-[22px] text-[12.5px]">
          <div className="flex items-center gap-2">
            <BrandMark className="size-[22px] text-[11px]" />
            Interloid Workforce Suite
          </div>
          <div className="flex-1" />
          <Link to={loginHref} className="text-primary hover:underline">
            Sign in
          </Link>
          <span className="text-border">·</span>
          <span>© 2026 Interloid</span>
        </div>
      </footer>
    </div>
  )
}
