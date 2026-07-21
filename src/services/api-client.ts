import { env } from '@/config/env'

// Dev: fixed marker rewritten by Vite's dev proxy (server.proxy in vite.config.ts) to the real
// API path, whatever it is — avoids CORS while developing. Prod: full URL, relying on the
// backend's own CORS config — this works regardless of where the frontend ends up hosted.
const baseUrl = import.meta.env.DEV ? '/__api' : env.VITE_API_URL.replace(/\/$/, '')

export function apiFetch(path: string, init?: RequestInit) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return fetch(`${baseUrl}${normalizedPath}`, {
    credentials: 'include',
    ...init,
  })
}
