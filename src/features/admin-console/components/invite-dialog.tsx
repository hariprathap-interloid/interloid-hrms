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
import { ROLE_LABELS, emailError, type AuthKind, type RoleLabel } from '../data'

/* ---------------------------------------------------------------------------
 * Invite user. Unbacked by the spec — the manifest notes provisioning is "JIT
 * via SSO only; there is no invite-accept / set-initial-password / MFA-enrolment
 * path", so this creates a local `invited` row only.
 * ------------------------------------------------------------------------- */

export interface InviteValues {
  name: string
  email: string
  role: RoleLabel
  auth: AuthKind
}

export function InviteDialog({
  onClose,
  onInvite,
}: {
  onClose: () => void
  onInvite: (values: InviteValues) => void
}) {
  const [values, setValues] = useState<InviteValues>({
    name: '',
    email: '',
    role: 'Employee',
    auth: 'sso',
  })
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean }>({})
  const [saving, setSaving] = useState(false)

  const nameError = values.name.trim() ? '' : 'Name is required'
  const mailError = emailError(values.email)
  const valid = !nameError && !mailError

  const submit = () => {
    if (!valid) {
      setTouched({ name: true, email: true })
      return
    }
    setSaving(true)
    setTimeout(() => {
      onInvite({ ...values, name: values.name.trim(), email: values.email.trim() })
    }, 800)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3.5">
          <div>
            <Label htmlFor="invite-name" className="mb-1.5 text-[12px] font-medium">
              Full name<span className="text-destructive">*</span>
            </Label>
            <Input
              id="invite-name"
              value={values.name}
              placeholder="e.g. Aarav Mehta"
              aria-invalid={Boolean(touched.name && nameError)}
              onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            />
            {touched.name && nameError && (
              <p className="text-destructive mt-1.5 flex items-center gap-1 text-[11px]">
                <CircleAlert className="size-3" />
                {nameError}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="invite-email" className="mb-1.5 text-[12px] font-medium">
              Work email<span className="text-destructive">*</span>
            </Label>
            <Input
              id="invite-email"
              type="email"
              value={values.email}
              placeholder="name@interloid.com"
              aria-invalid={Boolean(touched.email && mailError)}
              onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            />
            {touched.email && mailError && (
              <p className="text-destructive mt-1.5 flex items-center gap-1 text-[11px]">
                <CircleAlert className="size-3" />
                {mailError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label htmlFor="invite-role" className="mb-1.5 text-[12px] font-medium">
                Role
              </Label>
              <Select
                value={values.role}
                onValueChange={(value) =>
                  setValues((prev) => ({ ...prev, role: value as RoleLabel }))
                }
              >
                <SelectTrigger id="invite-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_LABELS.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="invite-auth" className="mb-1.5 text-[12px] font-medium">
                Auth type
              </Label>
              <Select
                value={values.auth}
                onValueChange={(value) =>
                  setValues((prev) => ({ ...prev, auth: value as AuthKind }))
                }
              >
                <SelectTrigger id="invite-auth" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sso">SSO (Entra ID)</SelectItem>
                  <SelectItem value="fallback">Fallback password</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !valid} className="flex-[1.5]">
            {saving ? 'Sending…' : 'Send invite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
