import { useEffect, useRef, useState } from 'react'
import { Clock3, Download, FileText, Pencil, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { DataViewList } from '@/components/data-view'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/use-auth'
import { cn } from '@/lib/utils'
import { buildProfile, type EmployeeDoc, type Field, type ProfileChangeRequest } from './data'

/* ---------------------------------------------------------------------------
 * My Profile (design: My Profile.dc.html) at /me/profile — all roles. Identity
 * header (PageHeader: avatar + name + code/status badges + tabs) + a dept/manager
 * meta strip, then Personal / Contact / Documents tabs. The whole record is the
 * signed-in persona's (buildProfile(user) — see ./data). Personal/Contact fields
 * are editable: Edit → change → "Submit for review" opens a ProfileChangeRequest
 * (local state; the design runs this on local state too), which shows a per-field
 * "Pending approval" pill + a summary banner until HR acts. No backend needed.
 * ------------------------------------------------------------------------- */

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const TABS = [
  { key: 'personal', label: 'Personal' },
  { key: 'contact', label: 'Contact' },
  { key: 'documents', label: 'Documents' },
]

type Change = { field: string; from: string; to: string }

export function MyProfileScreen() {
  const { user } = useAuth()
  const [tab, setTab] = useState('personal')
  const [pending, setPending] = useState<ProfileChangeRequest[]>([])
  const seq = useRef(0)

  if (!user) return null

  const profile = buildProfile(user)
  const pendingByField = new Map(pending.map((request) => [request.field, request]))

  const submitChanges = (changes: Change[]) => {
    if (changes.length === 0) return
    // POST /profile_change_requests — one request per changed field.
    const created: ProfileChangeRequest[] = changes.map((change) => {
      seq.current += 1
      return {
        id: `PCR-${1000 + seq.current}`,
        field: change.field,
        from: change.from,
        to: change.to,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      }
    })
    setPending((prev) => [
      ...prev.filter((request) => !created.some((c) => c.field === request.field)),
      ...created,
    ])
    toast.success(
      `Submitted ${changes.length} change${changes.length === 1 ? '' : 's'} for HR review`,
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 lg:p-10">
      <PageHeader
        icon={<span className="text-[15px] font-semibold">{initialsOf(user.name)}</span>}
        title={user.name}
        badges={[
          { label: user.id, tone: 'neutral' },
          { label: 'Active', tone: 'success' },
        ]}
        description={`${user.title} · ${user.department}`}
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
      />

      {/* Pending-changes banner (shown once an edit is submitted for review). */}
      {pending.length > 0 && (
        <div className="border-warning/30 bg-warning-subtle text-warning-subtle-foreground flex items-center gap-2.5 rounded-[12px] border px-4 py-3 text-[13px]">
          <Clock3 className="size-4 shrink-0" strokeWidth={1.8} />
          <span>
            <span className="font-semibold">{pending.length}</span> change
            {pending.length === 1 ? '' : 's'} awaiting HR approval.
          </span>
        </div>
      )}

      {/* Employment meta strip (dept/title from persona; rest demo, not self-editable) */}
      <div className="border-border bg-card grid grid-cols-2 gap-4 rounded-[14px] border p-5 shadow-sm sm:grid-cols-4">
        <Meta label="Department" value={user.department} />
        {profile.employment.map((field) => (
          <Meta key={field.label} label={field.label} value={field.value} />
        ))}
      </div>

      {tab === 'personal' && (
        <EditableFieldCard
          title="Personal details"
          fields={profile.personal}
          pending={pendingByField}
          onSubmit={submitChanges}
        />
      )}

      {tab === 'contact' && (
        <>
          <EditableFieldCard
            title="Contact details"
            fields={profile.contact}
            pending={pendingByField}
            onSubmit={submitChanges}
          />
          <BankCard />
        </>
      )}

      {tab === 'documents' && <DocumentsCard docs={profile.documents} />}
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-muted-foreground text-[11px] font-semibold tracking-[0.03em] uppercase">
        {label}
      </div>
      <div className="text-foreground mt-1 truncate text-[13.5px] font-medium">{value}</div>
    </div>
  )
}

function EditableFieldCard({
  title,
  fields,
  pending,
  onSubmit,
}: {
  title: string
  fields: Field[]
  pending: Map<string, ProfileChangeRequest>
  onSubmit: (changes: Change[]) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})

  const startEdit = () => {
    setDraft(Object.fromEntries(fields.map((field) => [field.label, field.value])))
    setEditing(true)
  }

  const submit = () => {
    const changes = fields
      .map((field) => ({
        field: field.label,
        from: field.value,
        to: (draft[field.label] ?? field.value).trim(),
      }))
      .filter((change) => change.to.length > 0 && change.to !== change.from)
    onSubmit(changes)
    setEditing(false)
  }

  return (
    <section className="border-border bg-card rounded-[14px] border p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-foreground text-[14px] font-semibold">{title}</div>
        {editing ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={submit}>
              Submit for review
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={startEdit}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {fields.map((field) => {
          const request = pending.get(field.label)
          return (
            <div key={field.label} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-[12px]">{field.label}</span>
                {request && (
                  <span className="bg-warning-subtle text-warning-subtle-foreground inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                    <Clock3 className="size-2.5" />
                    Pending approval
                  </span>
                )}
              </div>
              {editing ? (
                <Input
                  value={draft[field.label] ?? field.value}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, [field.label]: event.target.value }))
                  }
                  className="h-8 text-[13px]"
                  aria-label={field.label}
                />
              ) : (
                <>
                  <span className="text-foreground text-[13.5px] font-medium">{field.value}</span>
                  {request && (
                    <span className="text-warning-subtle-foreground text-[11.5px]">
                      → {request.to}{' '}
                      <span className="text-muted-foreground">· awaiting HR review</span>
                    </span>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function BankCard() {
  return (
    <section className="border-border/70 flex items-center gap-3 rounded-[14px] border border-dashed p-5">
      <div className="min-w-0 flex-1">
        <div className="text-muted-foreground text-[13.5px] font-semibold">
          Bank &amp; payroll details
        </div>
        <div className="text-muted-foreground/80 text-[12.5px]">Account, IFSC and tax details</div>
      </div>
      <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-medium">
        Coming later
      </span>
    </section>
  )
}

type Upload = { id: string; name: string; size: string; progress: number }

function extOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).toUpperCase() : 'FILE'
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function DocumentsCard({ docs: initialDocs }: { docs: EmployeeDoc[] }) {
  const [docs, setDocs] = useState(initialDocs)
  const [uploads, setUploads] = useState<Upload[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const seq = useRef(0)
  const timers = useRef<ReturnType<typeof setInterval>[]>([])

  // Clear any in-flight upload timers if the tab unmounts.
  useEffect(() => () => timers.current.forEach((timer) => clearInterval(timer)), [])

  const addFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      seq.current += 1
      const id = `up-${seq.current}`
      const size = formatSize(file.size)
      setUploads((prev) => [...prev, { id, name: file.name, size, progress: 0 }])
      // Simulate POST /documents with upload progress, then move to the list.
      let progress = 0
      const timer = setInterval(() => {
        progress = Math.min(100, progress + 14)
        if (progress >= 100) {
          clearInterval(timer)
          timers.current = timers.current.filter((t) => t !== timer)
          setUploads((prev) => prev.filter((item) => item.id !== id))
          setDocs((prev) => [
            { id: `doc-${id}`, name: file.name, size, date: todayLabel(), ext: extOf(file.name) },
            ...prev,
          ])
          toast.success(`${file.name} uploaded`)
        } else {
          setUploads((prev) => prev.map((item) => (item.id === id ? { ...item, progress } : item)))
        }
      }, 180)
      timers.current.push(timer)
    })
  }

  return (
    <section className="border-border bg-card overflow-hidden rounded-[14px] border shadow-sm">
      <div className="border-border border-b px-5 py-4">
        <div className="text-foreground text-[14px] font-semibold">Documents</div>
        <div className="text-muted-foreground text-[12px]">PDF, PNG or JPG · up to 10 MB</div>
      </div>

      {/* Upload dropzone */}
      <div className="px-5 pt-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            addFiles(event.dataTransfer.files)
          }}
          className={cn(
            'flex w-full flex-col items-center gap-1.5 rounded-[12px] border border-dashed px-5 py-6 text-center transition',
            dragging
              ? 'border-primary bg-primary-bg'
              : 'border-border hover:border-primary/50 hover:bg-muted/40',
          )}
        >
          <span className="bg-primary-bg text-primary flex size-10 items-center justify-center rounded-full [&_svg]:size-5">
            <UploadCloud strokeWidth={1.8} />
          </span>
          <span className="text-foreground text-[13px] font-medium">
            Drag &amp; drop, or <span className="text-primary">browse</span>
          </span>
          <span className="text-muted-foreground text-[11.5px]">PDF, PNG or JPG · up to 10 MB</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>

      {/* In-progress uploads */}
      {uploads.length > 0 && (
        <div className="flex flex-col gap-2 px-5 pt-3">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="border-border flex items-center gap-3 rounded-[10px] border px-3.5 py-2.5"
            >
              <span className="bg-primary-bg text-primary flex size-8 shrink-0 items-center justify-center rounded-[8px] [&_svg]:size-4">
                <UploadCloud strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-foreground truncate text-[12.5px] font-medium">
                    {upload.name}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
                    {upload.progress}%
                  </span>
                </div>
                <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document list */}
      <DataViewList className="mt-4 rounded-none border-0 shadow-none">
        {docs.map((doc) => (
          <div key={doc.id} className="border-border flex items-center gap-3 border-t px-5 py-3.5">
            <span className="bg-destructive-subtle text-destructive flex size-9 shrink-0 items-center justify-center rounded-[9px] [&_svg]:size-[18px]">
              <FileText strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-foreground truncate text-[13.5px] font-medium">{doc.name}</div>
              <div className="text-muted-foreground text-[11.5px]">
                {doc.size} · {doc.date}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Download ${doc.name}`}
              className={cn('shrink-0')}
              onClick={() => toast('Generating secure link…')}
            >
              <Download />
            </Button>
          </div>
        ))}
      </DataViewList>
    </section>
  )
}
