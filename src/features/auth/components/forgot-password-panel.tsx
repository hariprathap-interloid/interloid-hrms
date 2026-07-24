import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { paths } from '@/config/paths'
import { AuthBrandMark } from './auth-shell'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPasswordPanel() {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [resendIn, setResendIn] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!sent) return
    const id = setInterval(() => setResendIn((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(id)
  }, [sent])
  useEffect(() => () => clearTimeout(timer.current), [])

  const emailError = EMAIL_RE.test(email) ? '' : 'Enter a valid email address.'
  const maskedEmail =
    email && email.includes('@') ? `${email[0]}•••@${email.split('@')[1]}` : 'y•••@interloid.io'

  const submit = () => {
    if (sending) return
    if (emailError) {
      setTouched(true)
      return
    }
    setSending(true)
    timer.current = setTimeout(() => {
      setSending(false)
      setSent(true)
      setResendIn(30)
    }, 900)
  }

  return (
    <div>
      <AuthBrandMark className="mb-[22px]" />

      {sent ? (
        <div className="animate-in fade-in text-center duration-300">
          <div className="bg-success-subtle text-success mx-auto mb-[18px] flex size-14 items-center justify-center rounded-full [&_svg]:size-[26px]">
            <Mail />
          </div>
          <div className="text-foreground text-[19px] font-semibold">Check your inbox</div>
          <div className="text-muted-foreground mt-1.5 text-[13px] leading-[1.6]">
            If an account matches
            <br />
            <span className="text-foreground font-mono font-medium">{maskedEmail}</span>
            <br />
            we&rsquo;ve sent a reset link. It expires in 30 minutes.
          </div>
          <div className="text-muted-foreground mt-5 text-[13px]">
            Didn&rsquo;t get it?{' '}
            {resendIn > 0 ? (
              <span>Resend in {resendIn}s</span>
            ) : (
              <button
                type="button"
                onClick={() => setResendIn(30)}
                className="text-primary font-medium"
              >
                Resend
              </button>
            )}{' '}
            ·{' '}
            <button
              type="button"
              onClick={() => {
                setSent(false)
                setEmail('')
                setTouched(false)
              }}
              className="text-primary font-medium"
            >
              Try a different email
            </button>
          </div>
          <div className="mt-4 text-[13px]">
            <Link to={paths.login.getHref()} className="text-primary hover:underline">
              ← Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-[22px]">
            <div className="text-foreground text-[22px] font-semibold tracking-[-0.02em]">
              Forgot your password?
            </div>
            <div className="text-muted-foreground mt-1 text-[13.5px]">
              Enter your work email and we&rsquo;ll send a reset link.
            </div>
          </div>
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
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={(touched && Boolean(emailError)) || undefined}
              className="aria-invalid:bg-destructive-subtle h-11 rounded-[11px] border-[1.5px] px-3.5 text-sm"
            />
            {touched && emailError && (
              <p className="text-destructive-subtle-foreground mt-1.5 text-[12px]">{emailError}</p>
            )}
          </div>
          <Button
            className="mt-1.5 h-[46px] w-full gap-2 rounded-[11px] text-sm"
            onClick={submit}
            disabled={Boolean(emailError) || sending}
            aria-busy={sending}
          >
            {sending && <Loader2 className="animate-spin" />}
            {sending ? 'Sending…' : 'Send reset link'}
          </Button>
          <div className="mt-[18px] text-center text-[13px]">
            <Link to={paths.login.getHref()} className="text-primary hover:underline">
              ← Back to sign in
            </Link>
          </div>
        </div>
      )}

      <p className="text-muted-foreground mt-[22px] text-center text-[12px]">
        If the email exists, a reset link is sent · SOC 2 Type II
      </p>
    </div>
  )
}
