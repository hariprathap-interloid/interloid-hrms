import { KeyRound, Shield, ShieldCheck, Sparkles } from 'lucide-react'
import { AuthShowcase, AuthTwoPane, ShowcaseTrust } from '@/features/auth/components/auth-shell'
import { ForgotPasswordPanel } from '@/features/auth/components/forgot-password-panel'

export default function ForgotPasswordPage() {
  return (
    <AuthTwoPane
      showcase={
        <AuthShowcase
          headline="Locked out for a minute? We’ll get you back in."
          subtitle="Reset links are single-use and expire in 30 minutes. If your account uses Microsoft SSO, sign in with Microsoft instead — no password needed."
          proofs={[
            {
              icon: <KeyRound />,
              title: 'Single-use reset links',
              desc: 'Each link works once and expires in 30 min',
            },
            {
              icon: <ShieldCheck />,
              title: 'Rate-limited & logged',
              desc: 'Requests are throttled and audit-trailed',
            },
            {
              icon: <Sparkles />,
              title: 'Prefer SSO?',
              desc: 'Microsoft Entra sign-in needs no password',
            },
          ]}
          trust={
            <ShowcaseTrust
              icon={<Shield />}
              title="Your data stays protected"
              desc="Reset requests are rate-limited and logged for audit."
            />
          }
        />
      }
    >
      <ForgotPasswordPanel />
    </AuthTwoPane>
  )
}
