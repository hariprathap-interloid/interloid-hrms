import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { DataTable, MonoText, TableBadge, type ColumnDef } from '@/components/data-table'
import { EmptyState } from '@/components/data-view'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useConfirm } from '@/components/confirm/use-confirm'
import { useRole } from '@/features/auth/use-role'
import { OrgSettingsForm } from './components/org-settings-form'
import { SectionDialog, type FormValues } from './components/section-dialog'
import { SectionNav } from './components/section-nav'
import {
  asText,
  badgeLabel,
  cellText,
  getConfigData,
  isSectionLocked,
  sectionFor,
  type ConfigData,
  type OrgSettings,
  type SectionKey,
} from './data'

/* ---------------------------------------------------------------------------
 * Configuration — /configuration (design: `Configuration.dc.html`).
 *
 * Manifest roles: **"HR (partial — depts/shifts/leave types/holidays), Admin
 * (full incl. org settings)"**. Both roles VIEW the screen, so the role split
 * lives *inside* it, exactly like Audit Log's scoped/full split — this is the
 * permission-limited case, not a route gate. Employee / Team Lead have no
 * configure capability at all (matrix: `— | — | Partial | ✓ (full)`) and are
 * 404'd by the route's RoleGate.
 *
 * Three agreeing permission layers:
 *   1. nav-visibility — sidebar item is hr/admin
 *   2. route gate     — RoleGate allow={['hr','admin']}, else 404
 *   3. section gate   — THIS screen: `org` is adminOnly, so HR sees it locked
 *                       and read-only rather than hidden or 404'd
 * ------------------------------------------------------------------------- */

/** Row shape is per-section; the table is driven by the section's column defs. */
type Row = Record<string, unknown> & { id: string }

