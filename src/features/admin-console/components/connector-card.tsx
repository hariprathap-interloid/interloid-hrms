import { useState } from 'react'
import { Check, Clock, KeyRound, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MonoText } from '@/components/data-table'
import { StatusPill } from '@/components/data-view'
import { cn } from '@/lib/utils'
import type { Connector } from '../data'

/* ---------------------------------------------------------------------------
 * Integration connector card. Entirely unbacked — the manifest records that the
 * eTimeOffice connection config (credentials / test-connection / schedule) has
 * **no spec endpoints**, so Test and Save are local-only stubs here.
 *
 * Secrets are write-only: the field never renders a stored value, and the
 * placeholder says so.
 * ------------------------------------------------------------------------- */

type TestState = 'idle' | 'testing' | 'ok'

export function ConnectorCard({ connector }: { connector: Connector }) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [test, setTest] = useState<TestState>('idle')

  const failing = connector.status === 'error' && test !== 'ok'

  const runTest = () => {
    if (test === 'testing') return
    setTest('testing')
    setTimeout(() => {
      setTest('ok')
      toast.success(`Connection OK · ${connector.key}`)
      setTimeout(() => setTest('idle'), 1400)
    }, 1100)
  }

  const save = () => {
    setValues({})
    toast.success(`${connector.key} credentials updated`)
  }

  return (
    <section className="border-border bg-card overflow-hidden rounded-[14px] border shadow-sm">
      <div className="border-border flex items-center gap-3 border-b px-[18px] py-4">
        <span
          className={cn(
            'flex size-[42px] shrink-0 items-center justify-center rounded-[11px] [&_svg]:size-5',
            connector.status === 'connected'
              ? 'bg-info-subtle text-info-subtle-foreground'
              : 'bg-warning-subtle text-warning-subtle-foreground',
          )}
        >
          {connector.status === 'connected' ? <KeyRound /> : <Clock />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-foreground text-[15px] font-semibold">{connector.name}</div>
          <div className="text-muted-foreground text-[12px]">{connector.subtitle}</div>
        </div>
        <StatusPill tone={connector.status === 'connected' ? 'success' : 'destructive'}>
          {connector.status === 'connected' ? 'Connected' : 'Error'}
        </StatusPill>
      </div>

      <div className="flex flex-col gap-3.5 px-[18px] py-4">
        <div className="text-muted-foreground flex justify-between text-[12px]">
          <span>Last check</span>
          <MonoText>{connector.lastCheck}</MonoText>
        </div>

        {failing && connector.errorText && (
          <div className="border-destructive bg-destructive-subtle flex items-center gap-2 rounded-[9px] border px-3 py-2">
            <TriangleAlert className="text-destructive-subtle-foreground size-3.5 shrink-0" />
            <span className="text-destructive-subtle-foreground font-mono text-[12px]">
              {connector.errorText}
            </span>
          </div>
        )}

        <div className="bg-border h-px" />

        {connector.fields.map((field) => {
          const id = `conn-${connector.key}-${field.key}`
          return (
            <div key={field.key}>
              <Label htmlFor={id} className="mb-1.5 flex items-center gap-1.5 text-[12px]">
                {field.label}
                <span className="bg-success-subtle text-success-subtle-foreground inline-flex items-center gap-1 rounded-full px-[7px] py-px text-[10px] font-semibold">
                  <Check className="size-2.5" strokeWidth={3} />
                  Saved
                </span>
              </Label>
              <Input
                id={id}
                type={field.secret ? 'password' : 'text'}
                autoComplete="off"
                className={cn(field.secret && 'font-mono')}
                placeholder={
                  field.secret ? '•••••••••••• (leave blank to keep)' : (field.placeholder ?? '')
                }
                value={values[field.key] ?? ''}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                }
              />
              {field.secret && (
                <p className="text-muted-foreground mt-1 text-[10.5px]">
                  Write-only — never displayed again after saving.
                </p>
              )}
            </div>
          )
        })}

        <div className="mt-0.5 flex gap-2.5">
          <Button
            variant="outline"
            className={cn(
              'flex-1',
              test === 'ok' && 'bg-success-subtle text-success-subtle-foreground',
            )}
            onClick={runTest}
            disabled={test === 'testing'}
          >
            {test === 'testing' ? (
              <>
                <span className="border-muted-foreground size-3.5 animate-spin rounded-full border-2 border-t-transparent" />
                Testing…
              </>
            ) : test === 'ok' ? (
              <>
                <Check />
                Connected
              </>
            ) : (
              'Test connection'
            )}
          </Button>
          <Button className="flex-1" onClick={save}>
            Save credentials
          </Button>
        </div>
      </div>
    </section>
  )
}
