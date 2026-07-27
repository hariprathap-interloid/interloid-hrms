import NotFoundPage from './not-found'
import { RoleGate } from '@/features/auth/role-gate'
import { EmployeesScreen } from '@/features/employees/employees-screen'

/**
 * /employees — the workforce directory. Manifest scopes it to **HR + Admin only**
 * ("Roles: HR, Admin"); every other role — Team Lead and Employee alike — hits the
 * design's "forbidden URL → Not found" rule via the 404 fallback. Lead's people
 * view is a separate route, Team Overview (/team), not this directory.
 */
export default function EmployeesPage() {
  return (
    <RoleGate allow={['hr', 'admin']} fallback={<NotFoundPage />}>
      <EmployeesScreen />
    </RoleGate>
  )
}
