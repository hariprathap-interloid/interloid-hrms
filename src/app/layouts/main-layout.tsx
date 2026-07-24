import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import MainLayoutSkeleton from '@/skeletons/main-layout'

export function MainLayout() {
  return (
    <AppShell>
      <Suspense fallback={<MainLayoutSkeleton />}>
        <Outlet />
      </Suspense>
    </AppShell>
  )
}
