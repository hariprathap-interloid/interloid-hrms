import NotFoundPage from './not-found'
import { RoleGate } from '@/features/auth/role-gate'
import { AuditLogScreen } from '@/features/audit-log/audit-log-screen'

/**
 * /audit-log — the append-only change record. Manifest scopes it to
 * **"Roles: HR (scoped), Admin (full)"**, so both managers may view it and the
 * *screen* applies the scoping (HR loses the Super-Admin entity types and gets a
 * banner saying so). Employee and Team Lead have no audit-log capability at all
 * — matrix row "Audit log | — | — | Scoped | ✓ (full)" — so they take the
 * design's "forbidden URL → Not found" rule via the 404 fallback.
 */
export default function AuditLogPage() {
  return (
    <RoleGate allow={['hr', 'admin']} fallback={<NotFoundPage />}>
      <AuditLogScreen />
    </RoleGate>
  )
}
