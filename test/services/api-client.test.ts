import { apiFetch } from '@/services/api-client'
import { env } from '@/config/env'

// In tests, import.meta.env.DEV is undefined (see babel-plugin-transform-import-meta-env),
// so apiFetch takes the production branch and calls VITE_API_URL directly.
const base = env.VITE_API_URL.replace(/\/$/, '')

const fetchMock = jest.fn().mockResolvedValue({ ok: true })

describe('apiFetch', () => {
  beforeEach(() => {
    fetchMock.mockClear()
    globalThis.fetch = fetchMock
  })

  it('calls the API base URL with the given path and sends credentials', async () => {
    await apiFetch('/employees')

    expect(fetchMock).toHaveBeenCalledWith(
      `${base}/employees`,
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('adds a leading slash when the path is missing one', async () => {
    await apiFetch('employees')

    expect(fetchMock).toHaveBeenCalledWith(`${base}/employees`, expect.anything())
  })

  it('forwards caller-supplied init options', async () => {
    await apiFetch('/employees', { method: 'POST' })

    expect(fetchMock).toHaveBeenCalledWith(
      `${base}/employees`,
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
  })
})
