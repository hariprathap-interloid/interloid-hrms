import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { DonutChart } from '@/components/charts'
import {
  DataView,
  DataViewList,
  EmptyState,
  SkeletonKpis,
  SkeletonRows,
  type DataViewStatus,
} from '@/components/data-view'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useConfirm } from '@/components/confirm/use-confirm'
import { useAuth } from '@/features/auth/use-auth'
import { cn } from '@/lib/utils'
import {
  buildBalances,
  DEMO_HISTORY,
  LEAVE_TYPES,
  type LeaveBalance,
  type LeaveRequest,
  type LeaveStatus,
} from './data'

/* ---------------------------------------------------------------------------
 * My Leave (design: My Leave.dc.html) at /me/leave — all roles. Balance rings
 * (DonutChart) + a request form + history (DataViewList). The available balance
 * per type is the persona's (resolveUser → user.leaveBalance); ⚠ the ledger and
 * request history are demo (see ./data). Cancel is a direct action + toast (the
 * design's confirm AlertDialog is simplified — no ui/alert-dialog primitive).
 * ------------------------------------------------------------------------- */

const STATUS_CHIP: Record<LeaveStatus, string> = {
  pending: 'bg-warning-subtle text-warning-subtle-foreground',
  approved: 'bg-success-subtle text-success-subtle-foreground',
  rejected: 'bg-destructive-subtle text-destructive-subtle-foreground',
  cancelled: 'bg-muted text-muted-foreground',
}

