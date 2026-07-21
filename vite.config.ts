import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = new URL(env.VITE_API_URL)
  const apiPath = apiUrl.pathname.replace(/\/$/, '') // '' when the API lives at the domain root

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      // Emits pre-compressed .gz and .br siblings for every eligible asset. Brotli
      // compresses smaller than gzip for the same content. Static hosts that serve
      // pre-compressed files automatically (Vercel/Netlify/CloudFront) pick .br up with no
      // extra config. nginx (this repo's Docker setup) is NOT wired to serve .br — stock
      // nginx:alpine has no brotli module, so nginx.conf intentionally stays gzip-only. See
      // learning.md before adding `brotli_static` to nginx.conf.
      //
      // Uses vite-plugin-compression2, not the unmaintained vite-plugin-compression: the
      // latter keeps its dedup cache at module scope, so running it twice (once per
      // algorithm) in the same config silently compressed zero files the second time.
      compression({ algorithms: ['gzip', 'brotliCompress'] }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Splits large, rarely-changing third-party code into its own chunk(s), separate
          // from app code. Without this, editing one line of app code invalidates a single
          // giant bundle (~500 KB) and forces every visitor to re-download React, Radix,
          // etc. all over again — with this, the vendor chunk keeps its own hash and stays
          // cached across app-only deploys. Revisit groupings if `npm run analyze` shows
          // one bucket growing disproportionately large.
          //
          // Rolldown's manualChunks type only accepts a function, not Rollup's object
          // shorthand (`{ name: ['pkg', ...] }`) — see decision.md on Rolldown implementing
          // a compatible subset of Rollup's API, not the full surface.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (/[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/.test(id)) {
              return 'react-vendor'
            }
            if (
              /[\\/]node_modules[\\/](radix-ui|lucide-react|class-variance-authority|tailwind-merge|clsx)[\\/]/.test(
                id,
              )
            ) {
              return 'ui-vendor'
            }
            return undefined
          },
        },
      },
    },
    server: {
      proxy: {
        // Frontend code always calls this fixed marker (see src/services/api-client.ts);
        // it gets rewritten to the real API path, whatever that path happens to be.
        '/__api': {
          target: apiUrl.origin,
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/__api/, apiPath),
        },
      },
    },
  }
})
