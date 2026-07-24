import { Navigate } from 'react-router-dom'
import { paths } from '@/config/paths'
import { useAuth } from '@/features/auth/use-auth'
import { MainLayout } from './main-layout'

/**
 * Route guard for the authenticated app. Reads the stubbed auth session:
 * `expired` sends the user to the re-auth screen (reachable from here, not just
 * by typing the URL); anything other than `authenticated` sends them to /login.
 */
export function ProtectedLayout() {
  const { status } = useAuth()

  if (status === 'expired') {
    return <Navigate to={paths.sessionExpired.getHref()} replace />
  }
  if (status !== 'authenticated') {
    return <Navigate to={paths.login.getHref()} replace />
  }
  return <MainLayout />
}
