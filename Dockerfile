# syntax=docker/dockerfile:1

# ---- Build: compile the Angular app ------------------------------------------------------------
FROM node:26-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

COPY . .
# The bundle guard (F4-7) fails the image build if the dev-only mock data reached the bundle.
RUN npm run build && npm run bundle:check

# ---- Runtime: static files on unprivileged nginx (UID 101, port 8080) ---------------------------
FROM nginxinc/nginx-unprivileged:1.31-alpine AS runtime

LABEL org.opencontainers.image.title="atlas-frontend" \
      org.opencontainers.image.description="IKIGAI ATLAS web client (Angular SPA)" \
      org.opencontainers.image.source="https://github.com/hsnrzv/atlas"

# Pull Alpine security fixes released after the base image was published (Trivy gate).
USER root
RUN apk upgrade --no-cache
USER 101

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist/atlas-frontend/browser /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

# Set by frontend-container on publish (F2-12). Declared last so a new commit does not invalidate the layers above.
ARG VERSION=0.0.0-dev
ARG REVISION=unknown
ARG CREATED=unknown
LABEL org.opencontainers.image.url="https://github.com/hsnrzv/atlas" \
      org.opencontainers.image.vendor="hsnrzv" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}" \
      org.opencontainers.image.created="${CREATED}" \
      org.opencontainers.image.base.name="docker.io/nginxinc/nginx-unprivileged:1.31-alpine"
