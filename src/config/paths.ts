export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },
  login: {
    path: '/login',
    getHref: () => '/login',
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
} as const
