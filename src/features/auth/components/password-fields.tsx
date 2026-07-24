import { useState } from 'react'
import { Check, Eye, EyeOff, Minus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { meterFill, type PasswordRule } from '../password-utils'

/** Password field styled to the auth-screen spec, with an optional show/hide eye. */
export function PasswordInput({
  showToggle = false,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, 'type'> & { showToggle?: boolean }) {
  const [show, setShow] = useState(false)
  const base = 'h-11 rounded-[11px] border-[1.5px] text-sm aria-invalid:bg-destructive-subtle'

  if (!showToggle) {
    return <Input type="password" className={cn(base, 'px-3.5', className)} {...props} />
  }

  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        className={cn(base, 'pr-11 pl-3.5', className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((value) => !value)}
        aria-label="Toggle password visibility"
        className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg"
      >
        {show ? <EyeOff className="size-[17px]" /> : <Eye className="size-[17px]" />}
      </button>
    </div>
  )
}

/** 2×2 checklist of the password requirements. */
export function PasswordRules({ rules }: { rules: PasswordRule[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
      {rules.map((rule) => (
        <div
          key={rule.label}
          className={cn(
            'flex items-center gap-1.5 text-[12px]',
            rule.ok ? 'text-success-subtle-foreground' : 'text-muted-foreground',
          )}
        >
          {rule.ok ? <Check className="size-3" /> : <Minus className="size-3" />}
          {rule.label}
        </div>
      ))}
    </div>
  )
}

/** Four-segment strength meter; filled bars take the score's color. */
export function StrengthMeter({ score }: { score: number }) {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors',
            index < score ? meterFill(score) : 'bg-muted',
          )}
        />
      ))}
    </div>
  )
}
