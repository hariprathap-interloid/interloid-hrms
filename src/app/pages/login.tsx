import { AuthTwoPane } from '@/features/auth/components/auth-shell'
import { LoginPanel } from '@/features/auth/components/login-panel'
import { LoginShowcase } from '@/features/auth/components/login-showcase'

export default function LoginPage() {
  return (
    <AuthTwoPane showcase={<LoginShowcase />}>
      <LoginPanel />
    </AuthTwoPane>
  )
}
