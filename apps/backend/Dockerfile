# Backend image for transcripta.
#
# Build from the REPO ROOT (it needs the whole monorepo — root lockfile +
# packages/shared), NOT from apps/backend:
#
#   docker build -f apps/backend/Dockerfile -t transcripta-backend:local .
#
# The compiled app lives in apps/backend/build and is started with `npm start`,
# whose `prestart` runs knex migrations before the server boots.

FROM node:22-slim

WORKDIR /app

# poppler-utils provides pdftoppm, used by the ingest pipeline (docs/02).
RUN apt-get update \
  && apt-get install -y --no-install-recommends poppler-utils \
  && rm -rf /var/lib/apt/lists/*

# The repo pins npm 11 with engine-strict; the base image ships npm 10.
RUN npm install -g npm@11

COPY . .

# --include=dev: TypeScript is needed to build, and shared currently keeps zod
# under devDependencies (a known template gap). Revisit with --omit=dev once
# zod is moved to dependencies.
RUN npm ci --include=dev \
  && npm run build:shared \
  && npm run build:backend \
  && npm run build:frontend \
  && mkdir -p apps/backend/build/public \
  && cp -r apps/frontend/build/. apps/backend/build/public/

# Production-only: point @transcripta/shared at its built JS. In the repo `main`
# stays src/index.ts (so dev/tsx, typechecks and knip are untouched); plain node
# in the container needs the compiled entry to resolve the bare import.
RUN npm pkg set main=build/index.js --workspace packages/shared

ENV NODE_ENV=production
WORKDIR /app/apps/backend/build
EXPOSE 3001
CMD ["npm", "start"]
