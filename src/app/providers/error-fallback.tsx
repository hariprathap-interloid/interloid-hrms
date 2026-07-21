import type { FallbackProps } from 'react-error-boundary'
import { ErrorState } from '@/components/error-state'

export function AppErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="Something went wrong"
      message={error instanceof Error ? error.message : 'An unexpected error occurred.'}
      onRetry={resetErrorBoundary}
    />
  )
}
