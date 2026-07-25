import type { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { ThemeProvider } from '@/context/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ConfirmProvider } from '@/components/confirm/confirm-provider'
import { AuthProvider } from '@/features/auth/auth-provider'
import { AppErrorFallback } from './error-fallback'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <TooltipProvider>
          <ConfirmProvider>
            <ErrorBoundary FallbackComponent={AppErrorFallback}>{children}</ErrorBoundary>
          </ConfirmProvider>
        </TooltipProvider>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}
