import { CalendarCheck2, Clock, Sparkles } from 'lucide-react'
import { AuthShowcase, type ShowcaseProof } from './auth-shell'

const PROOFS: ShowcaseProof[] = [
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

/** Login's live "trust card" — a pinging presence stat + an avatar stack. */
function LoginTrust() {
  return (
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
  )
}

export function LoginShowcase() {
  return (
    <AuthShowcase
      headline="The workforce OS your team actually opens every morning."
      subtitle="Attendance, leave, and payroll in one fast, AI-assisted place — for employees, team leads, HR and admins."
      proofs={PROOFS}
      trust={<LoginTrust />}
    />
  )
}
