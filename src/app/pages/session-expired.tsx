import { useSearchParams } from 'react-router-dom'
import { AuthCentered } from '@/features/auth/components/auth-shell'
import { SessionExpiredCard } from '@/features/auth/components/session-expired-card'

export default function SessionExpiredPage() {
  const [searchParams] = useSearchParams()
  const variant = searchParams.get('variant') === 'locked' ? 'locked' : 'expired'
  const footer =
    variant === 'locked'
      ? 'Locked after 5 failed attempts · Interloid Workforce Suite'
      : 'Sessions expire after 8h idle · Interloid Workforce Suite'

  return (
    <AuthCentered footer={footer}>
      <SessionExpiredCard variant={variant} />
    </AuthCentered>
  )
}
