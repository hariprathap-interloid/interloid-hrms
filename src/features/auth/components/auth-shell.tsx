import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * Shared auth chrome. `AuthTwoPane` = the Login-style brand showcase + auth
 * column (Login / Forgot / Reset). `AuthCentered` = a glass card on a mesh wash
 * (Account Setup / Session Expired). `AuthShowcase` fills the left pane.
 * ------------------------------------------------------------------------- */

/** Compact gradient "I" brand mark shown atop auth panels. */
export function AuthBrandMark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="from-primary to-accent text-primary-foreground flex size-[38px] items-center justify-center rounded-[11px] bg-linear-to-br text-[18px] font-bold shadow-lg">
        I
      </div>
    </div>
  )
}

/** Two-pane layout: fixed brand showcase (hidden < lg) + centered auth column. */
export function AuthTwoPane({ showcase, children }: { showcase: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh overflow-hidden">
      {showcase}
      <div className="bg-background relative flex flex-1 items-center justify-center p-6">
        <div className="absolute top-[18px] right-[18px] z-10">
          <ThemeToggle />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-2 w-full max-w-[392px] duration-500">
          {children}
        </div>
      </div>
    </div>
  )
}

/** Centered glass card on a mesh wash (Account Setup / Session Expired). */
export function AuthCentered({
  children,
  footer,
  maxWidthClassName = 'max-w-[412px]',
}: {
  children: ReactNode
  footer?: ReactNode
  maxWidthClassName?: string
}) {
  return (
    <div className="bg-background relative flex min-h-dvh items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'var(--mesh)' }}
      />
      <div className="absolute top-[18px] right-[18px] z-10">
        <ThemeToggle />
      </div>
      <div
        className={cn(
          'animate-in fade-in slide-in-from-bottom-2 relative w-full duration-300',
          maxWidthClassName,
        )}
      >
        <div className="border-glass-border bg-glass rounded-[18px] border p-8 shadow-lg backdrop-blur-xl">
          {children}
        </div>
        {footer && (
          <div className="text-muted-foreground mt-4 text-center text-[12px]">{footer}</div>
        )}
      </div>
    </div>
  )
}

export interface ShowcaseProof {
  icon: ReactNode
  title: string
  desc: string
}

/** The fixed brand marketing pane. `trust` is the card slot at the bottom. */
export function AuthShowcase({
  headline,
  subtitle,
  proofs,
  trust,
}: {
  headline: string
  subtitle: string
  proofs: ShowcaseProof[]
  trust: ReactNode
}) {
  return (
    <div
      className="relative hidden max-w-[660px] flex-[0_0_46%] flex-col overflow-hidden p-11 px-12 text-white lg:flex [&_svg]:size-[18px]"
      style={{ backgroundImage: 'var(--login-hero)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(46% 60% at 84% -6%, rgba(255,255,255,0.20) 0%, transparent 55%), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.11) 1px, transparent 0)',
          backgroundSize: 'auto, 22px 22px',
        }}
      />
      <div className="relative flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-[11px] border border-white/25 bg-white/15 text-[18px] font-bold backdrop-blur-sm">
          I
        </div>
        <span className="text-base font-semibold tracking-[-0.01em]">Interloid</span>
        <span className="ml-0.5 rounded-full border border-white/20 bg-white/10 px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-white/70">
          WORKFORCE SUITE
        </span>
      </div>

      <div className="relative flex max-w-[430px] flex-1 flex-col justify-center">
        <h1 className="text-[32px] leading-[1.15] font-semibold tracking-[-0.025em] text-balance">
          {headline}
        </h1>
        <p className="mt-4 text-[14.5px] leading-[1.6] text-white/[0.78]">{subtitle}</p>

        <div className="mt-8 flex flex-col gap-[15px]">
          {proofs.map((proof) => (
            <div key={proof.title} className="flex items-start gap-3.5">
              <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] border border-white/20 bg-white/[0.13] backdrop-blur-sm">
                {proof.icon}
              </span>
              <div>
                <div className="text-sm font-semibold">{proof.title}</div>
                <div className="mt-px text-[12.5px] text-white/[0.68]">{proof.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {trust}
    </div>
  )
}

/** Generic glass trust card (icon + title + desc) for the showcase footer. */
export function ShowcaseTrust({ icon, title, desc }: ShowcaseProof) {
  return (
    <div className="relative flex items-center gap-3 rounded-[15px] border border-white/20 bg-white/[0.11] px-[17px] py-[15px] backdrop-blur-md">
      <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] border border-white/20 bg-white/[0.14]">
        {icon}
      </span>
      <div className="flex-1">
        <div className="text-[13.5px] font-semibold">{title}</div>
        <div className="text-[12px] text-white/[0.68]">{desc}</div>
      </div>
    </div>
  )
}
