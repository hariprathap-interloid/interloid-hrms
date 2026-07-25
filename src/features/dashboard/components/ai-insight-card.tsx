import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ---------------------------------------------------------------------------
 * AiInsightCard — the dashboard's "AI insight" banner: a sparkle tile, a title
 * with an AI-insight tag, a body line, and recommendation chips (design:
 * Company Dashboard hero insight card). Recommendations are demo-only actions.
 * ------------------------------------------------------------------------- */

interface AiInsightCardProps {
  title: string
  body: string
  recommendations: string[]
  onRecommend?: (label: string) => void
}

export function AiInsightCard({ title, body, recommendations, onRecommend }: AiInsightCardProps) {
  return (
    <div className="border-border bg-card flex gap-[13px] rounded-[13px] border p-[15px_17px] shadow-sm">
      <span className="bg-primary-bg text-primary flex size-[34px] shrink-0 items-center justify-center rounded-[9px] [&_svg]:size-[18px]">
        <Sparkles strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold">
          {title}
          <span className="bg-primary-bg text-primary rounded-md px-[7px] py-0.5 text-[10px] font-semibold tracking-[0.04em] uppercase">
            AI insight
          </span>
        </div>
        <p className="text-foreground/80 mt-1 text-[13px] leading-[1.5]">{body}</p>
        <div className="mt-[11px] flex flex-wrap gap-2">
          {recommendations.map((label) => (
            <Button
              key={label}
              variant="outline"
              size="sm"
              className="h-auto gap-1.5 rounded-lg px-[11px] py-1.5 text-[12.5px] font-medium"
              onClick={() => onRecommend?.(label)}
            >
              {label}
              <ArrowRight className="text-muted-foreground size-3.5" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
