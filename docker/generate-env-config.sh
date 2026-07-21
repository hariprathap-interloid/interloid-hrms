#!/bin/sh
# Runs automatically at container start (nginx:alpine executes every executable *.sh in
# /docker-entrypoint.d/ before starting nginx). Overwrites the built-in placeholder
# public/env-config.js with the real, container-runtime VITE_API_URL — this is what lets
# one built image be deployed to dev/stage/prod with different backend URLs, without a
# rebuild. See src/config/env.ts and learning.md.
set -eu

cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  VITE_API_URL: "${VITE_API_URL:-}"
};
EOF
