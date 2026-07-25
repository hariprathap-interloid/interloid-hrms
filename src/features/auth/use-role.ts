import { useAuth } from './use-auth'
import type { AppRole } from './demo-users'

/* ---------------------------------------------------------------------------
 * Shared role seam. The design models four roles (Employee · Team Lead · HR
 * Manager · Super Admin) that drive nav + permissions. The role now comes from
 * the signed-in persona (demo-users → resolveUser); it defaults to `hr` only
 * when there is no user (e.g. mid-transition). Consumed by the dashboard's role
 * branch and by `RoleGate` (HR Command Center is hr/admin only).
 * ------------------------------------------------------------------------- */

export type { AppRole } from './demo-users'

export function useRole(): AppRole {
  const { user } = useAuth()
  return user?.role ?? 'hr'
}

export function hasRole(role: AppRole, allowed: readonly AppRole[]): boolean {
  return allowed.includes(role)
}
