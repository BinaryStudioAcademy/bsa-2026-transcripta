# 01 - Architecture

Diagram: [01-overview.mmd](diagrams/01-overview.mmd)

---

## The main decision — a monolith

**One Node process. API and worker together.**

```
┌─────────────────────────────────────────────┐
│         ONE PROCESS · apps/backend          │
│                                             │
│   Fastify (HTTP)      BullMQ Worker         │
│        │                    │               │
│        └────────┬───────────┘               │
│                 │                           │
│         shared code: DB, S3, LLM            │
└─────────────────┬───────────────────────────┘
                  │
      ┌───────────┼───────────┬──────────┐
      │           │           │          │
  Postgres      Redis       MinIO    LLM API
```

### Why not microservices

The classic advice "split the API and the worker into separate processes" is
right for production under load. For a project this size it costs more than it
gives:

| What separate processes add           | How much time     |
| ------------------------------------- | ----------------- |
| A second Dockerfile and start command | half a day        |
| Duplicated config and connections     | half a day        |
| Harder local startup and debugging    | -1 day every week |
| Splitting the logs                    | half a day        |

Roughly one week out of six — spent on a problem you do not have yet.

### How to keep the option of splitting later

One environment variable:

The field must be added to `EnvironmentSchema` and to the convict schema
(`libs/modules/config`) — the template does not expect anyone to read
`process.env` directly, bypassing the config.

```ts
// apps/backend/src/index.ts
const mode = config.ENV.APP.MODE ?? "all"; // all | api | worker

if (mode === "all" || mode === "api") await startApi();
if (mode === "all" || mode === "worker") await startWorker();
```

When the need arises, the same image runs twice with different `APP_MODE`.
Zero refactoring.

**The condition under which this really becomes necessary:** the worker holds
long connections to the LLM, and under load the API health check starts timing
out. At the scale of a student project this will not happen.

---

## Components

| Component           | What it is                 | What for                                      |
| ------------------- | -------------------------- | --------------------------------------------- |
| **apps/frontend**   | React + Vite               | File upload, verification screen              |
| **apps/backend**    | Node 22 + Fastify + BullMQ | Everything else: API, queue, worker           |
| **packages/shared** | TypeScript + zod           | Types, enums and schemas shared by both sides |
| **postgres**        | PostgreSQL 17.5            | Documents, pages, transcriptions, lexicon     |
| **redis**           | Redis 7                    | Job queue. Transient state only               |
| **minio**           | MinIO (S3 API)             | Files and page images                         |
| **LLM API**         | External service           | Transcription                                 |

The goal is for everything to come up locally with a single
`docker compose up`. Right now there is **no** `docker-compose.yml` in the
repository: it has to be written together with the first services.

The commands that do exist today:

```bash
nvm use && npm i -g npm@11               # you need Node 22 AND npm 11, see [08]
npm install                              # shared builds itself via postinstall
npm run migrate:dev -w apps/backend      # apply migrations
npm run start:dev   -w apps/backend      # tsx watch, port from .env (3001)
npm run start:dev   -w apps/frontend     # vite, proxied to the backend
npm run lint                             # all checks at once
npm run build                            # shared -> backend -> frontend
```

There is no root-level `start`/`dev` — each app is started from its own
workspace. After startup Swagger lives at `/v1/documentation` (without `/api`,
unlike the routes themselves).

**Verified by running it:** installation, building all three workspaces, the
full lint, a migration and live API responses. Details in
[08-template-gaps.md](08-template-gaps.md).

---

## The stack and why it is what it is

