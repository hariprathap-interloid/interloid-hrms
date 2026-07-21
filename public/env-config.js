// Default, committed placeholder — used by `npm run dev`, `npm run build` outside Docker,
// and static hosts (Vercel/Netlify/etc.) that set VITE_API_URL at build time instead.
// In Docker, docker/generate-env-config.sh overwrites this file at container start with the
// real per-environment values, so it never reaches this fallback. See src/config/env.ts.
window.__ENV__ = {}
