FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# VITE_API_URL here is a build-time placeholder only — vite.config.ts parses it as a URL
# while building (for its dev-server proxy config), so *some* valid URL must exist at
# build time, but its actual value doesn't end up mattering: env-config.js overrides
# VITE_API_URL at container runtime (see docker/generate-env-config.sh, src/config/env.ts).
# VITE_APP_NAME/VITE_APP_DESCRIPTION are branding — genuinely build-time, baked into
# index.html's <title>/<meta description> — not expected to differ per deployment.
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_DESCRIPTION=$VITE_APP_DESCRIPTION

RUN npm run build

FROM nginx:alpine AS runner
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/generate-env-config.sh /docker-entrypoint.d/40-generate-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-generate-env-config.sh
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
