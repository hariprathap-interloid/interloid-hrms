import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Check, ChevronLeft, Clock, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { paths } from '@/config/paths'
import { cn } from '@/lib/utils'
import { useAuth } from '../use-auth'
import {
  DEFAULT_DEMO_USER,
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  resolveUser,
  type DemoUser,
} from '../demo-users'
import { AuthBrandMark } from './auth-shell'
import { OtpInput } from './otp-input'

type Step = 'signin' | 'mfa' | 'done'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEMO_CODE = '123456'
const emptyCode = () => Array<string>(6).fill('')

/** The four-square Microsoft mark (brand asset, inlined per the design). */
function MicrosoftLogo() {
  return (
    <svg width="17" height="17" viewBox="0 0 23 23" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  )
}

export function LoginPanel() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [step, setStep] = useState<Step>('signin')
  const [ssoLoading, setSsoLoading] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})
  const [emailLoading, setEmailLoading] = useState(false)
  const [pendingUser, setPendingUser] = useState<DemoUser | null>(null)
  const [credError, setCredError] = useState('')
  const [code, setCode] = useState<string[]>(emptyCode)
  const [mfaState, setMfaState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [attempts, setAttempts] = useState(0)
  const [resendIn, setResendIn] = useState(0)
  const [lockIn, setLockIn] = useState(0)

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // 1s tick drives the resend cooldown and the lockout countdown.
  useEffect(() => {
    const id = setInterval(() => {
      setResendIn((r) => Math.max(0, r - 1))
      setLockIn((l) => {
        const next = Math.max(0, l - 1)
        if (l > 0 && next === 0) {
          setAttempts(0)
          setMfaState('idle')
          setCode(emptyCode())
        }
        return next
      })
    }, 1000)
    return () => {
      clearInterval(id)
      clearTimeout(timer.current)
    }
  }, [])

  const emailError = EMAIL_RE.test(email) ? '' : 'Enter a valid email address.'
  const passwordError = password.length >= 6 ? '' : 'Password must be at least 6 characters.'
  const credentialsValid = !emailError && !passwordError
  const codeFull = code.every((digit) => digit !== '')
  const locked = lockIn > 0

  const goToMfa = () => {
    setStep('mfa')
    setSsoLoading(false)
    setEmailLoading(false)
    setResendIn(30)
    setAttempts(0)
    setLockIn(0)
    setMfaState('idle')
    setCode(emptyCode())
  }

  const startSso = () => {
    if (ssoLoading) return
    setPendingUser(DEFAULT_DEMO_USER) // SSO signs in as the default demo persona
    setSsoLoading(true)
    timer.current = setTimeout(goToMfa, 1500)
  }

  const submitEmail = () => {
    if (emailLoading) return
    if (!credentialsValid) {
      setTouched({ email: true, password: true })
      return
    }
    // Resolve the persona through the seam (demo-users → resolveUser) and check
    // the shared demo password. A real API call replaces exactly this block.
    const resolved = resolveUser(email)
    if (!resolved || password !== DEMO_PASSWORD) {
      setCredError('Those credentials don’t match a demo account.')
      return
    }
    setCredError('')
    setPendingUser(resolved)
    setEmailLoading(true)
    timer.current = setTimeout(goToMfa, 1000)
  }

  const verify = (fullCode: string) => {
    if (mfaState === 'loading' || locked || fullCode.length < 6) return
    setMfaState('loading')
    timer.current = setTimeout(() => {
      if (fullCode === DEMO_CODE) {
        signIn(pendingUser ?? DEFAULT_DEMO_USER)
        setStep('done')
        timer.current = setTimeout(() => void navigate(paths.dashboard.getHref()), 1100)
        return
      }
      const nextAttempts = attempts + 1
      setAttempts(nextAttempts)
      setMfaState('error')
      setCode(emptyCode())
      if (nextAttempts >= 3) setLockIn(30)
    }, 850)
  }

  const resend = () => {
    if (resendIn > 0) return
    setResendIn(30)
    setAttempts(0)
    setMfaState('idle')
    setCode(emptyCode())
  }

  const back = () => {
    setStep('signin')
    setMfaState('idle')
    setAttempts(0)
    setLockIn(0)
    setCode(emptyCode())
  }

  const title =
    step === 'mfa' ? 'Verify it’s you' : step === 'done' ? 'Welcome back' : 'Sign in to Interloid'
  const subtitle =
    step === 'mfa'
      ? 'One more step to keep your account secure'
      : step === 'done'
        ? ''
        : 'Use your work account to continue'

  const maskedEmail =
    email && email.includes('@') ? `${email[0]}•••@${email.split('@')[1]}` : 'a•••@interloid.io'
  const attemptsLeft = 3 - attempts
  const lockClock = `${Math.floor(lockIn / 60)}:${String(lockIn % 60).padStart(2, '0')}`

  return (
    <div>
      <AuthBrandMark className="mb-[22px]" />

      <div className="mb-[22px]">
        <div className="text-foreground text-[22px] font-semibold tracking-[-0.02em]">{title}</div>
        {subtitle && <div className="text-muted-foreground mt-1 text-[13.5px]">{subtitle}</div>}
      </div>

      {step === 'signin' && (
        <div>
          <Button
            variant="sso"
            className="h-[46px] w-full gap-3 rounded-[11px] text-sm"
            onClick={startSso}
            disabled={ssoLoading}
            aria-busy={ssoLoading}
          >
            {ssoLoading ? <Loader2 className="animate-spin" /> : <MicrosoftLogo />}
            {ssoLoading ? 'Signing in…' : 'Sign in with Microsoft'}
          </Button>
          <p className="text-muted-foreground mt-2.5 text-center text-[12px]">
            Single sign-on with your Microsoft Entra ID
          </p>

          <div className="my-5 flex items-center gap-3">
            <div className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-[12px]">or</span>
            <div className="bg-border h-px flex-1" />
          </div>

          {!emailOpen ? (
            <Button
              variant="outline"
              className="h-11 w-full gap-2 rounded-[11px] text-sm font-medium"
              onClick={() => setEmailOpen(true)}
            >
              <Mail />
              Sign in with email
            </Button>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="mb-3.5">
                <Label htmlFor="email" className="mb-1.5 block text-[13px]">
                  Work email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@interloid.io"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (credError) setCredError('')
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={(touched.email && Boolean(emailError)) || undefined}
                  className="aria-invalid:bg-destructive-subtle h-11 rounded-[11px] border-[1.5px] px-3.5 text-sm"
                />
                {touched.email && emailError && (
                  <p className="text-destructive-subtle-foreground mt-1.5 text-[12px]">
                    {emailError}
                  </p>
                )}
              </div>
              <div className="mb-2">
                <div className="mb-1.5 flex items-center justify-between">
                  <Label htmlFor="password" className="text-[13px]">
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-primary text-[12px] font-medium"
                    onClick={() => void navigate(paths.forgotPassword.getHref())}
                  >
                    Forgot?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (credError) setCredError('')
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  aria-invalid={(touched.password && Boolean(passwordError)) || undefined}
                  className="aria-invalid:bg-destructive-subtle h-11 rounded-[11px] border-[1.5px] px-3.5 text-sm"
                />
                {touched.password && passwordError && (
                  <p className="text-destructive-subtle-foreground mt-1.5 text-[12px]">
                    {passwordError}
                  </p>
                )}
              </div>
              <Button
                className="mt-2.5 h-[46px] w-full gap-2 rounded-[11px] text-sm"
                onClick={submitEmail}
                disabled={!credentialsValid || emailLoading}
                aria-busy={emailLoading}
              >
                {emailLoading && <Loader2 className="animate-spin" />}
                {emailLoading ? 'Signing in…' : 'Sign in'}
              </Button>
              {credError && (
                <div className="iws-shake border-destructive bg-destructive-subtle mt-3 flex items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5">
                  <AlertCircle className="text-destructive size-4 shrink-0" />
                  <p className="text-destructive-subtle-foreground text-[12.5px]">{credError}</p>
                </div>
              )}
            </div>
          )}

          {/* Dev-only: surfaces demo credentials for role testing. Gated to
              import.meta.env.DEV so a production build never exposes them. */}
          {import.meta.env.DEV && (
            <div className="border-border bg-muted/40 mt-5 rounded-[10px] border px-3.5 py-3">
              <div className="text-muted-foreground mb-2 text-[10.5px] font-semibold tracking-[0.05em] uppercase">
                Demo accounts
              </div>
              <div className="flex flex-col gap-1">
                {DEMO_ACCOUNTS.map((account) => (
                  <div
                    key={account.email}
                    className="flex items-center justify-between gap-3 text-[12px]"
                  >
                    <span className="text-foreground font-mono">{account.email}</span>
                    <span className="text-muted-foreground">{account.title}</span>
                  </div>
                ))}
              </div>
              <div className="text-muted-foreground mt-2.5 text-[11.5px]">
                Password <span className="text-foreground font-mono">{DEMO_PASSWORD}</span> · MFA
                code <span className="text-foreground font-mono">123456</span>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'mfa' && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground mb-3.5 h-auto gap-1.5 px-0 text-[13px] hover:bg-transparent"
            onClick={back}
          >
            <ChevronLeft />
            Back
          </Button>
          <p className="text-muted-foreground mb-[22px] text-[13px]">
            Enter the 6-digit code sent to{' '}
            <span className="text-foreground font-mono font-medium">{maskedEmail}</span>
          </p>

          <OtpInput
            value={code}
            onChange={(next) => {
              setCode(next)
              if (mfaState === 'error') setMfaState('idle')
            }}
            onComplete={verify}
            disabled={locked}
            invalid={mfaState === 'error' && !locked}
          />

          {mfaState === 'error' && !locked && (
            <div className="iws-shake border-destructive bg-destructive-subtle mt-3.5 flex items-center gap-2.5 rounded-[10px] border px-3.5 py-3">
              <AlertCircle className="text-destructive size-4 shrink-0" />
              <p className="text-destructive-subtle-foreground text-[12.5px]">
                That code didn’t match.{' '}
                {attemptsLeft > 0
                  ? `${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} left.`
                  : 'Account temporarily locked.'}
              </p>
            </div>
          )}
          {locked && (
            <div className="border-warning-subtle-foreground bg-warning-subtle mt-3.5 flex items-center gap-2.5 rounded-[10px] border px-3.5 py-3">
              <Clock className="text-warning-subtle-foreground size-4 shrink-0" />
              <p className="text-warning-subtle-foreground text-[12.5px]">
                <strong className="font-semibold">Too many attempts.</strong> Try again in{' '}
                {lockClock}.
              </p>
            </div>
          )}

          <Button
            className="mt-3.5 h-[46px] w-full gap-2 rounded-[11px] text-sm"
            onClick={() => verify(code.join(''))}
            disabled={!codeFull || mfaState === 'loading' || locked}
            aria-busy={mfaState === 'loading'}
          >
            {mfaState === 'loading' && <Loader2 className="animate-spin" />}
            {locked ? 'Locked' : mfaState === 'loading' ? 'Verifying…' : 'Verify & continue'}
          </Button>

          <p className="text-muted-foreground mt-4 text-center text-[13px]">
            Didn&rsquo;t get a code?{' '}
            {resendIn > 0 ? (
              <span>Resend in {resendIn}s</span>
            ) : (
              <button type="button" onClick={resend} className="text-primary font-medium">
                Resend
              </button>
            )}
          </p>
        </div>
      )}

      {step === 'done' && (
        <div className="animate-in fade-in py-3.5 text-center duration-300">
          <div className="bg-success-subtle text-success mx-auto mb-[18px] flex size-14 items-center justify-center rounded-full [&_svg]:size-7">
            <Check strokeWidth={2.5} />
          </div>
          <div className="text-foreground mb-1.5 text-[18px] font-semibold">
            You&rsquo;re signed in
          </div>
          <div className="text-muted-foreground text-[13px]">Redirecting to your dashboard…</div>
        </div>
      )}

      <p
        className={cn(
          'text-muted-foreground mt-[22px] text-center text-[12px]',
          step === 'mfa' && 'font-mono',
        )}
      >
        {step === 'mfa'
          ? 'Demo code 123456 · 3 wrong → lockout'
          : 'Protected by Microsoft Entra ID · SOC 2 Type II'}
      </p>
    </div>
  )
}