export function ConfigurationScreen() {
  const role = useRole()
  const isAdmin = role === 'admin'
  const confirm = useConfirm()

  const [data, setData] = useState<ConfigData>(() => getConfigData())
  const [active, setActive] = useState<SectionKey>('departments')
  const [dialog, setDialog] = useState<{
    mode: 'add' | 'edit'
    values: FormValues
    /** Present on edit — the row being patched. */
    id?: string
  } | null>(null)

  const section = sectionFor(active)
  const locked = isSectionLocked(section, isAdmin)
  // Every table section is HR-writable per the manifest; only `org` is gated.
  const canEdit = !locked

  const rows = useMemo<Row[]>(() => {
    if (section.kind === 'form') return []
    return data[section.key as Exclude<SectionKey, 'org'>] as unknown as Row[]
  }, [data, section])

  const toFormValues = (row: Row): FormValues =>
    Object.fromEntries(section.fields.map((f) => [f.key, asText(row[f.key])]))

  const emptyFormValues = (): FormValues =>
    Object.fromEntries(
      section.fields.map((f) => [f.key, f.kind === 'select' ? (f.options?.[0]?.value ?? '') : '']),
    )

  const persist = (values: FormValues) => {
    const key = section.key as Exclude<SectionKey, 'org'>
    const current = data[key] as unknown as Row[]
    // Coerce back to the resource's field types (selects carry strings).
    const coerced: Record<string, unknown> = { ...values }
    for (const field of section.fields) {
      if (field.kind === 'number') coerced[field.key] = Number(values[field.key]) || 0
      if (field.options === undefined) continue
      if (values[field.key] === 'true' || values[field.key] === 'false') {
        coerced[field.key] = values[field.key] === 'true'
      }
    }

    const label = asText(coerced.name) || asText(coerced.code) || 'Item'
    if (dialog?.mode === 'edit' && dialog.id) {
      const id = dialog.id
      setData((prev) => ({
        ...prev,
        [key]: current.map((row) => (row.id === id ? { ...row, ...coerced } : row)),
      }))
      toast.success(`${label} updated`)
    } else {
      // The server issues ids; this only has to be unique within the stub.
      const nextId = String(Math.max(0, ...current.map((row) => Number(row.id) || 0)) + 1)
      setData((prev) => ({ ...prev, [key]: [...current, { id: nextId, ...coerced }] }))
      toast.success(`${label} added`)
    }
    setDialog(null)
  }

  const remove = (row: Row) => {
    const key = section.key as Exclude<SectionKey, 'org'>
    const label = asText(row.name) || asText(row.code) || 'this item'
    void confirm({
      title: `Delete ${label}?`,
      // DELETE /departments/{id} → 409 "in use" is the real failure mode here.
      description: `This removes the ${section.singular} from Configuration. It fails if the ${section.singular} is still in use.`,
      confirmLabel: 'Delete',
      tone: 'destructive',
      onConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 600))
        setData((prev) => ({
          ...prev,
          [key]: (prev[key] as unknown as Row[]).filter((r) => r.id !== row.id),
        }))
        toast.success(`${label} deleted`)
      },
    })
  }

  const columns = useMemo<ColumnDef<Row>[]>(
    () =>
      section.columns.map((column) => ({
        id: column.key,
        header: column.label,
        accessorKey: column.key,
        cell: ({ row }) => {
          const value = row.original[column.key]
          if (column.badge && typeof value === 'boolean') {
            return (
              <TableBadge tone={value ? 'success' : 'neutral'} dot={false}>
                {badgeLabel(section.key, value)}
              </TableBadge>
            )
          }
          const text = cellText(column, value)
          return column.mono ? <MonoText>{text}</MonoText> : text
        },
      })),
    [section],
  )

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col p-6 lg:p-10">
      <PageHeader
        title="Configuration"
        description={
          isAdmin
            ? 'Super Admin · full access — all settings'
            : 'HR Manager · partial access — org settings are read-only'
        }
        badges={[
          isAdmin
            ? { label: 'Full access', tone: 'primary' }
            : { label: 'Partial access', tone: 'info' },
        ]}
        bordered={false}
      />

      <div className="border-border mt-2 flex flex-col overflow-hidden rounded-[14px] border lg:flex-row lg:items-stretch">
        <SectionNav active={active} isAdmin={isAdmin} onSelect={setActive} />

        <main className="min-w-0 flex-1 p-5 lg:p-6">
          {section.kind === 'form' ? (
            <OrgSettingsForm
              settings={data.org}
              canEdit={canEdit}
              onSave={(next: OrgSettings) => setData((prev) => ({ ...prev, org: next }))}
            />
          ) : (
            <>
              <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-foreground text-[17px] font-semibold">{section.title}</h2>
                  <p className="text-muted-foreground mt-0.5 text-[13px]">{section.description}</p>
                </div>
                {canEdit && (
                  <Button
                    onClick={() => setDialog({ mode: 'add', values: emptyFormValues() })}
                    size="sm"
                  >
                    <Plus />
                    Add
                  </Button>
                )}
              </div>

              <DataTable
                key={section.key}
                columns={columns}
                data={rows}
                getRowId={(row) => row.id}
                permitActions={canEdit}
                caption={`${rows.length} ${rows.length === 1 ? section.singular : section.noun}`}
                rowActions={(row) => (
                  <>
                    <DropdownMenuItem
                      onSelect={() =>
                        setDialog({ mode: 'edit', values: toFormValues(row), id: row.id })
                      }
                    >
                      <Pencil />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onSelect={() => remove(row)}>
                      <Trash2 />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                empty={
                  <EmptyState
                    title={`No ${section.noun} yet`}
                    description={`Add your first ${section.singular} to get started.`}
                    action={
                      canEdit ? (
                        <Button
                          onClick={() => setDialog({ mode: 'add', values: emptyFormValues() })}
                        >
                          Add {section.singular}
                        </Button>
                      ) : undefined
                    }
                  />
                }
              />
            </>
          )}
        </main>
      </div>

      {dialog && (
        <SectionDialog
          section={section}
          mode={dialog.mode}
          initial={dialog.values}
          onClose={() => setDialog(null)}
          onSave={persist}
        />
      )}
    </div>
  )
}
