import { ThemeToggle } from '@/components/theme-toggle'
import { LoginPanel } from '@/features/auth/components/login-panel'
import { LoginShowcase } from '@/features/auth/components/login-showcase'

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh overflow-hidden">
      <LoginShowcase />
      <div className="bg-background relative flex flex-1 items-center justify-center p-6">
        <div className="absolute top-[18px] right-[18px] z-10">
          <ThemeToggle />
        </div>
        <LoginPanel />
      </div>
    </div>
  )
}
