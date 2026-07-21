import { Skeleton } from '@/components/ui/skeleton'

// Fixed-length placeholder lists — generated once at module load, not per render,
// so each skeleton block gets a stable key without deriving it from array index.
const STAT_CARD_IDS = Array.from({ length: 4 }, () => crypto.randomUUID())
const TABLE_ROW_IDS = Array.from({ length: 6 }, () => crypto.randomUUID())

export default function MainLayoutSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header Skeleton */}
      <header className="border-border flex items-center justify-between border-b p-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 space-y-6 p-6">
        {/* Page Title */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_CARD_IDS.map((id) => (
            <div key={id} className="border-border space-y-3 rounded-lg border p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Table/List Skeleton */}
        <div className="border-border space-y-4 rounded-lg border p-6">
          <Skeleton className="h-6 w-48" />

          {TABLE_ROW_IDS.map((id) => (
            <div key={id} className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-3 w-36" />
              </div>

              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
