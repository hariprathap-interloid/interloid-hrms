import { paths } from '@/config/paths'

describe('paths', () => {
  it('exposes the home route pattern', () => {
    expect(paths.home.path).toBe('/')
  })

  it('builds the home href', () => {
    expect(paths.home.getHref()).toBe('/')
  })
})
