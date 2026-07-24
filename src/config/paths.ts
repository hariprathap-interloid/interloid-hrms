export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
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
} as const
