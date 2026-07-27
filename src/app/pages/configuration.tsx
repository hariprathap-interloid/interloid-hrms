import NotFoundPage from './not-found'
import { RoleGate } from '@/features/auth/role-gate'
import { ConfigurationScreen } from '@/features/configuration/configuration-screen'

/**
 * /configuration — org setup. Manifest scopes it to **"Roles: HR (partial —
 * depts/shifts/leave types/holidays), Admin (full incl. org settings)"**, so
 * both managers may view it and the *screen* applies HR's partial scope (the
 * Org settings section is locked and read-only, not hidden). Employee and Team
 * Lead have no configure capability — matrix row "Configure depts / shifts /
 * leave types / holidays | — | — | Partial | ✓ (full)" — so they take the
 * design's "forbidden URL → Not found" rule via the 404 fallback.
 */
export default function ConfigurationPage() {
  return (
    <RoleGate allow={['hr', 'admin']} fallback={<NotFoundPage />}>
      <ConfigurationScreen />
    </RoleGate>
  )
}
