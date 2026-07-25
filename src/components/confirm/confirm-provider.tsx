import { useCallback, useState, type ReactNode } from 'react'
import { CircleAlert, Loader2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import {
  ConfirmContext,
  type ConfirmFn,
  type ConfirmOptions,
  type ConfirmTone,
} from './use-confirm'

/* ---------------------------------------------------------------------------
 * ConfirmProvider — renders the single Confirm AlertDialog and exposes the
 * imperative `confirm(...)` via context. Built to the States spec: 430px card
 * panel, r-15, shadow-lg, per-severity tinted icon tile, a destructive/warning
 * confirm button, and a busy state (spinner + "Working…", dismissal blocked)
 * while `onConfirm` runs. Wrap the app once (AppProviders); call `useConfirm()`.
 * ------------------------------------------------------------------------- */

const TONE_TILE: Record<ConfirmTone, string> = {
  destructive: 'bg-destructive-subtle text-destructive',
  warning: 'bg-warning-subtle text-warning-subtle-foreground',
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirm = useCallback<ConfirmFn>((next) => {
    setOptions(next)
    setBusy(false)
    setError(null)
    setOpen(true)
  }, [])

  const runConfirm = async () => {
    if (!options) return
    setBusy(true)
    setError(null)
    try {
      await options.onConfirm()
      setOpen(false)
    } catch (caught) {
      // A failed action must NOT hang on "Working…". Surface the reason and keep
      // the dialog usable — the busy state clears (finally) so retry/cancel work.
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  // Esc / outside-close is blocked while the action is processing (States spec).
  const onOpenChange = (nextOpen: boolean) => {
    if (busy) return
    if (!nextOpen) setError(null)
    setOpen(nextOpen)
  }

  const tone = options?.tone ?? 'destructive'

  return (
    <ConfirmContext value={confirm}>
      {children}
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="bg-card gap-0 rounded-[15px] p-0 shadow-lg ring-0 data-[size=default]:sm:max-w-[430px]">
          <div className="flex gap-3.5 p-5">
            <span
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-[12px] [&_svg]:size-[22px]',
                TONE_TILE[tone],
              )}
            >
              {options?.icon ?? <TriangleAlert strokeWidth={2} />}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <AlertDialogTitle className="text-foreground text-[15px] font-semibold">
                {options?.title}
              </AlertDialogTitle>
              {options?.description && (
                <AlertDialogDescription className="text-muted-foreground mt-1.5 text-[13px] leading-[1.5]">
                  {options.description}
                </AlertDialogDescription>
              )}
            </div>
          </div>
          {error && (
            <div className="iws-shake border-destructive/40 bg-destructive-subtle text-destructive-subtle-foreground mx-5 -mt-1 mb-4 flex items-start gap-2 rounded-[10px] border px-3 py-2.5 text-[12.5px]">
              <CircleAlert className="mt-px size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <AlertDialogFooter className="mx-0 mb-0 border-t-0 bg-transparent px-5 pt-0 pb-5">
            <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
              {options?.cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              variant={tone === 'destructive' ? 'destructive' : 'default'}
              disabled={busy}
              aria-busy={busy}
              className={cn(
                busy && 'cursor-wait',
                tone === 'warning' && 'bg-warning text-warning-foreground hover:bg-warning/90',
              )}
              onClick={() => void runConfirm()}
            >
              {busy ? (
                <>
                  <Loader2 className="animate-spin" />
                  Working…
                </>
              ) : (
                (options?.confirmLabel ?? 'Confirm')
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext>
  )
}
