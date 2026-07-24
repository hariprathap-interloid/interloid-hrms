import type { ClipboardEvent, KeyboardEvent } from 'react'
import { useRef } from 'react'
import { Input } from '@/components/ui/input'

/* Six-box numeric one-time-code input, composed from the shadcn Input. Handles
   auto-advance, backspace-to-previous, and paste. Error state rides the Input's
   `aria-invalid` (destructive border + ring) plus a destructive-subtle tint. */

interface OtpInputProps {
  /** Controlled digits, length 6. */
  value: string[]
  onChange: (next: string[]) => void
  /** Fired when all six boxes are filled. */
  onComplete?: (code: string) => void
  disabled?: boolean
  invalid?: boolean
}

const LENGTH = 6
const BOX_KEYS = Array.from({ length: LENGTH }, (_, i) => `otp-${i}`)

export function OtpInput({ value, onChange, onComplete, disabled, invalid }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const commit = (next: string[]) => {
    onChange(next)
    if (next.every((digit) => digit !== '')) onComplete?.(next.join(''))
  }

  const setDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const next = [...value]
    next[index] = digit
    commit(next)
    if (digit && index < LENGTH - 1) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      const next = [...value]
      next[index - 1] = ''
      onChange(next)
      refs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus()
    if (event.key === 'ArrowRight' && index < LENGTH - 1) refs.current[index + 1]?.focus()
  }

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const digits = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, LENGTH - index)
    if (!digits) return
    const next = [...value]
    for (let i = 0; i < digits.length; i++) next[index + i] = digits[i] as string
    commit(next)
    refs.current[Math.min(index + digits.length, LENGTH - 1)]?.focus()
  }

  return (
    <div className="grid grid-cols-6 gap-2">
      {BOX_KEYS.map((key, index) => (
        <Input
          key={key}
          ref={(node) => {
            refs.current[index] = node
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-label={`Digit ${index + 1}`}
          value={value[index] ?? ''}
          onChange={(event) => setDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          className="aria-invalid:bg-destructive-subtle h-[54px] rounded-[11px] px-0 text-center font-mono text-[22px] font-semibold"
        />
      ))}
    </div>
  )
}
