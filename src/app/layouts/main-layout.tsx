import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/theme-toggle'
import { env } from '@/config/env'
import MainLayoutSkeleton from '@/skeletons/main-layout'

export function MainLayout() {
  return (
    <>
      <header className="border-border flex items-center justify-between border-b p-4">
        <span className="text-lg font-semibold">{env.VITE_APP_NAME}</span>
        <ThemeToggle />
      </header>
      <main className="flex-1 overflow-auto">
        <Suspense fallback={<MainLayoutSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </>
  )
}
