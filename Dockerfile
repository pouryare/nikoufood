# syntax=docker/dockerfile:1
# Three stages: install, build, and a small runtime image. The "tools" stage keeps the full source so
# migrations and the seed can run from the same image:  docker compose run --rm tools pnpm migrate

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS tools
COPY . .
# The build needs no database: every page renders on request.
FROM tools AS build
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 MEDIA_DIR=/data/media FONTS_DIR=/data/media/fonts
RUN useradd --system --uid 1001 nikou && mkdir -p /data/media && chown -R nikou /data
COPY --from=build --chown=nikou /app/.next/standalone ./
COPY --from=build --chown=nikou /app/.next/static ./.next/static
COPY --from=build --chown=nikou /app/public ./public
USER nikou
EXPOSE 3000
CMD ["node", "server.js"]
