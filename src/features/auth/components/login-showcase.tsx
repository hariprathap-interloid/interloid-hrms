import type { ReactNode } from 'react'
import { CalendarCheck2, Clock, Sparkles } from 'lucide-react'

/* ---------------------------------------------------------------------------
 * LoginShowcase — the marketing panel beside the auth column. A fixed brand
 * surface (indigo→sky, identical in both themes; gradient lives in the
 * `--login-hero` token), so on-surface content uses white / white-opacity
 * utilities rather than themeable tokens. Hidden below `lg`.
 * ------------------------------------------------------------------------- */

interface Proof {
  icon: ReactNode
  title: string
  desc: string
}

const PROOFS: Proof[] = [
  {
    icon: <Clock />,
    title: 'Real-time attendance',
    desc: 'Biometric + Entra sync, zero manual entry',
  },
  {
    icon: <CalendarCheck2 />,
    title: 'Leave in two clicks',
    desc: 'Balances, approvals and holidays in one flow',
  },
  {
    icon: <Sparkles />,
    title: 'AI that watches for you',
    desc: 'Anomalies, risks and nudges surfaced early',
  },
]

const STACK = [
  { initials: 'PN', className: 'bg-chart-1' },
  { initials: 'DS', className: 'bg-chart-2' },
  { initials: 'AR', className: 'bg-chart-3' },
  { initials: '+5', className: 'bg-white/25' },
]

export function LoginShowcase() {
  return (
    <div
      className="relative hidden max-w-[660px] flex-[0_0_46%] flex-col overflow-hidden p-11 px-12 text-white lg:flex [&_svg]:size-[18px]"
      style={{ backgroundImage: 'var(--login-hero)' }}
    >
      {/* radial highlight + dot-grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(46% 60% at 84% -6%, rgba(255,255,255,0.20) 0%, transparent 55%), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.11) 1px, transparent 0)',
          backgroundSize: 'auto, 22px 22px',
        }}
      />

      {/* brand lockup */}
      <div className="relative flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-[11px] border border-white/25 bg-white/15 text-[18px] font-bold backdrop-blur-sm">
          I
        </div>
        <span className="text-base font-semibold tracking-[-0.01em]">Interloid</span>
        <span className="ml-0.5 rounded-full border border-white/20 bg-white/10 px-2 py-[3px] text-[11px] font-semibold tracking-[0.04em] text-white/70">
          WORKFORCE SUITE
        </span>
      </div>

      {/* headline + proofs */}
      <div className="relative flex max-w-[430px] flex-1 flex-col justify-center">
        <h1 className="text-[32px] leading-[1.15] font-semibold tracking-[-0.025em] text-balance">
          The workforce OS your team actually opens every morning.
        </h1>
        <p className="mt-4 text-[14.5px] leading-[1.6] text-white/[0.78]">
          Attendance, leave, and payroll in one fast, AI-assisted place — for employees, team leads,
          HR and admins.
        </p>

        <div className="mt-8 flex flex-col gap-[15px]">
          {PROOFS.map((proof) => (
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

      {/* live trust card */}
      <div className="relative flex items-center gap-3.5 rounded-[15px] border border-white/20 bg-white/[0.11] px-[17px] py-[15px] backdrop-blur-md">
        <span className="relative mx-0.5 flex size-[9px] shrink-0">
          <span className="bg-success absolute inset-0 animate-ping rounded-full" />
          <span className="bg-success relative size-[9px] rounded-full" />
        </span>
        <div className="flex-1">
          <div className="text-[13.5px] font-semibold">231 of 248 present right now</div>
          <div className="text-[12px] text-white/[0.68]">
            93.1% attendance · live across 6 departments
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          {STACK.map((person, index) => (
            <span
              key={person.initials}
              className={`flex size-[30px] items-center justify-center rounded-full border-2 border-white/15 text-[10.5px] font-semibold text-white ${person.className} ${index > 0 ? '-ml-2' : ''}`}
            >
              {person.initials}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
