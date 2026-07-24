import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Check, Loader2, RotateCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'

const ERROR_REF = 'ERR-2026-5A2F'

export default function ServerErrorPage() {
  const navigate = useNavigate()
  const [retryState, setRetryState] = useState<'idle' | 'loading' | 'failed' | 'recovered'>('idle')
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const attempts = useRef(0)

  const goHome = () => void navigate(paths.home.getHref())

  // Demo: the first retry fails, the second recovers.
  const retry = () => {
    if (retryState === 'loading') return
    setRetryState('loading')
    timer.current = setTimeout(() => {
      attempts.current += 1
      setRetryState(attempts.current >= 2 ? 'recovered' : 'failed')
    }, 1100)
  }

  const copyRef = () => {
    if (navigator.clipboard) void navigator.clipboard.writeText(ERROR_REF).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const busy = retryState === 'loading'

  return (
    <div className="bg-background flex min-h-dvh items-center justify-center p-6">
      {retryState === 'recovered' ? (
        <div className="animate-in fade-in max-w-[440px] text-center duration-300">
          <div className="bg-success-subtle text-success mx-auto flex size-16 items-center justify-center rounded-[18px] [&_svg]:size-[30px]">
            <Check strokeWidth={2.5} />
          </div>
          <div className="text-foreground mt-[18px] text-[19px] font-semibold">
            Back up and running
          </div>
          <div className="text-muted-foreground mt-2 text-[13.5px]">
            The service recovered. You can carry on where you left off.
          </div>
          <Button className="mt-6 h-11 rounded-[11px] px-6 text-sm" onClick={goHome}>
            Back to dashboard
          </Button>
        </div>
      ) : (
        <div className="animate-in fade-in max-w-[440px] text-center duration-300">
          <div className="bg-destructive-subtle text-destructive mx-auto flex size-16 items-center justify-center rounded-[18px] [&_svg]:size-[30px]">
            <TriangleAlert />
          </div>
          <div className="text-foreground mt-[18px] text-[19px] font-semibold">
            Something went wrong on our side
          </div>
          <div className="text-muted-foreground mt-2 text-[13.5px] leading-[1.6]">
            The request couldn&rsquo;t be completed. Your data is safe — nothing was saved twice.
            Try again, or come back in a few minutes.
          </div>

          {retryState === 'failed' && (
            <div className="border-destructive bg-destructive-subtle mt-4 flex items-center gap-2.5 rounded-[10px] border px-3.5 py-3 text-left">
              <AlertCircle className="text-destructive size-4 shrink-0" />
              <div className="text-destructive-subtle-foreground text-[12.5px]">
                Still failing. Our team has been notified automatically.
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Button
              className="h-11 min-w-[150px] gap-2 rounded-[11px] text-sm"
              onClick={retry}
              disabled={busy}
              aria-busy={busy}
            >
              {busy ? <Loader2 className="animate-spin" /> : <RotateCw />}
              {busy ? 'Retrying…' : retryState === 'failed' ? 'Retry again' : 'Try again'}
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-[11px] text-sm font-medium"
              onClick={goHome}
            >
              Back to dashboard
            </Button>
          </div>

          <div className="bg-muted text-muted-foreground mt-6 inline-flex items-center gap-2 rounded-[9px] px-3 py-1.5 font-mono text-[12px]">
            <span>Ref</span>
            <span className="text-foreground font-medium">{ERROR_REF}</span>
            <button
              type="button"
              onClick={copyRef}
              className="text-primary font-sans font-medium hover:underline"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
          <div className="text-muted-foreground mt-2.5 text-[12px]">
            Quote this reference when you{' '}
            <button type="button" className="text-primary hover:underline">
              contact IT support
            </button>
            .
          </div>
        </div>
      )}
    </div>
  )
}
