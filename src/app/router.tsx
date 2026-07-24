import { createBrowserRouter } from 'react-router-dom'
import { paths } from '@/config/paths'
import { MainLayout } from './layouts/main-layout'
import ErrorPage from './pages/error'
import NotFoundPage from './pages/not-found'
import HomeLoadingSkeleton from '@/skeletons/home'

export const router = createBrowserRouter([
  {
    // Auth screen — standalone, outside the app shell (no sidebar / top bar).
    path: paths.login.path,
    errorElement: <ErrorPage />,
    lazy: () => import('./pages/login').then((module) => ({ Component: module.default })),
  },
  {
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: paths.home.path,
        lazy: () => import('./pages/home').then((module) => ({ Component: module.default })),
        HydrateFallback: HomeLoadingSkeleton,
      },
      {
        path: paths.devTokens.path,
        lazy: () => import('./pages/dev-tokens').then((module) => ({ Component: module.default })),
      },
      {
        path: paths.devComponents.path,
        lazy: () =>
          import('./pages/dev-components').then((module) => ({ Component: module.default })),
      },
      {
        path: paths.devStates.path,
        lazy: () => import('./pages/dev-states').then((module) => ({ Component: module.default })),
      },
      {
        path: paths.devTable.path,
        lazy: () => import('./pages/dev-table').then((module) => ({ Component: module.default })),
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
