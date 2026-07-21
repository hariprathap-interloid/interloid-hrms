import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'

type ErrorStateProps = {
  title: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {message && <p className="text-muted-foreground">{message}</p>}
      <div className="flex gap-2">
        {onRetry && <Button onClick={onRetry}>Try again</Button>}
        <Button variant="outline" asChild>
          <Link to={paths.home.getHref()}>Go back home</Link>
        </Button>
      </div>
    </div>
  )
}
