import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { ErrorState } from '@/components/error-state'

export default function ErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return <ErrorState title={`${error.status} - ${error.statusText}`} />
  }

  return (
    <ErrorState
      title="Something went wrong"
      message="An unexpected error occurred. Please try again."
    />
  )
}
