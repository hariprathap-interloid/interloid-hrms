import { createContext, use, type ReactNode } from 'react'

/* ---------------------------------------------------------------------------
 * Confirm dialog seam — the standard destructive-action confirmation (States &
 * Components spec, project 8f1502f5: "Confirm AlertDialog"). Imperative API so
 * any call site (a row ⋯ menu item, a bulk button, a Cancel button) can trigger
 * it with one line: `confirm({ title, description, onConfirm })`. The provider
 * renders a single dialog and runs `onConfirm` behind the spec's busy state.
 * ------------------------------------------------------------------------- */

export type ConfirmTone = 'destructive' | 'warning'

export interface ConfirmOptions {
  title: ReactNode
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** Confirm-button + icon severity. destructive (delete/cancel) or warning (lock). */
  tone?: ConfirmTone
  /** Icon for the tinted tile; defaults per tone. */
  icon?: ReactNode
  /** Runs while the confirm button shows "Working…"; the dialog closes when it resolves. */
  onConfirm: () => void | Promise<void>
}

export type ConfirmFn = (options: ConfirmOptions) => void

export const ConfirmContext = createContext<ConfirmFn | null>(null)

export function useConfirm(): ConfirmFn {
  const confirm = use(ConfirmContext)
  if (!confirm) throw new Error('useConfirm must be used within a ConfirmProvider')
  return confirm
}
