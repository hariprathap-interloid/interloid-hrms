import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { DonutChart } from '@/components/charts'
import {
  DataView,
  DataViewList,
  EmptyState,
  ErrorState,
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
 * request history are demo (see ./data). Cancel routes through the shared Confirm
 * dialog (ui/alert-dialog via ConfirmProvider), per the States spec.
 * ------------------------------------------------------------------------- */

const STATUS_CHIP: Record<LeaveStatus, string> = {
  pending: 'bg-warning-subtle text-warning-subtle-foreground',
  approved: 'bg-success-subtle text-success-subtle-foreground',
  rejected: 'bg-destructive-subtle text-destructive-subtle-foreground',
  cancelled: 'bg-muted text-muted-foreground',
}

const STATUS_DOT: Record<LeaveStatus, string> = {
  pending: 'bg-warning',
  approved: 'bg-success',
  rejected: 'bg-destructive',
  cancelled: 'bg-muted-foreground',
}

export function MyLeaveScreen() {
  const { user } = useAuth()
  const confirm = useConfirm()
  const balances = useMemo(() => (user ? buildBalances(user.leaveBalance) : []), [user])

  const [searchParams] = useSearchParams()
  const forceError = searchParams.get('state') === 'error'
  const [status, setStatus] = useState<DataViewStatus>('loading')
  const [history, setHistory] = useState<LeaveRequest[]>(DEMO_HISTORY)
  const [reloadKey, setReloadKey] = useState(0)
  const [recovered, setRecovered] = useState(false)

  useEffect(() => {
    // Simulated history fetch. `?state=error` forces the failure once so the
    // error+Retry path is reachable; Retry then recovers to the populated list.
    const id = setTimeout(() => {
      setStatus(forceError && !recovered ? 'error' : 'populated')
    }, 500)
    return () => clearTimeout(id)
  }, [forceError, recovered, reloadKey])

  const retryHistory = () => {
    setRecovered(true)
    setStatus('loading')
    setReloadKey((key) => key + 1)
  }

  const requestCancel = (request: LeaveRequest) => {
    confirm({
      title: 'Cancel this leave?',
      description: `${request.type} · ${request.dates} (${request.days} ${request.days === 1 ? 'day' : 'days'}). This can’t be undone — the days return to your balance.`,
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

  // Monotonic request-id sequence, seeded past the highest demo id so new
  // requests never collide (two same-duration requests used to map to one id).
  const idSeq = useRef(
    DEMO_HISTORY.reduce((max, request) => {
      const n = Number(request.id.replace(/\D/g, ''))
      return Number.isFinite(n) ? Math.max(max, n) : max
    }, 2050),
  )

  const addRequest = (payload: Omit<LeaveRequest, 'id'>) => {
    idSeq.current += 1
    const id = `LR-${idSeq.current}`
    setHistory((prev) => [{ id, ...payload }, ...prev])
    toast.success(`${id} submitted · ${payload.days} ${payload.days === 1 ? 'day' : 'days'}`)
  }

  const viewStatus: DataViewStatus =
    status === 'loading'
      ? 'loading'
      : status === 'error'
        ? 'error'
        : history.length > 0
          ? 'populated'
          : 'empty'

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
                  icon={<CalendarDays />}
                  title="No requests yet"
                  description="Apply for leave using the form and it will show up here."
                  action={
                    <Button
                      variant="outline"
                      onClick={() =>
                        document
                          .getElementById('leave-apply-form')
                          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                    >
                      Apply for leave
                    </Button>
                  }
                />
              }
              error={
                <ErrorState
                  title="Couldn't load your leave history"
                  description="The leave service didn't respond. Check your connection and try again."
                  code="503 · service_unavailable"
                  action={
                    <Button variant="outline" onClick={retryHistory}>
                      <RefreshCw />
                      Retry
                    </Button>
                  }
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
          'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11.5px] font-semibold capitalize',
          STATUS_CHIP[request.status],
        )}
      >
        <span className={cn('size-1.5 rounded-full', STATUS_DOT[request.status])} />
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
  onSubmit: (request: Omit<LeaveRequest, 'id'>) => void
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
    onSubmit({
      type,
      dates: end && end !== start ? `${short(start)}–${short(end)}` : short(start),
      days,
      status: 'pending',
    })
    setType('')
    setStart('')
    setEnd('')
    setHalfDay(false)
    setReason('')
  }

  return (
    <section
      id="leave-apply-form"
      className="border-border bg-card flex flex-col gap-4 rounded-[14px] border p-5 shadow-sm"
    >
      <div className="text-foreground text-[14px] font-semibold">Request leave</div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-[13px]">
          Leave type <span className="text-destructive">*</span>
        </Label>
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

      <div className="bg-muted/40 flex items-center justify-between rounded-[10px] px-3 py-2.5">
        <div>
          <Label htmlFor="half-day" className="text-[13px]">
            Half day
          </Label>
          <div className="text-muted-foreground text-[11.5px]">Counts as 0.5 day</div>
        </div>
        <Switch id="half-day" checked={halfDay} onCheckedChange={setHalfDay} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="leave-reason" className="text-[13px]">
          Reason <span className="text-destructive">*</span>
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
            {days > 0 ? `${days} ${days === 1 ? 'day' : 'days'}` : '—'}
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
