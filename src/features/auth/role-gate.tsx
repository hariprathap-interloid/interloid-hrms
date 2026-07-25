import type { ReactNode } from 'react'
import { hasRole, useRole, type AppRole } from './use-role'

/* ---------------------------------------------------------------------------
 * RoleGate — route/section access by role. Renders `children` when the current
 * role is allowed, else `fallback`. Per the States spec, a forbidden URL
 * resolves to the full-page 404 (not an inline 403), so callers pass the
 * NotFound page as `fallback`. `fallback` is a prop (not an import) to keep this
 * auth feature decoupled from the app's page layer.
 * ------------------------------------------------------------------------- */

export function RoleGate({
  allow,
  fallback,
  children,
}: {
  allow: readonly AppRole[]
  fallback: ReactNode
  children: ReactNode
}) {
  const role = useRole()
  return hasRole(role, allow) ? <>{children}</> : <>{fallback}</>
}
