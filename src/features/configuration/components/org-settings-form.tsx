import { useState } from 'react'
import { Lock, ShieldCheck } from 'lucide-react'
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
import { LOCALES, MONTHS, TIMEZONES, type OrgSettings } from '../data'

/* ---------------------------------------------------------------------------
 * Organisation settings — PATCH /org/settings. The Admin-only section.
 *
 * HR reaches this section (it is not hidden and not a 404) but gets the
 * permission-limited variant: a read-only banner, disabled controls and no Save
 * button. Admin gets the editable form. `canEdit` is the single seam.
 * ------------------------------------------------------------------------- */

interface RowProps {
  id: string
  label: string
  help: string
  children: React.ReactNode
}

function Row({ id, label, help, children }: RowProps) {
  return (
    <div className="border-border flex flex-wrap items-center gap-4 border-t px-[18px] py-4 first:border-t-0">
      <div className="min-w-0 flex-1">
        <Label htmlFor={id} className="text-[13.5px] font-medium">
          {label}
        </Label>
        <p className="text-muted-foreground mt-0.5 text-[12px]">{help}</p>
      </div>
      <div className="w-[180px] shrink-0 lg:w-[240px]">{children}</div>
    </div>
  )
}

export function OrgSettingsForm({
  settings,
  canEdit,
  onSave,
}: {
  settings: OrgSettings
  canEdit: boolean
  onSave: (next: OrgSettings) => void
}) {
  const [draft, setDraft] = useState<OrgSettings>(settings)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const save = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      onSave(draft)
      toast.success('Organisation settings saved')
    }, 700)
  }

  return (
    <div className="max-w-[640px]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-foreground text-[17px] font-semibold">Organisation settings</h2>
          <p className="text-muted-foreground mt-0.5 text-[13px]">
            Global defaults for the whole workspace.
          </p>
        </div>
        <span className="bg-info-subtle text-info-subtle-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-semibold">
          <ShieldCheck className="size-3" />
          Super Admin
        </span>
      </div>

      {!canEdit && (
        <div className="border-warning bg-warning-subtle mb-4 flex items-start gap-2.5 rounded-[12px] border p-3.5">
          <Lock className="text-warning-subtle-foreground mt-px size-4 shrink-0" />
          <p className="text-warning-subtle-foreground text-[13px]">
            These settings are managed by a Super Admin. You have read-only access.
          </p>
        </div>
      )}

      <div className="border-border bg-card overflow-hidden rounded-[13px] border shadow-sm">
        <Row
          id="org-start-month"
          label="Leave period start month"
          help="First month of the leave accrual year"
        >
          <Select
            value={String(draft.leave_period_start_month)}
            onValueChange={(value) => set('leave_period_start_month', Number(value))}
            disabled={!canEdit}
          >
            <SelectTrigger id="org-start-month" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, index) => (
                <SelectItem key={month} value={String(index + 1)}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

        <Row id="org-prefix" label="Employee code prefix" help="Prepended to every employee code">
          <Input
            id="org-prefix"
            value={draft.employee_code_prefix}
            onChange={(event) => set('employee_code_prefix', event.target.value)}
            disabled={!canEdit}
            className="font-mono"
          />
        </Row>

        <Row id="org-timezone" label="Timezone" help="Used for attendance and reports">
          <Select
            value={draft.timezone}
            onValueChange={(value) => set('timezone', value)}
            disabled={!canEdit}
          >
            <SelectTrigger id="org-timezone" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

        <Row id="org-locale" label="Locale" help="Date, number and currency formatting">
          <Select
            value={draft.locale}
            onValueChange={(value) => set('locale', value)}
            disabled={!canEdit}
          >
            <SelectTrigger id="org-locale" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((locale) => (
                <SelectItem key={locale} value={locale}>
                  {locale}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      </div>

      {/* No Save for a role that can't write — the action is hidden, not disabled. */}
      {canEdit && (
        <div className="mt-3.5 flex justify-end">
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      )}
    </div>
  )
}
