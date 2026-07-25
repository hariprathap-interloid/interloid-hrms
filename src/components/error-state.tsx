import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'
import { useAuth } from '@/features/auth/use-auth'

type ErrorStateProps = {
  title: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  // Target depends on auth: an authenticated user returns to their dashboard;
  // a pre-auth error falls back to the public landing. (Both AppErrorFallback
  // and the route errorElement render inside AuthProvider, so useAuth is safe.)
  const { status } = useAuth()
  const authed = status === 'authenticated'
  const backHref = authed ? paths.dashboard.getHref() : paths.home.getHref()
  const backLabel = authed ? 'Back to dashboard' : 'Go back home'

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {message && <p className="text-muted-foreground">{message}</p>}
      <div className="flex gap-2">
        {onRetry && <Button onClick={onRetry}>Try again</Button>}
        <Button variant="outline" asChild>
          <Link to={backHref}>{backLabel}</Link>
        </Button>
      </div>
    </div>
  )
}
