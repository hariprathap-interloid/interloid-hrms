import { useState } from 'react'
import { Download, FileText, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { DataViewList } from '@/components/data-view'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/use-auth'
import { cn } from '@/lib/utils'
import { buildProfile, type EmployeeDoc, type Field } from './data'

/* ---------------------------------------------------------------------------
 * My Profile (design: My Profile.dc.html) at /me/profile — all roles. Identity
 * header (PageHeader: avatar + name + code/status badges + tabs) + a dept/manager
 * meta strip, then Personal / Contact / Documents tabs. The whole record is the
 * signed-in persona's (buildProfile(user) derives it — see ./data). Editing (the
 * design's submit-for-HR-approval workflow) is stubbed to a toast for now: it's
 * local-state UI, buildable without new data, just not wired yet (audit Tier 1) —
 * NOT blocked on a pending-change ledger.
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

export function MyProfileScreen() {
  const { user } = useAuth()
  const [tab, setTab] = useState('personal')

  if (!user) return null

  const profile = buildProfile(user)

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
        secondaryActions={[
          {
            label: 'Edit',
            icon: <Pencil />,
            onClick: () =>
              toast('Profile edits route to HR for approval — that workflow isn’t wired up yet.'),
          },
        ]}
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
      />

      {/* Employment meta strip (dept/title from persona; rest demo) */}
      <div className="border-border bg-card grid grid-cols-2 gap-4 rounded-[14px] border p-5 shadow-sm sm:grid-cols-4">
        <Meta label="Department" value={user.department} />
        {profile.employment.map((field) => (
          <Meta key={field.label} label={field.label} value={field.value} />
        ))}
      </div>

      {tab === 'personal' && <FieldCard title="Personal details" fields={profile.personal} />}

      {tab === 'contact' && (
        <>
          <FieldCard title="Contact details" fields={profile.contact} />
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

function FieldCard({ title, fields }: { title: string; fields: Field[] }) {
  return (
    <section className="border-border bg-card rounded-[14px] border p-6 shadow-sm">
      <div className="text-foreground mb-4 text-[14px] font-semibold">{title}</div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-[12px]">{field.label}</span>
            <span className="text-foreground text-[13.5px] font-medium">{field.value}</span>
          </div>
        ))}
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

function DocumentsCard({ docs }: { docs: EmployeeDoc[] }) {
  return (
    <section className="border-border bg-card overflow-hidden rounded-[14px] border shadow-sm">
      <div className="border-border border-b px-5 py-4">
        <div className="text-foreground text-[14px] font-semibold">Documents</div>
        <div className="text-muted-foreground text-[12px]">PDF, PNG or JPG · up to 10 MB</div>
      </div>
      <DataViewList className="rounded-none border-0 shadow-none">
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
