import NotFoundPage from './not-found'
import { RoleGate } from '@/features/auth/role-gate'
import { AdminConsoleScreen } from '@/features/admin-console/admin-console-screen'

/**
 * /admin — users, roles & integration settings. Manifest: **"Roles: Admin
 * only."** (matrix "Manage users, roles & integration settings | — | — | — | ✓").
 * No reduced variant exists, so this is a pure route gate: HR and every role
 * below take the design's "forbidden URL → Not found" rule via the 404 fallback.
 *
 * The design file's in-screen "Restricted area · 403 · forbidden" panel is
 * standalone-demo scaffolding driven by its own role switcher — the manifest
 * grants no exception to the 404 rule (see hrms-dev.md, 2026-07-27), so it is
 * deliberately not built.
 */
export default function AdminConsolePage() {
  return (
    <RoleGate allow={['admin']} fallback={<NotFoundPage />}>
      <AdminConsoleScreen />
    </RoleGate>
  )
}
