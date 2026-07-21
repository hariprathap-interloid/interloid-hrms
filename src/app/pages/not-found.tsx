import { ErrorState } from '@/components/error-state'

export default function NotFoundPage() {
  return (
    <ErrorState title="404 - Page Not Found" message="The page you're looking for doesn't exist." />
  )
}
