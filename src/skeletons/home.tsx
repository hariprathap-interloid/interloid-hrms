import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoadingSkeleton() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-64" />
    </div>
  )
}
