import { Navigate } from 'react-router-dom'
import { paths } from '@/config/paths'
import { useAuth } from '@/features/auth/use-auth'
import { MarketingHome } from '@/features/marketing/marketing-home'

/**
 * "/" — public marketing landing. An already-authenticated visitor is sent
 * straight to their dashboard; everyone else sees the marketing page.
 */
export default function HomePage() {
  const { status } = useAuth()

  if (status === 'authenticated') {
    return <Navigate to={paths.dashboard.getHref()} replace />
  }
  return <MarketingHome />
}
