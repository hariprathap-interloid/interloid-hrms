import { AuthCentered } from '@/features/auth/components/auth-shell'
import { AccountSetupPanel } from '@/features/auth/components/account-setup-panel'

export default function AccountSetupPage() {
  return (
    <AuthCentered footer="Invited by HR · Interloid Workforce Suite">
      <AccountSetupPanel />
    </AuthCentered>
  )
}
