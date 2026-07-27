import { createBrowserRouter } from 'react-router-dom'
import { paths } from '@/config/paths'
import { ProtectedLayout } from './layouts/protected-layout'
import NotFoundPage from './pages/not-found'
import ServerErrorPage from './pages/server-error'
import HomeLoadingSkeleton from '@/skeletons/home'

const lazy = (loader: () => Promise<{ default: React.ComponentType }>) => () =>
  loader().then((module) => ({ Component: module.default }))

export const router = createBrowserRouter([
  // ----- Public marketing landing at "/" (no shell, no guard). Authenticated
  //       users are redirected to /dashboard from inside the page. -----
  { path: paths.home.path, lazy: lazy(() => import('./pages/home')) },

  // ----- Public auth routes (no shell, no guard) -----
  { path: paths.login.path, lazy: lazy(() => import('./pages/login')) },
  { path: paths.accountSetup.path, lazy: lazy(() => import('./pages/account-setup')) },
  { path: paths.forgotPassword.path, lazy: lazy(() => import('./pages/forgot-password')) },
  { path: paths.resetPassword.path, lazy: lazy(() => import('./pages/reset-password')) },
  { path: paths.sessionExpired.path, lazy: lazy(() => import('./pages/session-expired')) },

  // ----- Protected app (guard + shell) -----
  {
    element: <ProtectedLayout />,
    errorElement: <ServerErrorPage />,
    children: [
      {
        path: paths.dashboard.path,
        lazy: lazy(() => import('./pages/dashboard')),
        HydrateFallback: HomeLoadingSkeleton,
      },
      {
        path: paths.commandCenter.path,
        lazy: lazy(() => import('./pages/command-center')),
        HydrateFallback: HomeLoadingSkeleton,
      },
      {
        path: paths.employees.path,
        lazy: lazy(() => import('./pages/employees')),
        HydrateFallback: HomeLoadingSkeleton,
      },
      {
        path: paths.meProfile.path,
        lazy: lazy(() => import('./pages/my-profile')),
        HydrateFallback: HomeLoadingSkeleton,
      },
      {
        path: paths.meAttendance.path,
        lazy: lazy(() => import('./pages/my-attendance')),
        HydrateFallback: HomeLoadingSkeleton,
      },
      {
        path: paths.meLeave.path,
        lazy: lazy(() => import('./pages/my-leave')),
        HydrateFallback: HomeLoadingSkeleton,
      },
      {
        path: paths.configuration.path,
        lazy: lazy(() => import('./pages/configuration')),
        HydrateFallback: HomeLoadingSkeleton,
      },
      {
        path: paths.auditLog.path,
        lazy: lazy(() => import('./pages/audit-log')),
        HydrateFallback: HomeLoadingSkeleton,
      },
      {
        path: paths.notifications.path,
        lazy: lazy(() => import('./pages/notifications')),
        HydrateFallback: HomeLoadingSkeleton,
      },
      { path: paths.devTokens.path, lazy: lazy(() => import('./pages/dev-tokens')) },
      { path: paths.devComponents.path, lazy: lazy(() => import('./pages/dev-components')) },
      { path: paths.devStates.path, lazy: lazy(() => import('./pages/dev-states')) },
      { path: paths.devTable.path, lazy: lazy(() => import('./pages/dev-table')) },
      { path: paths.devThrow.path, lazy: lazy(() => import('./pages/dev-throw')) },
    ],
  },

  // ----- Full-page 404 fallback -----
  { path: '*', Component: NotFoundPage },
])
