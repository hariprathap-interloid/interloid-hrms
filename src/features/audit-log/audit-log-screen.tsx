import { useMemo, useState } from 'react'
import { ChevronRight, Download, Info, Lock, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/layout/page-header'
import {
  DataTable,
  MonoText,
  PersonCell,
  TableBadge,
  type ColumnDef,
} from '@/components/data-table'
import { EmptyState, StatusPill } from '@/components/data-view'
import { useRole } from '@/features/auth/use-role'
import { EventDetailSheet } from './components/event-detail-sheet'
import {
  ACTION_META,
  ACTORS,
  EMPTY_FILTERS,
  SOURCE_META,
  entityLabel,
  filterEvents,
  filterOptions,
  formatDateShort,
  formatTime,
  hasActiveFilters,
  hiddenEventCount,
  initials,
  rangeLabel,
  toCsv,
  type AuditEvent,
  type AuditFilters,
} from './data'

/* ---------------------------------------------------------------------------
 * Audit log — /audit-log (design: `Audit Log.dc.html`).
 *
 * Manifest roles: **"HR (scoped), Admin (full)"**. Both roles may view the
 * screen, so this is the design's *permission-limited* case, not the
 * forbidden-URL 404 (Employee / Team Lead are 404'd by the route's RoleGate).
 * HR's scoping hides the Super-Admin entity types (user / role /
 * integration_setting) and says so in a banner rather than silently shrinking
 * the list.
 *
 * Read-only by construction: `GET /audit_logs` is append-only with no
 * mutations, so the only action is CSV export of the current view.
 * ------------------------------------------------------------------------- */

const ALL = '__all__'

export function AuditLogScreen() {
  const role = useRole()
  const isAdmin = role === 'admin'

  const [filters, setFilters] = useState<AuditFilters>(EMPTY_FILTERS)
  const [selected, setSelected] = useState<AuditEvent | null>(null)
  const [exporting, setExporting] = useState(false)

  const options = useMemo(() => filterOptions(isAdmin), [isAdmin])
  const events = useMemo(() => filterEvents(isAdmin, filters), [isAdmin, filters])
  const hidden = hiddenEventCount()
  const filtered = hasActiveFilters(filters)

  const set = <K extends keyof AuditFilters>(key: K, value: AuditFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }))
  const clear = () => setFilters(EMPTY_FILTERS)

  const exportCsv = () => {
    if (exporting) return
    if (events.length === 0) {
      toast('Nothing to export in this view')
      return
    }
    setExporting(true)
    const csv = toCsv(events)
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'interloid-audit-log.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setExporting(false)
    toast(`${events.length} events exported to CSV`)
  }

  const columns: ColumnDef<AuditEvent>[] = [
    {
      id: 'ts',
      header: 'Timestamp · IST',
      accessorKey: 'ts',
      meta: { minWidth: '128px' },
      cell: ({ row }) => (
        <span className="block">
          <MonoText>{formatDateShort(row.original.ts)}</MonoText>
          <span className="text-muted-foreground block font-mono text-[11px]">
            {formatTime(row.original.ts)}
          </span>
        </span>
      ),
    },
    {
      id: 'actor',
      header: 'Actor',
      enableSorting: false,
      meta: { minWidth: '190px' },
      cell: ({ row }) => {
        const actor = ACTORS[row.original.actor]
        if (!actor) return row.original.actor
        return <PersonCell name={actor.name} sub={actor.role} initials={initials(actor)} />
      },
    },
    {
      id: 'action',
      header: 'Action',
      accessorKey: 'action',
      meta: { minWidth: '110px' },
      cell: ({ row }) => {
        const action = ACTION_META[row.original.action]
        return (
          <TableBadge tone={action.tone} dot={false}>
            {action.label}
          </TableBadge>
        )
      },
    },
    {
      id: 'entity',
      header: 'Entity',
      accessorKey: 'entity',
      meta: { minWidth: '150px' },
      cell: ({ row }) => (
        <span className="block">
          <span className="text-foreground block text-[12.5px] font-medium">
            {entityLabel(row.original.entity)}
          </span>
          <MonoText>{row.original.entityId}</MonoText>
        </span>
      ),
    },
    {
      id: 'source',
      header: 'Source',
      accessorKey: 'source',
      meta: { minWidth: '120px' },
      cell: ({ row }) => {
        const source = SOURCE_META[row.original.source]
        return <StatusPill tone={source.tone}>{source.label}</StatusPill>
      },
    },
    {
      id: 'open',
      header: '',
      enableSorting: false,
      meta: { align: 'end', width: '44px' },
      cell: () => <ChevronRight className="text-muted-foreground/70 inline size-4" />,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Audit log"
        description="Immutable record of every change & system event · timestamps in IST"
        badges={[
          { label: 'Read-only', tone: 'neutral' },
          isAdmin
            ? { label: 'Full access', tone: 'primary' }
            : { label: 'Scoped view', tone: 'info' },
        ]}
        secondaryActions={[
          {
            label: exporting ? 'Exporting…' : 'Export CSV',
            icon: <Download />,
            onClick: exportCsv,
            disabled: exporting,
          },
        ]}
      />

      {/* HR sees a reduced log — say so rather than silently hiding rows. */}
      {!isAdmin && (
        <div className="border-info bg-info-subtle flex items-start gap-2.5 rounded-[12px] border p-3.5">
          <Info className="text-info-subtle-foreground mt-px size-4 shrink-0" />
          <p className="text-info-subtle-foreground text-[12.5px]">
            Scoped view — <strong className="font-semibold">{hidden} Super-Admin events</strong>{' '}
            (users, roles, integration settings) are hidden from HR Managers.
          </p>
        </div>
      )}

      {/* Filter toolbar — this screen's own composition, per the design. */}
      <div className="flex flex-wrap items-end gap-2.5">
        <div className="relative min-w-[170px] flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={filters.q}
            onChange={(event) => set('q', event.target.value)}
            placeholder="Search entity ID, actor…"
            aria-label="Search audit events"
            className="pl-9"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-muted-foreground text-[11px]">Actor</Label>
          <Select
            value={filters.actor || ALL}
            onValueChange={(value) => set('actor', value === ALL ? '' : value)}
          >
            <SelectTrigger className="min-w-[150px]" aria-label="Actor">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All actors</SelectItem>
              {options.actors.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-muted-foreground text-[11px]">Entity type</Label>
          <Select
            value={filters.entity || ALL}
            onValueChange={(value) => set('entity', value === ALL ? '' : value)}
          >
            <SelectTrigger className="min-w-[150px]" aria-label="Entity type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All entity types</SelectItem>
              {options.entities.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="audit-from" className="text-muted-foreground text-[11px]">
            From
          </Label>
          <Input
            id="audit-from"
            type="date"
            value={filters.from}
            onChange={(event) => set('from', event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="audit-to" className="text-muted-foreground text-[11px]">
            To
          </Label>
          <Input
            id="audit-to"
            type="date"
            value={filters.to}
            onChange={(event) => set('to', event.target.value)}
          />
        </div>

        {filtered && (
          <Button variant="outline" onClick={clear}>
            <X />
            Clear
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={events}
        getRowId={(row) => row.id}
        pageSize={25}
        onRowClick={setSelected}
        // Append-only: no selection, no bulk ops, no row actions anywhere.
        caption={`${events.length} ${events.length === 1 ? 'event' : 'events'} · ${rangeLabel(events)}`}
        footerMeta={
          <span className="inline-flex items-center gap-1.5">
            <Lock className="size-3" />
            Append-only · immutable
          </span>
        }
        empty={
          <EmptyState
            title="No matching events"
            description="Nothing recorded for this actor, entity type or date range."
            action={
              filtered ? (
                <Button variant="outline" onClick={clear}>
                  Reset filters
                </Button>
              ) : undefined
            }
          />
        }
      />

      <EventDetailSheet event={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
