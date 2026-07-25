import NotFoundPage from './not-found'
import { RoleGate } from '@/features/auth/role-gate'
import { EmployeesScreen } from '@/features/employees/employees-screen'

/**
 * /employees — the workforce directory. Strict design scope (manifest: HR/Admin,
 * with Team Leads viewing read-only): gated to HR + Admin + Lead; any other role
 * (e.g. a plain employee) resolves to the full-page 404. In-screen, `permitActions`
 * further limits Leads to a read-only roster (HR/Admin manage).
 */
export default function EmployeesPage() {
  return (
    <RoleGate allow={['hr', 'admin', 'lead']} fallback={<NotFoundPage />}>
      <EmployeesScreen />
    </RoleGate>
  )
}
