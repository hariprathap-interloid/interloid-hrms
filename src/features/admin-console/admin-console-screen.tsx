import { useMemo, useState } from 'react'
import { Plug, ShieldCheck, UserPlus, UsersRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'
import { DataTable, PersonCell, TableBadge, type ColumnDef } from '@/components/data-table'
import { StatusPill } from '@/components/data-view'
import { useConfirm } from '@/components/confirm/use-confirm'
import { ConnectorCard } from './components/connector-card'
import { InviteDialog, type InviteValues } from './components/invite-dialog'
import { RolesMatrix } from './components/roles-matrix'
import {
  STATUS_META,
  authLabel,
  getConnectors,
  getUsers,
  initialsOf,
  type AdminUser,
  type UserStatus,
} from './data'

/* ---------------------------------------------------------------------------
 * Admin Console — /admin (design: `Admin Console.dc.html`).
 *
 * Manifest roles: **"Admin only."** Matrix: `Manage users, roles & integration
 * settings | — | — | — | ✓`. Unlike Audit Log and Configuration there is no
 * reduced variant, so this is a pure route gate — every other role (HR
 * included) takes the "forbidden URL → Not found" rule via the RoleGate's 404
 * fallback. The design file's in-screen "Restricted area · 403" panel is
 * standalone-demo scaffolding driven by its own role switcher, NOT a manifest
 * exception — see hrms-dev.md, 2026-07-27. It is deliberately not built.
 * ------------------------------------------------------------------------- */

type Tab = 'users' | 'roles' | 'integrations'

const TABS: { key: Tab; label: string; icon: typeof UsersRound }[] = [
  { key: 'users', label: 'Users', icon: UsersRound },
  { key: 'roles', label: 'Roles', icon: ShieldCheck },
  { key: 'integrations', label: 'Integrations', icon: Plug },
]

export function AdminConsoleScreen() {
  const confirm = useConfirm()
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<AdminUser[]>(() => getUsers())
  const [inviting, setInviting] = useState(false)
  const connectors = useMemo(() => getConnectors(), [])

  const ssoCount = users.filter((user) => user.auth === 'sso').length

  const setStatus = (user: AdminUser, status: UserStatus, message: string) => {
    setUsers((current) => current.map((u) => (u.id === user.id ? { ...u, status } : u)))
    toast.success(message)
  }

  const deactivate = (user: AdminUser) =>
    void confirm({
      title: `Deactivate ${user.name}?`,
      // No user-level endpoint exists — this maps to DELETE /employees/{id}.
      description: 'They lose access immediately. An admin can reactivate them later.',
      confirmLabel: 'Deactivate',
      tone: 'destructive',
      onConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 700))
        setStatus(user, 'inactive', `${user.name} deactivated`)
      },
    })

  const invite = (values: InviteValues) => {
    const nextId = String(Math.max(0, ...users.map((u) => Number(u.id) || 0)) + 1)
    setUsers((current) => [...current, { id: nextId, ...values, status: 'invited' }])
    setInviting(false)
    toast.success(`Invitation sent to ${values.email}`)
  }

  // Not memoised: the action cells close over `deactivate` / `setStatus`, and
  // the React Compiler handles the caching.
  const columns: ColumnDef<AdminUser>[] = [
    {
      id: 'user',
      header: 'User',
      accessorKey: 'name',
      meta: { minWidth: '230px' },
      cell: ({ row }) => (
        <PersonCell
          name={row.original.name}
          sub={row.original.email}
          initials={initialsOf(row.original.name)}
        />
      ),
    },
    {
      id: 'role',
      header: 'Role',
      accessorKey: 'role',
      meta: { minWidth: '120px' },
      // Read-only: /roles has no user↔role write endpoint in Phase 1a.
      cell: ({ row }) => row.original.role,
    },
    {
      id: 'auth',
      header: 'Auth',
      accessorKey: 'auth',
      meta: { minWidth: '100px' },
      cell: ({ row }) => (
        <TableBadge tone={row.original.auth === 'sso' ? 'primary' : 'neutral'} dot={false}>
          {authLabel(row.original.auth)}
        </TableBadge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      meta: { minWidth: '110px' },
      cell: ({ row }) => {
        const meta = STATUS_META[row.original.status]
        return <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { align: 'end', minWidth: '190px' },
      cell: ({ row }) => {
        const user = row.original
        return (
          <span className="inline-flex justify-end gap-1.5">
            {user.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive h-8 px-2.5 text-[12px]"
                  onClick={() => deactivate(user)}
                >
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-[12px]"
                  onClick={() => setStatus(user, 'locked', `${user.name} locked`)}
                >
                  Lock
                </Button>
              </>
            )}
            {user.status === 'inactive' && (
              <Button
                size="sm"
                className="h-8 px-2.5 text-[12px]"
                onClick={() => setStatus(user, 'active', `${user.name} activated`)}
              >
                Activate
              </Button>
            )}
            {user.status === 'locked' && (
              <Button
                size="sm"
                className="h-8 px-2.5 text-[12px]"
                onClick={() => setStatus(user, 'active', `${user.name} unlocked`)}
              >
                Unlock
              </Button>
            )}
            {user.status === 'invited' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-[12px]"
                  onClick={() => toast.success(`Invitation resent to ${user.email}`)}
                >
                  Resend
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-2.5 text-[12px]"
                  onClick={() => setStatus(user, 'active', `${user.name} activated`)}
                >
                  Activate
                </Button>
              </>
            )}
          </span>
        )
      },
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-6 lg:p-10">
      <PageHeader
        title="Admin Console"
        description="Super Admin · users, roles & integrations"
        badges={[{ label: 'Admin only', tone: 'primary' }]}
        tabs={TABS.map((t) => ({ key: t.key, label: t.label }))}
        activeTab={tab}
        onTabChange={(key) => setTab(key as Tab)}
      />

      {tab === 'users' && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-foreground text-[17px] font-semibold">User accounts</h2>
              <p className="text-muted-foreground mt-0.5 text-[13px]">
                {users.length} accounts · {ssoCount} via SSO
              </p>
            </div>
            <Button onClick={() => setInviting(true)}>
              <UserPlus />
              Invite user
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={users}
            getRowId={(row) => row.id}
            caption={`${users.length} accounts · ${ssoCount} via SSO`}
          />
        </>
      )}

      {tab === 'roles' && <RolesMatrix />}

      {tab === 'integrations' && (
        <>
          <div>
            <h2 className="text-foreground text-[17px] font-semibold">Integrations</h2>
            <p className="text-muted-foreground mt-0.5 text-[13px]">
              Connected identity and attendance systems.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {connectors.map((connector) => (
              <ConnectorCard key={connector.key} connector={connector} />
            ))}
          </div>
        </>
      )}

      {inviting && <InviteDialog onClose={() => setInviting(false)} onInvite={invite} />}
    </div>
  )
}
