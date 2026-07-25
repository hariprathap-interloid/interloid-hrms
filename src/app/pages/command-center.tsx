import NotFoundPage from './not-found'
import { RoleGate } from '@/features/auth/role-gate'
import { CommandCenterScreen } from '@/features/hr-command-center/command-center-screen'

/**
 * /command-center — HR Command Center. Gated to HR + Admin via the role seam;
 * any other role resolves to the full-page 404 (per the States spec: a
 * forbidden URL falls back to Not Found, not an inline 403).
 */
export default function CommandCenterPage() {
  return (
    <RoleGate allow={['hr', 'admin']} fallback={<NotFoundPage />}>
      <CommandCenterScreen />
    </RoleGate>
  )
}
