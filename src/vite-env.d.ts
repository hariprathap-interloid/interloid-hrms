/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_THEME_STORAGE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Populated at container start by docker/generate-env-config.sh (see index.html's
// <script src="/env-config.js">, loaded before the app). Lets one built Docker image be
// promoted across environments without a rebuild — see src/config/env.ts and learning.md.
interface Window {
  __ENV__?: {
    VITE_API_URL?: string
  }
}
