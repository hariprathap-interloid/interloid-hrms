import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { paths } from '@/config/paths'
import { passwordRules } from '../password-utils'
import { PasswordRules } from './password-fields'

// Invited-employee details — hardcoded demo data (a real flow reads the invite token).
const INVITE = { name: 'Diya Sharma', email: 'diya.sharma@interloid.io', empId: 'ITL-0187' }
const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function AccountSetupPanel() {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [terms, setTerms] = useState(false)
  const [touched, setTouched] = useState<{ pw?: boolean; pw2?: boolean }>({})
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const rules = passwordRules(pw)
  const score = rules.filter((r) => r.ok).length
  const mismatch = Boolean(touched.pw2) && pw2 !== '' && pw2 !== pw
  const valid = score === 4 && pw2 === pw && pw2 !== '' && terms

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

  const brandTile = (
    <div className="from-primary to-accent text-primary-foreground mb-4 flex size-[46px] items-center justify-center rounded-[13px] bg-linear-to-br text-[22px] font-bold shadow-lg">
      I
    </div>
  )

  if (done) {
    return (
      <div className="animate-in fade-in flex flex-col items-center py-3.5 text-center duration-300">
        <div className="bg-success-subtle text-success mb-[18px] flex size-14 items-center justify-center rounded-full [&_svg]:size-7">
          <Check strokeWidth={2.5} />
        </div>
        <div className="text-foreground mb-1.5 text-[18px] font-semibold">
          You&rsquo;re all set, {INVITE.name.split(' ')[0]}
        </div>
        <div className="text-muted-foreground text-[13px]">
          Your account is active. Sign in to get started.
        </div>
        <Button asChild className="mt-5 h-[46px] w-full rounded-[11px] text-sm">
          <Link to={paths.login.getHref()}>Go to sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-[22px] flex flex-col items-center text-center">
        {brandTile}
        <div className="text-foreground text-[20px] font-semibold tracking-[-0.01em]">
          Set up your account
        </div>
        <div className="text-muted-foreground mt-1 max-w-[310px] text-[13px]">
          You&rsquo;ve been invited to Interloid Workforce Suite. Create a password to activate your
          account.
        </div>
      </div>

      <div className="bg-muted mb-[18px] flex items-center gap-2.5 rounded-[11px] px-3.5 py-2.5">
        <span className="bg-primary-bg text-primary flex size-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-semibold">
          {initialsOf(INVITE.name)}
        </span>
        <div className="min-w-0">
          <div className="text-foreground text-[13px] font-semibold">{INVITE.name}</div>
          <div className="text-muted-foreground truncate font-mono text-[12px]">{INVITE.email}</div>
        </div>
        <div className="flex-1" />
        <span className="text-muted-foreground font-mono text-[11px] font-semibold">
          {INVITE.empId}
        </span>
      </div>

      <div className="mb-3.5">
        <Label htmlFor="create-password" className="mb-1.5 block text-[13px]">
          Create password
        </Label>
        <Input
          id="create-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={pw}
          onChange={(event) => setPw(event.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, pw: true }))}
          aria-invalid={(touched.pw && score < 4) || undefined}
          className="aria-invalid:bg-destructive-subtle h-11 rounded-[11px] border-[1.5px] px-3.5 text-sm"
        />
        <div className="mt-2.5">
          <PasswordRules rules={rules} />
        </div>
      </div>

      <div className="mb-3.5">
        <Label htmlFor="confirm-password" className="mb-1.5 block text-[13px]">
          Confirm password
        </Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={pw2}
          onChange={(event) => setPw2(event.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, pw2: true }))}
          aria-invalid={mismatch || undefined}
          className="aria-invalid:bg-destructive-subtle h-11 rounded-[11px] border-[1.5px] px-3.5 text-sm"
        />
        {mismatch && (
          <p className="text-destructive-subtle-foreground mt-1.5 text-[12px]">
            Passwords don&rsquo;t match.
          </p>
        )}
      </div>

      <label className="text-muted-foreground mb-1.5 flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-[1.5]">
        <Checkbox
          checked={terms}
          onCheckedChange={(value) => setTerms(value === true)}
          className="mt-0.5"
        />
        <span>
          I accept the{' '}
          <button type="button" className="text-primary font-medium hover:underline">
            acceptable-use policy
          </button>{' '}
          and consent to attendance &amp; leave data processing.
        </span>
      </label>

      <Button
        className="mt-3 h-[46px] w-full gap-2 rounded-[11px] text-sm"
        onClick={submit}
        disabled={!valid || saving}
        aria-busy={saving}
      >
        {saving && <Loader2 className="animate-spin" />}
        {saving ? 'Activating…' : 'Activate account'}
      </Button>
    </div>
  )
}
