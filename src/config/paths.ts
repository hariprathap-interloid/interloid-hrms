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
} as const
