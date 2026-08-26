FROM node:20-alpine AS build
WORKDIR /app

# Railway makes service variables available to Docker builds only when the
# Dockerfile explicitly declares the corresponding build arguments.
ARG VITE_API_URL
ARG VITE_WEBSOCKET_URL
ARG VITE_ANALYTICS_ENABLED=false
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_WEBSOCKET_URL=${VITE_WEBSOCKET_URL} \
    VITE_ANALYTICS_ENABLED=${VITE_ANALYTICS_ENABLED}

COPY package*.json ./
# The committed lockfile is currently behind package.json. Use npm install during
# the transition so Railway/CI can resolve the complete declared dependency graph.
# Regenerate and commit frontend/package-lock.json in the next dependency-freeze pass.
RUN npm install --include=dev --no-audit --no-fund
COPY . .
RUN npm run build:prod

FROM nginx:1.27-alpine
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && mkdir -p /var/cache/nginx /var/run /var/log/nginx && chown -R app:app /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx /etc/nginx
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:${PORT:-8080}/healthz || exit 1
ENTRYPOINT ["/docker-entrypoint.sh"]
