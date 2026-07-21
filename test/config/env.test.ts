import { env } from '@/config/env'

// env.ts computes `env` once at import time, so testing the window.__ENV__ override branch
// needs a fresh module instance per scenario. jest.resetModules() clears Jest's module
// registry, so the next dynamic import() re-evaluates env.ts against whatever
// window.__ENV__ is set to at that moment, independent of the module-level `env` above.
async function importEnvFresh() {
  jest.resetModules()
  return import('@/config/env')
}

describe('env', () => {
  afterEach(() => {
    delete window.__ENV__
  })

  it('uses the build-time VITE_API_URL when no runtime override is present', () => {
    expect(env.VITE_API_URL).toBe(process.env.VITE_API_URL)
  })

  it('prefers window.__ENV__.VITE_API_URL when the container injected one at runtime', async () => {
    window.__ENV__ = { VITE_API_URL: 'https://runtime-override.example.com' }

    const fresh = await importEnvFresh()

    expect(fresh.env.VITE_API_URL).toBe('https://runtime-override.example.com')
  })

  it('falls back to the build-time value when window.__ENV__.VITE_API_URL is empty', async () => {
    window.__ENV__ = { VITE_API_URL: '' }

    const fresh = await importEnvFresh()

    expect(fresh.env.VITE_API_URL).toBe(process.env.VITE_API_URL)
  })
})
