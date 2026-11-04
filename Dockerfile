# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Eco Farm Tech — static dashboard served by nginx
# Multi-stage build: collect the site, then serve it from a hardened nginx
# image as a non-root user.
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

LABEL org.opencontainers.image.title="Eco Farm Tech Dashboard" \
      org.opencontainers.image.description="Solar energy monitoring dashboard for sustainable farming (demo prototype)" \
      org.opencontainers.image.url="https://github.com/SHAILENDRA-REDDY/EcoFarm-Tech" \
      org.opencontainers.image.source="https://github.com/SHAILENDRA-REDDY/EcoFarm-Tech" \
      org.opencontainers.image.vendor="Eco Farm Tech" \
      org.opencontainers.image.licenses="MIT"

# Replace the default nginx configuration with our hardened one
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-main.conf /etc/nginx/nginx.conf

# Static site
WORKDIR /usr/share/nginx/html
COPY index.html ./
COPY css ./css
COPY js ./js
COPY assets ./assets
COPY LICENSE ./

# nginx runs as an unprivileged user: pid and temp paths live under /tmp so the
# master process never needs to write inside a root-owned directory.
RUN mkdir -p /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp \
             /tmp/uwsgi_temp /tmp/scgi_temp \
 && chown -R nginx:nginx /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp \
                          /tmp/uwsgi_temp /tmp/scgi_temp \
 && chmod -R a+rX /usr/share/nginx/html

# Fail the build (not the deployment) if the nginx configuration is invalid.
# Clean up anything the root-run check creates so the runtime user owns its paths.
RUN nginx -t \
 && rm -f /tmp/nginx.pid /var/cache/nginx/nginx.pid \
 && chown -R nginx:nginx /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp \
                          /tmp/uwsgi_temp /tmp/scgi_temp

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1

STOPSIGNAL SIGQUIT

# Start nginx directly: the stock entrypoint scripts expect root and a
# default.conf we deliberately replaced, so they add no value here.
ENTRYPOINT []
CMD ["nginx", "-g", "daemon off;"]
