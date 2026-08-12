import { Check, Info } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableBadge } from '@/components/data-table'
import { MATRIX_COLUMNS, MATRIX_ROWS, SCOPE_TONE } from '../data'

/* ---------------------------------------------------------------------------
 * Roles & permissions — `GET /roles`, which is READ-ONLY in Phase 1a. The
 * manifest records no user↔role write endpoint, so this tab presents the
 * capability matrix and offers no edit affordance at all.
 * ------------------------------------------------------------------------- */

export function RolesMatrix() {
  return (
    <>
      <div className="mb-3.5">
        <h2 className="text-foreground text-[17px] font-semibold">Roles &amp; permissions</h2>
        <p className="text-muted-foreground mt-0.5 text-[13px]">
          What each role can do across the suite.
        </p>
      </div>

      <div className="border-info bg-info-subtle mb-4 flex items-start gap-2.5 rounded-[12px] border p-3.5">
        <Info className="text-info-subtle-foreground mt-px size-4 shrink-0" />
        <p className="text-info-subtle-foreground text-[13px]">
          Phase 1a — each user has exactly{' '}
          <strong className="font-semibold">one active role</strong>. Team-Lead approval is a
          toggleable capability, not a separate role.
        </p>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-[12px] border shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow className="border-border bg-muted hover:bg-muted">
                <TableHead className="text-muted-foreground h-10 text-[11.5px] font-semibold">
                  Capability
                </TableHead>
                {MATRIX_COLUMNS.map((column) => (
                  <TableHead
                    key={column}
                    className="text-foreground h-10 text-center text-[11.5px] font-semibold"
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {MATRIX_ROWS.map((row) => (
                <TableRow key={row.capability} className="hover:bg-transparent">
                  <TableCell className="text-foreground text-[13px]">{row.capability}</TableCell>
                  {row.cells.map((cell, index) => (
                    <TableCell key={MATRIX_COLUMNS[index]} className="text-center">
                      {cell === 'yes' ? (
                        <span className="bg-success-subtle text-success-subtle-foreground inline-flex size-[22px] items-center justify-center rounded-full">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                      ) : cell === 'no' ? (
                        <span className="text-border" aria-label="Not permitted">
                          —
                        </span>
                      ) : (
                        <TableBadge tone={SCOPE_TONE[cell] ?? 'neutral'} dot={false}>
                          {cell}
                        </TableBadge>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
