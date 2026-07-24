import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, Clock, Loader2, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { paths } from '@/config/paths'
import { cn } from '@/lib/utils'
import { passwordRules, passwordScore, strengthLabel } from '../password-utils'
import { AuthBrandMark } from './auth-shell'
import { PasswordInput, PasswordRules, StrengthMeter } from './password-fields'

const ACCOUNT_EMAIL = 'priya.nair@interloid.io'

export function ResetPasswordPanel() {
  const [searchParams] = useSearchParams()
  const linkExpired = searchParams.get('expired') === '1'

  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [touched, setTouched] = useState<{ pw?: boolean; pw2?: boolean }>({})
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [reqState, setReqState] = useState<'idle' | 'loading' | 'sent'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const rules = passwordRules(pw)
  const score = passwordScore(pw)
  const strength = strengthLabel(pw)
  const mismatch = Boolean(touched.pw2) && pw2 !== '' && pw2 !== pw
  const match = pw2 !== '' && pw2 === pw && score === 4
  const valid = score === 4 && pw2 === pw && pw2 !== ''

  const submit = () => {
    if (saving) return
    if (!valid) {
      setTouched({ pw: true, pw2: true })
      return
    }
    setSaving(true)
    timer.current = setTimeout(() => {
      setSaving(false)
      setDone(true)
    }, 950)
  }

  const requestNew = () => {
    if (reqState !== 'idle') return
    setReqState('loading')
    timer.current = setTimeout(() => setReqState('sent'), 900)
  }

  if (linkExpired && !done) {
    return (
      <div className="text-center">
        <AuthBrandMark className="mb-[22px]" />
        <div className="bg-warning-subtle text-warning-subtle-foreground mx-auto mb-[18px] flex size-14 items-center justify-center rounded-full [&_svg]:size-[26px]">
          <Clock />
        </div>
        <div className="text-foreground text-[19px] font-semibold">This link has expired</div>
        <div className="text-muted-foreground mt-1.5 text-[13px] leading-[1.6]">
          Reset links are valid for 30 minutes.
          <br />
          Request a new one to continue.
        </div>
        <Button
          className={cn(
            'mt-5 h-[46px] w-full gap-2 rounded-[11px] text-sm',
            reqState === 'sent' && 'bg-success hover:bg-success text-white',
          )}
          onClick={requestNew}
          disabled={reqState !== 'idle'}
        >
          {reqState === 'loading' && <Loader2 className="animate-spin" />}
          {reqState === 'sent' && <Check />}
          {reqState === 'loading'
            ? 'Sending…'
            : reqState === 'sent'
              ? 'Link sent'
              : 'Request a new link'}
        </Button>
        <div className="mt-4 text-[13px]">
          <Link to={paths.login.getHref()} className="text-primary hover:underline">
            ← Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="animate-in fade-in py-3.5 text-center duration-300">
        <AuthBrandMark className="mb-[22px]" />
        <div className="bg-success-subtle text-success mx-auto mb-[18px] flex size-14 items-center justify-center rounded-full [&_svg]:size-7">
          <Check strokeWidth={2.5} />
        </div>
        <div className="text-foreground mb-1.5 text-[19px] font-semibold">Password updated</div>
        <div className="text-muted-foreground text-[13px]">
          You can now sign in with your new password. Other sessions have been signed out.
        </div>
        <Button asChild className="mt-5 h-[46px] w-full rounded-[11px] text-sm">
          <Link to={paths.login.getHref()}>Back to sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <AuthBrandMark className="mb-[22px]" />
      <div className="mb-5">
        <div className="text-foreground text-[22px] font-semibold tracking-[-0.02em]">
          Set a new password
        </div>
        <div className="text-muted-foreground mt-1 text-[13.5px]">
          Choose a strong password you haven&rsquo;t used before.
        </div>
      </div>

      <div className="bg-muted mb-[18px] flex items-center gap-2.5 rounded-[10px] px-3.5 py-2.5">
        <UserRound className="text-muted-foreground size-[15px] shrink-0" />
        <span className="text-muted-foreground font-mono text-[12.5px]">{ACCOUNT_EMAIL}</span>
      </div>

      <div className="mb-3.5">
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="new-password" className="text-[13px]">
            New password
          </Label>
          <span
            className={cn(
              'flex items-center gap-1.5 text-[12px] font-semibold',
              strength.className,
            )}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {strength.label}
          </span>
        </div>
        <PasswordInput
          id="new-password"
          showToggle
          autoComplete="new-password"
          placeholder="••••••••"
          value={pw}
          onChange={(event) => setPw(event.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, pw: true }))}
          aria-invalid={(touched.pw && score < 4) || undefined}
        />
        <div className="mt-2.5">
          <StrengthMeter score={score} />
        </div>
        <div className="mt-2.5">
          <PasswordRules rules={rules} />
        </div>
      </div>

      <div className="mb-2">
        <Label htmlFor="confirm-password" className="mb-1.5 block text-[13px]">
          Confirm password
        </Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={pw2}
            onChange={(event) => setPw2(event.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, pw2: true }))}
            aria-invalid={mismatch || undefined}
            className="aria-invalid:bg-destructive-subtle h-11 rounded-[11px] border-[1.5px] pr-11 pl-3.5 text-sm"
          />
          {match && (
            <span className="text-success absolute top-1/2 right-3 -translate-y-1/2">
              <Check className="size-[17px]" />
            </span>
          )}
        </div>
        {mismatch && (
          <p className="text-destructive-subtle-foreground mt-1.5 text-[12px]">
            Passwords don&rsquo;t match.
          </p>
        )}
      </div>

      <Button
        className="mt-2.5 h-[46px] w-full gap-2 rounded-[11px] text-sm"
        onClick={submit}
        disabled={!valid || saving}
        aria-busy={saving}
      >
        {saving && <Loader2 className="animate-spin" />}
        {saving ? 'Updating…' : 'Update password'}
      </Button>

      <p className="text-muted-foreground mt-[22px] text-center text-[12px]">
        Updating your password signs out all other sessions
      </p>
    </div>
  )
}
