# ============================================================================
# Nginx Dockerfile - Nginx Image for Production
# ============================================================================

# parking-management-system/infra/nginx/Dockerfile

FROM nginx:1.25-alpine

# Install necessary packages
RUN apk add --no-cache \
    curl \
    wget \
    tzdata \
    openssl \
    ca-certificates \
    brotli

# Create necessary directories
RUN mkdir -p /etc/nginx/ssl \
    && mkdir -p /var/cache/nginx \
    && mkdir -p /var/log/nginx \
    && mkdir -p /usr/share/nginx/html

# Copy configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/*.conf /etc/nginx/conf.d/
COPY sites-enabled/*.conf /etc/nginx/sites-enabled/

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copy health check script
COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Set up timezone
ENV TZ=UTC

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]