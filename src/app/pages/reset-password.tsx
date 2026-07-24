import { KeyRound, LockKeyhole, Shield, ShieldCheck } from 'lucide-react'
import { AuthShowcase, AuthTwoPane, ShowcaseTrust } from '@/features/auth/components/auth-shell'
import { ResetPasswordPanel } from '@/features/auth/components/reset-password-panel'

export default function ResetPasswordPage() {
  return (
    <AuthTwoPane
      showcase={
        <AuthShowcase
          headline="One strong password, and you’re back to work."
          subtitle="Pick something you haven’t used before. For your security, updating your password signs out every other active session."
          proofs={[
            {
              icon: <KeyRound />,
              title: 'Unique to your account',
              desc: 'Avoid passwords reused on other sites',
            },
            {
              icon: <LockKeyhole />,
              title: 'Signs out other sessions',
              desc: 'Everywhere else is logged out instantly',
            },
            {
              icon: <ShieldCheck />,
              title: 'Breach-checked',
              desc: 'Rejected if seen in a known data breach',
            },
          ]}
          trust={
            <ShowcaseTrust
              icon={<Shield />}
              title="Checked against breaches"
              desc="Passwords are hashed and never stored in plain text."
            />
          }
        />
      }
    >
      <ResetPasswordPanel />
    </AuthTwoPane>
  )
}
