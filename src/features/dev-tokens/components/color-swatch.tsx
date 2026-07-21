import { cn } from '@/lib/utils'
import { useResolvedVar } from '../hooks/use-resolved-var'
import type { ColorToken } from '../tokens'

export function ColorSwatch({ label, varName, className, sampleClassName }: ColorToken) {
  const resolved = useResolvedVar(varName)

  return (
    <figure className="flex flex-col gap-2">
      <div
        className={cn(
          'border-border flex h-16 items-center justify-center rounded-lg border',
          className,
        )}
      >
        {sampleClassName ? (
          <span className={cn('text-small font-semibold', sampleClassName)}>Aa</span>
        ) : null}
      </div>
      <figcaption className="flex flex-col gap-0.5">
        <code className="text-small text-foreground font-medium">{label}</code>
        <span className="text-mono text-muted-foreground tabular-nums">{resolved || '—'}</span>
      </figcaption>
    </figure>
  )
}
