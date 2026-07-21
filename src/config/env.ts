import { z } from 'zod'

const schema = z.object({
  VITE_API_URL: z.url(),
  VITE_APP_NAME: z.string().default('Interloid'),
  VITE_APP_DESCRIPTION: z.string().default('HRMS starter template'),
  VITE_THEME_STORAGE_KEY: z.string().default('hrms-theme'),
})

// VITE_API_URL is the one value that genuinely differs per deployment (dev/stage/prod
// backend), so it can be overridden at container start via window.__ENV__ — see
// vite-env.d.ts and docker/generate-env-config.sh. Everything else stays build-time only.
const runtimeApiUrl = typeof window !== 'undefined' ? window.__ENV__?.VITE_API_URL : undefined

export const env = schema.parse({
  ...import.meta.env,
  VITE_API_URL: runtimeApiUrl || import.meta.env.VITE_API_URL,
})
