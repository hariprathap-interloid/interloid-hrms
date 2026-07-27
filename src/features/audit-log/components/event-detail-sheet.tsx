import { ArrowRight, Lock } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { MonoText, TableBadge } from '@/components/data-table'
import { StatusPill } from '@/components/data-view'
import {
  ACTION_META,
  ACTORS,
  SOURCE_META,
  entityLabel,
  formatDate,
  formatTime,
  type AuditEvent,
} from '../data'

/* ---------------------------------------------------------------------------
 * Audit event detail — the design's right-hand Sheet. Read-only by definition:
 * an append-only log has no mutations, so this surface only ever presents.
 * ------------------------------------------------------------------------- */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-[0.04em] uppercase">
        {label}
      </div>
      {children}
    </div>
  )
}

export function EventDetailSheet({
  event,
  onClose,
}: {
  event: AuditEvent | null
  onClose: () => void
}) {
  if (!event) return null

  const actor = ACTORS[event.actor]
  const action = ACTION_META[event.action]
  const source = SOURCE_META[event.source]

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-[440px]">
        <SheetHeader className="border-border border-b">
          <SheetTitle className="flex flex-wrap items-center gap-2.5">
            <TableBadge tone={action.tone} dot={false}>
              {action.label}
            </TableBadge>
            <MonoText>{event.id}</MonoText>
          </SheetTitle>
          <SheetDescription>{event.summary}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-5">
          <Section label="When">
            <div className="text-foreground text-[13.5px]">
              {formatDate(event.ts)} · <MonoText>{formatTime(event.ts)}</MonoText>{' '}
              <span className="text-muted-foreground">IST</span>
            </div>
          </Section>

          <Section label="Actor">
            <div className="text-foreground text-[13.5px] font-medium">
              {actor?.name ?? event.actor}
            </div>
            <div className="text-muted-foreground text-[12px]">{actor?.role}</div>
          </Section>

          <Section label="Target">
            <div className="text-foreground text-[13.5px] font-medium">
              {entityLabel(event.entity)}
            </div>
            <MonoText>{event.entityId}</MonoText>
          </Section>

          <Section label="Source">
            <StatusPill tone={source.tone}>{source.label}</StatusPill>
          </Section>

          {event.changes.length > 0 && (
            <Section label="Changes">
              <div className="border-border divide-border divide-y rounded-[10px] border">
                {event.changes.map((change) => (
                  <div key={change.field} className="flex flex-col gap-1.5 px-3 py-2.5">
                    <MonoText>{change.field}</MonoText>
                    <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
                      <span className="text-muted-foreground line-through">{change.from}</span>
                      <ArrowRight className="text-muted-foreground size-3.5" />
                      <span className="text-foreground font-medium">{change.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {event.meta.length > 0 && (
            <Section label="Context">
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[12.5px]">
                {event.meta.map(([key, value]) => (
                  <div key={key} className="contents">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="min-w-0 break-all">
                      <MonoText>{value}</MonoText>
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          <p className="text-muted-foreground flex items-center gap-1.5 text-[11.5px]">
            <Lock className="size-3" />
            This entry is immutable and cannot be edited or removed.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
