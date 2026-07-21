import { cn } from '@/lib/utils'
import { useResolvedVar } from '../hooks/use-resolved-var'
import type { BoxToken } from '../tokens'

type BoxSwatchProps = BoxToken & {
  /** 'radius' outlines the shape; 'shadow' fills a card to show elevation. */
  variant: 'radius' | 'shadow'
}

export function BoxSwatch({ label, varName, className, variant }: BoxSwatchProps) {
  const resolved = useResolvedVar(varName)

  return (
    <figure className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'h-20 w-20',
          variant === 'radius' ? 'border-primary bg-primary-bg border-2' : 'bg-card',
          className,
        )}
      />
      <figcaption className="flex flex-col items-center gap-0.5 text-center">
        <code className="text-small text-foreground font-medium">{label}</code>
        <span className="text-mono text-muted-foreground tabular-nums">{resolved || '—'}</span>
      </figcaption>
    </figure>
  )
}