export function MyLeaveScreen() {
  const { user } = useAuth()
  const confirm = useConfirm()
  const balances = useMemo(() => (user ? buildBalances(user.leaveBalance) : []), [user])

  const [status, setStatus] = useState<DataViewStatus>('loading')
  const [history, setHistory] = useState<LeaveRequest[]>(DEMO_HISTORY)

  useEffect(() => {
    const id = setTimeout(() => setStatus('populated'), 500)
    return () => clearTimeout(id)
  }, [])

  const requestCancel = (request: LeaveRequest) => {
    confirm({
      title: 'Cancel this leave?',
      description: `${request.days} ${request.days === 1 ? 'day' : 'days'} will return to your balance.`,
      confirmLabel: 'Cancel leave',
      cancelLabel: 'Keep it',
      tone: 'destructive',
      onConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 700)) // simulate the server call
        setHistory((prev) =>
          prev.map((r) => (r.id === request.id ? { ...r, status: 'cancelled' } : r)),
        )
        toast('Leave request cancelled · days returned to your balance')
      },
    })
  }

  const addRequest = (request: LeaveRequest) => setHistory((prev) => [request, ...prev])

  const viewStatus: DataViewStatus =
    status === 'loading' ? 'loading' : history.length > 0 ? 'populated' : 'empty'

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 lg:p-10">
      <PageHeader title="Leave" description="Balances, requests and history · 2026" />

      {/* Balance rings */}
      {status === 'loading' ? (
        <SkeletonKpis cards={3} className="grid-cols-1 gap-4 sm:grid-cols-3" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {balances.map((balance) => (
            <BalanceCard key={balance.key} balance={balance} />
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.35fr]">
        <RequestForm balances={balances} onSubmit={addRequest} />

        <section className="border-border bg-card overflow-hidden rounded-[14px] border shadow-sm">
          <div className="border-border border-b px-5 py-4">
            <div className="text-foreground text-[14px] font-semibold">Leave history</div>
          </div>
          <DataViewList className="rounded-none border-0 shadow-none">
            <DataView
              status={viewStatus}
              loading={<SkeletonRows rows={4} withStatus />}
              empty={
                <EmptyState
                  title="No requests yet"
                  description="Apply for leave and it will show up here."
                />
              }
            >
              {history.map((request) => (
                <HistoryRow
                  key={request.id}
                  request={request}
                  onCancel={() => requestCancel(request)}
                />
              ))}
            </DataView>
          </DataViewList>
        </section>
      </div>
    </div>
  )
}

function BalanceCard({ balance }: { balance: LeaveBalance }) {
  return (
    <div className="border-border bg-card rounded-[14px] border p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <DonutChart
          className="w-auto"
          showLegend={false}
          centerValue={String(balance.available)}
          centerLabel="left"
          data={[
            { label: 'Available', value: balance.available, color: balance.color },
            { label: 'Used', value: balance.used, color: 'var(--muted)' },
          ]}
        />
        <div className="min-w-0 flex-1">
          <div className="text-foreground text-[14px] font-semibold">{balance.label}</div>
          <div className="text-muted-foreground mt-2 flex flex-col gap-1 text-[12.5px]">
            <Ledger label="Opening" value={balance.opening} />
            <Ledger
              label="Accrued"
              value={`+${balance.accrued}`}
              tone="text-success-subtle-foreground"
            />
            <Ledger
              label="Used"
              value={`−${balance.used}`}
              tone="text-destructive-subtle-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Ledger({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className={cn('text-foreground font-medium tabular-nums', tone)}>{value}</span>
    </div>
  )
}

function HistoryRow({ request, onCancel }: { request: LeaveRequest; onCancel: () => void }) {
  const cancellable = request.status === 'pending' || request.status === 'approved'
  return (
    <div className="border-border flex items-center gap-3 border-t px-5 py-3.5">
      <div className="min-w-0 flex-1">
        <div className="text-foreground text-[13.5px] font-medium">
          {request.type} ·{' '}
          <span className="text-muted-foreground font-normal">{request.dates}</span>
        </div>
        <div className="text-muted-foreground font-mono text-[11px]">
          {request.id} · {request.days} {request.days === 1 ? 'day' : 'days'}
        </div>
      </div>
      <span
        className={cn(
          'shrink-0 rounded-full px-2.5 py-[3px] text-[11.5px] font-semibold capitalize',
          STATUS_CHIP[request.status],
        )}
      >
        {request.status}
      </span>
      {cancellable && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 shrink-0 text-[12.5px]"
          onClick={onCancel}
        >
          Cancel
        </Button>
      )}
    </div>
  )
}

function RequestForm({
  balances,
  onSubmit,
}: {
  balances: LeaveBalance[]
  onSubmit: (request: LeaveRequest) => void
}) {
  const [type, setType] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [halfDay, setHalfDay] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const days = useMemo(() => {
    if (!start) return 0
    const from = new Date(start)
    const to = new Date(end || start)
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) return 0
    const raw = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1
    return Math.max(0.5, halfDay ? raw - 0.5 : raw)
  }, [start, end, halfDay])

  const available = balances.find((b) => b.label === type)?.available

  const submit = () => {
    if (!type || !start || !reason.trim() || days <= 0) {
      setError('Pick a leave type, dates and a reason.')
      return
    }
    if (available !== undefined && days > available) {
      setError(
        `Insufficient balance — ${type} has ${available} day${available === 1 ? '' : 's'} left.`,
      )
      return
    }
    setError('')
    const id = `LR-${2042 + Math.floor(days)}`
    onSubmit({
      id,
      type,
      dates: end && end !== start ? `${short(start)}–${short(end)}` : short(start),
      days,
      status: 'pending',
    })
    toast.success(`${id} submitted · ${days} ${days === 1 ? 'day' : 'days'}`)
    setType('')
    setStart('')
    setEnd('')
    setHalfDay(false)
    setReason('')
  }

  return (
    <section className="border-border bg-card flex flex-col gap-4 rounded-[14px] border p-5 shadow-sm">
      <div className="text-foreground text-[14px] font-semibold">Request leave</div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-[13px]">Leave type</Label>
        <Select
          value={type}
          onValueChange={(value) => {
            setType(value)
            setError('')
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            {LEAVE_TYPES.map((leaveType) => (
              <SelectItem key={leaveType} value={leaveType}>
                {leaveType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="leave-start" className="text-[13px]">
            Start
          </Label>
          <Input
            id="leave-start"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="leave-end" className="text-[13px]">
            End
          </Label>
          <Input id="leave-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="half-day" className="text-[13px]">
          Half day (0.5)
        </Label>
        <Switch id="half-day" checked={halfDay} onCheckedChange={setHalfDay} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="leave-reason" className="text-[13px]">
          Reason
        </Label>
        <Textarea
          id="leave-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Add a short reason…"
          rows={3}
        />
      </div>

      {error && <p className="text-destructive-subtle-foreground text-[12.5px]">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-[12.5px]">
          Duration{' '}
          <span className="text-foreground bg-primary-bg ml-1 rounded-full px-2 py-0.5 font-semibold tabular-nums">
            {days} {days === 1 ? 'day' : 'days'}
          </span>
        </span>
        <Button onClick={submit} disabled={!type || !start || !reason.trim()}>
          Submit request
        </Button>
      </div>
    </section>
  )
}

function short(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}
