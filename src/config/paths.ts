export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },
  dashboard: {
    path: '/dashboard',
    getHref: () => '/dashboard',
  },
  login: {
    path: '/login',
    getHref: () => '/login',
  },
  accountSetup: {
    path: '/account-setup',
    getHref: () => '/account-setup',
  },
  forgotPassword: {
    path: '/forgot-password',
    getHref: () => '/forgot-password',
  },
  resetPassword: {
    path: '/reset-password',
    getHref: () => '/reset-password',
  },
  sessionExpired: {
    path: '/session-expired',
    getHref: () => '/session-expired',
  },
  devTokens: {
    path: '/dev/tokens',
    getHref: () => '/dev/tokens',
  },
  devComponents: {
    path: '/dev/components',
    getHref: () => '/dev/components',
  },
  devStates: {
    path: '/dev/states',
    getHref: () => '/dev/states',
  },
  devTable: {
    path: '/dev/table',
    getHref: () => '/dev/table',
  },
  devThrow: {
    path: '/dev/throw',
    getHref: () => '/dev/throw',
  },
} as const
