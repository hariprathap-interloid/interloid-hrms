import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Clock, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { paths } from '@/config/paths'
import { cn } from '@/lib/utils'
import { useAuth } from '../use-auth'
import { DEFAULT_DEMO_USER } from '../demo-users'

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

/** Re-authenticate an expired session (default), or the locked-out variant. */
export function SessionExpiredCard({ variant = 'expired' }: { variant?: 'expired' | 'locked' }) {
  const navigate = useNavigate()
  const { user, signIn, signOut } = useAuth()

  const [pw, setPw] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [lockIn, setLockIn] = useState(294)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (variant !== 'locked') return
    const id = setInterval(() => setLockIn((l) => Math.max(0, l - 1)), 1000)
    return () => clearInterval(id)
  }, [variant])
  useEffect(() => () => clearTimeout(timer.current), [])

  const account = user ?? DEFAULT_DEMO_USER

  const submit = () => {
    if (state === 'loading' || state === 'success') return
    if (pw.length < 6) {
      setState('error')
      return
    }
    setState('loading')
    timer.current = setTimeout(() => {
      setState('success')
      signIn(account)
      timer.current = setTimeout(() => void navigate(paths.dashboard.getHref()), 700)
    }, 950)
  }

  const switchAccount = () => {
    signOut()
    void navigate(paths.login.getHref())
  }

  if (variant === 'locked') {
    const unlocked = lockIn === 0
    return (
      <div className="animate-in fade-in flex flex-col items-center text-center duration-300">
        <div className="bg-destructive-subtle text-destructive mb-[18px] flex size-14 items-center justify-center rounded-full [&_svg]:size-[26px]">
          <Lock />
        </div>
        <div className="text-foreground mb-1.5 text-[20px] font-semibold tracking-[-0.01em]">
          Account temporarily locked
        </div>
        <div className="text-muted-foreground mx-auto max-w-[300px] text-[13px] leading-[1.6]">
          Too many failed sign-in attempts. You can try again when the timer ends, or reset your
          password now.
        </div>
        <div className="border-warning-subtle-foreground bg-warning-subtle mt-5 inline-flex items-center gap-2.5 rounded-[12px] border px-5 py-3">
          <Clock className="text-warning-subtle-foreground size-[17px]" />
          <span className="text-warning-subtle-foreground font-mono text-[18px] font-semibold">
            {Math.floor(lockIn / 60)}:{String(lockIn % 60).padStart(2, '0')}
          </span>
        </div>
        <Button
          asChild={unlocked}
          className="mt-5 h-[46px] w-full rounded-[11px] text-sm"
          disabled={!unlocked}
        >
          {unlocked ? (
            <Link to={paths.login.getHref()}>Try signing in again</Link>
          ) : (
            <span>Locked — please wait</span>
          )}
        </Button>
        <div className="mt-4 text-[13px]">
          <Link to={paths.forgotPassword.getHref()} className="text-primary hover:underline">
            Reset password instead
          </Link>
        </div>
      </div>
    )
  }

  const busy = state === 'loading'
  const done = state === 'success'

  return (
    <div>
      <div className="mb-[22px] flex flex-col items-center text-center">
        <div className="bg-primary-bg text-primary mb-4 flex size-14 items-center justify-center rounded-full [&_svg]:size-[26px]">
          <Lock />
        </div>
        <div className="text-foreground text-[20px] font-semibold tracking-[-0.01em]">
          Your session has expired
        </div>
        <div className="text-muted-foreground mt-1 max-w-[300px] text-[13px]">
          For your security, you were signed out after 8 hours of inactivity. Enter your password to
          pick up where you left off.
        </div>
      </div>

      <div className="bg-muted mb-4 flex items-center gap-2.5 rounded-[11px] px-3.5 py-2.5">
        <span className="from-primary to-brand-accent text-primary-foreground flex size-[34px] shrink-0 items-center justify-center rounded-full bg-linear-to-br text-[13px] font-semibold">
          {initialsOf(account.name)}
        </span>
        <div className="min-w-0">
          <div className="text-foreground text-[13px] font-semibold">{account.name}</div>
          <div className="text-muted-foreground truncate font-mono text-[12px]">
            {account.email}
          </div>
        </div>
      </div>

      <div className="mb-2">
        <Label htmlFor="session-password" className="mb-1.5 block text-[13px]">
          Password
        </Label>
        <Input
          id="session-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={pw}
          onChange={(event) => {
            setPw(event.target.value)
            if (state === 'error') setState('idle')
          }}
          aria-invalid={state === 'error' || undefined}
          className={cn(
            'aria-invalid:bg-destructive-subtle h-11 rounded-[11px] border-[1.5px] px-3.5 text-sm',
            state === 'error' && 'iws-shake',
          )}
        />
        {state === 'error' && (
          <p className="text-destructive-subtle-foreground mt-1.5 text-[12px]">
            That password didn&rsquo;t match. Try again or reset it.
          </p>
        )}
      </div>

      <Button
        className="mt-2.5 h-[46px] w-full gap-2 rounded-[11px] text-sm"
        onClick={submit}
        disabled={pw.length < 6 || busy || done}
        aria-busy={busy}
      >
        {busy && <Loader2 className="animate-spin" />}
        {done && <Check />}
        {done ? 'Signed in — redirecting…' : busy ? 'Signing in…' : 'Continue'}
      </Button>

      <div className="mt-4 text-center text-[13px]">
        <button type="button" onClick={switchAccount} className="text-primary hover:underline">
          Not you? Use a different account
        </button>
      </div>
    </div>
  )
}