The stack is not chosen from scratch: the base comes from the repository
template [sergiy4/bsa-transcripta](https://github.com/sergiy4/bsa-transcripta).
A "template" mark means the decision has already been made for us and is not up
for replay — breaking the template means breaking its lint, ls-lint, knip and
danger.

| What                  | Choice                                            | Source   | Why                                               |
| --------------------- | ------------------------------------------------- | -------- | ------------------------------------------------- |
| Language              | TypeScript / Node 22                              | template | One language on both front and back               |
| HTTP                  | Fastify                                           | template | Fast, swagger already wired in                    |
| Database access       | Knex + Objection                                  | template | Raw SQL without a fight — see below               |
| Database              | PostgreSQL 17.5                                   | template | JSONB for flexible preset schemas                 |
| HTTP validation       | zod in `packages/shared`                          | template | One schema for the backend and the front form     |
| LLM output validation | Ajv (JSON Schema)                                 | ours     | The preset schema lives in the DB as jsonb        |
| Frontend              | React + Vite + react-router                       | template | -                                                 |
| Frontend data         | Redux Toolkit: `createSlice` + `createAsyncThunk` | template | **Not RTK Query** — see below                     |
| HTTP client           | Own `BaseHTTPApi` over `fetch`                    | template | Token, headers and error parsing are inside       |
| Forms                 | react-hook-form + zod via `use-app-form`          | template | The hook already exists                           |
| Queue                 | BullMQ + Redis                                    | ours     | Retries, priorities, rate limiting out of the box |
| Storage               | MinIO locally, S3 in production                   | ours     | The same API                                      |
| PDF rendering         | `pdftoppm` (poppler)                              | ours     | Stable, predictable memory                        |
| Images                | `sharp`                                           | ours     | Fastest, low memory                               |

### Why Knex and not Prisma

This is not a compromise for the template's sake — for this schema Knex is
objectively more convenient. The schema has partial unique indexes, a GIN index
over jsonb, three views, two trigger functions and a lexicon upsert with a
`CASE WHEN` inside `DO UPDATE`. None of that can be expressed in
`schema.prisma`: you would have to write raw SQL in a migration anyway and then
run `db pull`, which still would not see the views and triggers.

Knex accepts `knex.raw()` in migrations without resistance; Objection is a thin
layer on top that you can drop out of into plain Knex anywhere. The price:
weaker typing than Prisma, entity types written by hand.

### Two validations are not duplication

| What is validated       | With what                          | Why exactly this                                                                                  |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| HTTP requests/responses | zod from `packages/shared`         | The same schema drives the front-end form through `@hookform/resolvers`                           |
| Model output            | Ajv against `preset.output_schema` | The schema lives in the DB as jsonb and goes into the prompt — you cannot store zod in a database |

The second row is not a choice but a constraint: the preset schema is edited by
the user, stored in the database and passed to the model. It can only be JSON
Schema.

### Frontend data: thunks, not a request cache

`@reduxjs/toolkit` is present in the template, but **RTK Query is not used**.
Every module is built like this:

```
modules/<name>/
├── slices/
│   ├── <name>.slice.ts    createSlice + DataStatus (idle/pending/fulfilled/rejected)
│   └── actions.ts         createAsyncThunk; the api class comes from extra
└── <name>-api.ts          a class over BaseHTTPApi
```

API classes are not imported inside thunks — they arrive through the store's
`extraArgument`. `BaseHTTPApi` already knows how to attach
`Authorization: Bearer` from `localStorage` and turn an error response into an
`HTTPError`.

The practical consequence: there is no request cache. Optimistic updates and
rollback on the verification screen are written by hand in the slice —
[06-verification-ui.md](06-verification-ui.md#the-ui-does-not-wait-for-the-server).
Adding RTK Query alongside is a bad idea: two caches drift apart, and the rest
of the template's modules would stay on thunks anyway.

### What changed against the original idea

| Was                              | Became                                 | Why                                                                                     |
| -------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| pgvector                         | Removed                                | It works without it: neighbouring pages give almost the same for handwriting            |
| Three separate processes         | One                                    | Saves a week                                                                            |
| React / Vue / Svelte to choose   | React fixed                            | An open decision blocks the start                                                       |
| Keycloak / OIDC                  | Plain email + password                 | An OIDC server is a separate week of setup                                              |
| Gemini / Claude / GPT-4o / LLaVA | One provider + an interface for others | We implement one adapter, the rest on demand                                            |
| Prisma                           | Knex + Objection                       | The template's stack, and a better fit for this schema                                  |
| TanStack Query                   | Slices + async thunks                  | The template is already built this way; a second data layer breeds bugs                 |
| Own `app_user` table             | The template's ready `users`           | Migration and model already exist; auth itself is a stub, see [08](08-template-gaps.md) |
| `uuid` primary keys              | `integer` everywhere                   | The template's `AbstractModel` declares `id!: number`                                   |

---

## Repository layout

A monorepo on npm workspaces (`apps/*`, `packages/*`). Marked with `← exists`
is what the template already ships; the rest we write.

```
transcripta/
├── apps/
│   ├── backend/                     # Node: Fastify + BullMQ in one process
│   │   ├── knexfile.ts              # ← exists
│   │   └── src/
│   │       ├── index.ts             # ← exists. Entry point, APP_MODE goes here
│   │       ├── db/migrations/       # ← exists. Knex, snake_case names
│   │       ├── libs/modules/        # ← exists. database, config, logger
│   │       ├── modules/
│   │       │   ├── auth/            # ← exists
│   │       │   ├── users/           # ← exists
│   │       │   ├── documents/       # controller + service + repository + model
│   │       │   ├── pages/
│   │       │   ├── presets/
│   │       │   └── lexicon/
│   │       ├── jobs/                # queue handlers
│   │       │   ├── ingest.ts        # splitting the PDF
│   │       │   └── transcribe.ts    # transcribing a page
│   │       ├── context/             # ★ context learning
│   │       │   ├── builder.ts       # building the context
│   │       │   └── lexicon.ts       # the lexicon
│   │       ├── llm/                 # provider adapters
│   │       └── storage/             # S3
│   └── frontend/                    # React
│       └── src/
│           ├── index.tsx            # ← exists. Router and StoreProvider
│           ├── libs/
│           │   ├── components/      # ← exists. App, Button, Input, Link, RouterProvider
│           │   ├── hooks/           # ← exists. use-app-dispatch/-selector/-form
│           │   ├── modules/
│           │   │   ├── api/         # ← exists. BaseHTTPApi: token, headers, errors
│           │   │   ├── http/        # ← exists. fetch wrapper
│           │   │   ├── storage/     # ← exists. localStorage, StorageKey.TOKEN
│           │   │   └── store/       # ← exists. configureStore, extraArgument = api classes
│           │   └── enums/           # ← exists. AppRoute, DataStatus
│           ├── modules/
│           │   ├── auth/            # ← exists. slice + actions + auth-api
│           │   ├── users/           # ← exists
│           │   ├── documents/       # slice + actions + document-api
│           │   └── pages/           # ★ verification slice
│           └── pages/
│               ├── auth/            # ← exists. sign-in and sign-up forms
│               └── verify/          # ★ verification screen
├── packages/shared/                 # ← exists. Types, enums, zod schemas for both sides
├── docs/                            # documentation, diagrams and the SQL schema
└── docker-compose.yml               # to be written
```

The stars mark the two folders where the product's value lives. The rest is
plumbing.

**Template conventions that must be followed:**

| Rule                                                                                                   | Where                                                                           |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| A backend module = `controller` + `service` + `repository` + `model` + `entity`                        | `modules/*`, modelled on `users`                                                |
| But we do not declare `implements Service` / `Repository` — the template's contracts take no arguments | [08](08-template-gaps.md#31-service-and-repository-contracts-take-no-arguments) |
| A repository returns **entities**, not models: `Entity.initialize(row)`                                | `user.repository.ts`                                                            |
| A frontend module = `slices/` (slice + actions) + `<name>-api.ts` + a barrel                           | `modules/*`, modelled on `auth`                                                 |
| Frontend api classes reach thunks through the store's `extraArgument`                                  | `libs/modules/store`                                                            |
| Validation messages and rules live in enums next to the schema                                         | `shared/.../libs/enums/*-validation-*.enum.ts`                                  |
| Commit: `TSA-<number>: <+ \| * \| -> <description>`                                                    | `commitlint.config.ts`                                                          |
| `knip` treats an unused export in `shared` as an error                                                 | `knip.config.ts`                                                                |
| Objection models extend `AbstractModel`, table name from `DatabaseTableName`                           | `libs/modules/database`                                                         |
| Migration names are `snake_case`, other files kebab-case with a type suffix                            | `.ls-lint.yml`                                                                  |
| Shared types and enums only through `@transcripta/shared`                                              | `packages/shared`                                                               |

---

## Three rules worth keeping

### 1. Put identifiers into the queue, nothing else

```ts
// correct
await queue.add("page.transcribe", { documentId, pageId, pageNo });

// WRONG
await queue.add("page.transcribe", { imageBase64, previousPagesText });
```

Redis keeps the queue in memory. Put images and texts in there and it will
balloon until the OS kills it — taking every unfinished job with it.

Plus the config to set right away:

```
maxmemory 2gb
maxmemory-policy noeviction
appendonly yes
```

```ts
removeOnComplete: { age: 3600, count: 1000 }
removeOnFail:     { age: 86400, count: 5000 }
```

### 2. Timeouts in config, not in code

```ts
// correct
timeout: config.llm.timeoutMs;

// WRONG
timeout: 30000;
```

A hardcoded short timeout produces flaky errors that look like a problem with
the model. Hunting one down can take a very long time.

The template's config is `convict` (`libs/modules/config`); new values go
there, not into `process.env` at the point of use.

**This is not a preference but a startup condition.** The schema is validated
with `allowed: "strict"` and every field has `default: null`. So each new
environment variable requires three edits at once — `EnvironmentSchema`, the
convict schema and `.env.example`. Miss one and the app will not start at all,
rather than "run without it".

### 3. An LLM abstraction from day one

```ts
interface LlmClient {
	transcribe(req: TranscribeRequest): Promise<TranscribeResponse>;
}
```

One interface, one adapter for your provider. Half a day of work now and a week
saved if the model has to change.

Always pin the **exact model version**, never a moving alias: the provider
updates the model behind the alias and quality changes without you doing
anything.

---

## Object storage

Two buckets:

| Bucket                | What is inside             |
| --------------------- | -------------------------- |
| `transcripta-uploads` | Original PDFs and archives |
| `transcripta-pages`   | Page images                |

Keys:

```
uploads/{documentId}/original.pdf
pages/{documentId}/{pageNo:06d}.webp
pages/{documentId}/{pageNo:06d}-thumb.webp
```

`{pageNo:06d}` means leading zeros (`000047`). Otherwise, when the file list is
sorted, page 10 ends up between 1 and 2.

The buckets are private. The browser gets access through a presigned URL valid
for an hour.

---

## Next

[02-data-pipeline.md](02-data-pipeline.md) — how data flows through the system.
