export interface PasswordRule {
  label: string
  ok: boolean
}

/** The four strength requirements shown as a checklist. */
export function passwordRules(pw: string): PasswordRule[] {
  return [
    { label: '8+ characters', ok: pw.length >= 8 },
    { label: 'One uppercase', ok: /[A-Z]/.test(pw) },
    { label: 'One number', ok: /\d/.test(pw) },
    { label: 'One symbol', ok: /[^A-Za-z0-9]/.test(pw) },
  ]
}

export function passwordScore(pw: string): number {
  return passwordRules(pw).filter((rule) => rule.ok).length
}

const STRENGTH = [
  { label: 'Enter a password', className: 'text-muted-foreground' },
  { label: 'Weak', className: 'text-destructive-subtle-foreground' },
  { label: 'Fair', className: 'text-warning-subtle-foreground' },
  { label: 'Good', className: 'text-warning-subtle-foreground' },
  { label: 'Strong', className: 'text-success-subtle-foreground' },
] as const

/** Label + text color for the current password strength. */
export function strengthLabel(pw: string): { label: string; className: string } {
  return STRENGTH[pw === '' ? 0 : passwordScore(pw)] ?? STRENGTH[0]
}

/** Fill color for the meter bars at a given score (1–4). */
export function meterFill(score: number): string {
  return ['bg-destructive', 'bg-warning', 'bg-warning', 'bg-success'][
    Math.max(0, score - 1)
  ] as string
}
