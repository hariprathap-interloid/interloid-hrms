import { useState } from 'react'
import { CircleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { fieldError, type FieldDef, type SectionDef } from '../data'

/* ---------------------------------------------------------------------------
 * Add / edit dialog for a Configuration section (POST|PATCH per section).
 * Validation is on blur with submit disabled until valid, per the manifest's
 * required UX patterns.
 * ------------------------------------------------------------------------- */

export type FormValues = Record<string, string>

export function SectionDialog({
  section,
  mode,
  initial,
  onClose,
  onSave,
}: {
  section: SectionDef
  mode: 'add' | 'edit'
  initial: FormValues
  onClose: () => void
  onSave: (values: FormValues) => void
}) {
  const [values, setValues] = useState<FormValues>(initial)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  const errorFor = (field: FieldDef) => fieldError(field, values[field.key])
  const valid = section.fields.every((field) => !errorFor(field))

  const submit = () => {
    if (!valid) {
      setTouched(Object.fromEntries(section.fields.map((f) => [f.key, true])))
      return
    }
    setSaving(true)
    setTimeout(() => {
      const next = { ...values }
      for (const field of section.fields) {
        if (field.upper && next[field.key]) next[field.key] = next[field.key]!.toUpperCase()
      }
      onSave(next)
    }, 600)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit ' : 'Add '}
            {section.singular}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3.5">
          {section.fields.map((field) => {
            const error = touched[field.key] ? errorFor(field) : ''
            const id = `cfg-${field.key}`
            return (
              <div key={field.key} className={cn(field.half ? 'col-span-1' : 'col-span-2')}>
                <Label htmlFor={id} className="mb-1.5 text-[12px] font-medium">
                  {field.label}
                  {field.required && <span className="text-destructive">*</span>}
                </Label>
                {field.kind === 'select' ? (
                  <Select
                    value={values[field.key] ?? ''}
                    onValueChange={(value) => {
                      setValues((prev) => ({ ...prev, [field.key]: value }))
                      setTouched((prev) => ({ ...prev, [field.key]: true }))
                    }}
                  >
                    <SelectTrigger id={id} className="w-full" aria-invalid={Boolean(error)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={id}
                    type={field.kind === 'text' ? 'text' : field.kind}
                    value={values[field.key] ?? ''}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(error)}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                    }
                    onBlur={() => setTouched((prev) => ({ ...prev, [field.key]: true }))}
                  />
                )}
                {error && (
                  <p className="text-destructive mt-1.5 flex items-center gap-1 text-[11px]">
                    <CircleAlert className="size-3" />
                    {error}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !valid} className="flex-[1.5]">
            {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
