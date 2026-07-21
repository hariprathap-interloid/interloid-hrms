import { cn } from '@/lib/utils'
import { useResolvedVar } from '../hooks/use-resolved-var'
import type { TypeToken } from '../tokens'

const SAMPLE = 'The quick brown fox — ITL-0042'

export function TypeSpecimen({ className, varName, mono }: TypeToken) {
  const size = useResolvedVar(varName)

  return (
    <div className="border-border flex flex-col gap-2 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-baseline gap-3">
        <code className="text-small text-muted-foreground w-28 shrink-0 font-medium">
          {className}
        </code>
        <span className="text-small text-muted-foreground tabular-nums">{size || '—'}</span>
      </div>
      <p className={cn(className, mono && 'font-mono')}>{SAMPLE}</p>
    </div>
  )
}
