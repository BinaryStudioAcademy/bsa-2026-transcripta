# 08 - What the repository already has and what it does not

The rest of the documents describe **how the system should work**. This one
describes **what you actually have to start from**: what the
[sergiy4/bsa-transcripta](https://github.com/sergiy4/bsa-transcripta) template
gives you ready-made, what it gives as a stub, and what is missing entirely.

The goal is that nothing has to be invented during implementation, and that
nobody spends a day looking for a function that does not exist.

Everything below was checked by reading the code, not by assumption.

---

## In short

| Area                                                       | Status      | Where                                             |
| ---------------------------------------------------------- | ----------- | ------------------------------------------------- |
| Fastify, logger, config, error handler                     | **Exists**  | `libs/modules/*`                                  |
| Frontend: store, HTTP client, forms, router, auth pages    | **Exists**  | `apps/frontend/src`                               |
| Knex + Objection, `snake_case` mapper, base model          | **Exists**  | `libs/modules/database`                           |
| zod as the Fastify validator                               | **Exists**  | `base-server-application.ts`                      |
| Module pattern: controller/service/repository/model/entity | **Exists**  | `modules/users`                                   |
| The `users` table and its migration                        | **Exists**  | `db/migrations/20240127205704_add_users_table.ts` |
| Registration                                               | **Stub**    | the password is not hashed                        |
| Validation of `params` and `query`                         | **Missing** | only `body` is validated                          |
| `Service` / `Repository` with arguments                    | **Missing** | the contracts take no parameters                  |
| docker-compose, CI                                         | **Missing** | bring the services up by hand                     |
| Stable error codes                                         | **Missing** | only `errorType: COMMON \| VALIDATION`            |
| Sign-in, JWT                                               | **Missing** | neither code nor libraries                        |
| Queue, S3, PDF, LLM                                        | **Missing** | not a single dependency                           |
| Our 8 tables                                               | **Missing** | only `users`                                      |

---

## 1. Registration creates a user without a password

```ts
// apps/backend/src/modules/users/user.service.ts
const item = await this.userRepository.create(
	UserEntity.initializeNew({
		email: payload.email,
		passwordHash: "HASH", // TODO
		passwordSalt: "SALT", // TODO
	}),
);
```

The `POST /auth/sign-up` route works, the zod schema
`userSignUpValidationSchema` validates the body, a row does appear in the
database — but **every user gets the same literal "password"**.

Still to write: salt generation, hashing, and comparison on sign-in.

**No new library is needed for this.** `node:crypto` has `scrypt`, and it
produces exactly the pair the `users` table already stores:

```ts
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const passwordSalt = randomBytes(16).toString("hex");
const passwordHash = scryptSync(password, passwordSalt, 64).toString("hex");
```

On sign-in, compare with `timingSafeEqual`, not `===` — a plain string
comparison leaks the length of the matching prefix through timing.

Zero new packages, and with `save-exact=true` that is also one fewer pinned
version to maintain.

## 2. There is no sign-in and no JWT — but the frontend already expects one

On the backend there is only `AuthApiPath.SIGN_UP`. There is no:

- `POST /auth/sign-in` route;
- token issuing;
- token checking before protected routes;
- notion of "the current user" inside a handler.

`@fastify/jwt` is absent from the dependencies.

**The frontend, meanwhile, is already prepared for a token**, and that is the
shortest path to a misunderstanding. The template ships:

| What                                  | Where                                                    |
| ------------------------------------- | -------------------------------------------------------- |
| Sign-in form and the `/sign-in` route | `pages/auth/components/sign-in-form`, `AppRoute.SIGN_IN` |
| Token storage                         | `libs/modules/storage`, key `StorageKey.TOKEN`           |
| Attaching `Authorization: Bearer`     | `BaseHTTPApi.getHeaders`, the `hasAuth` flag             |
| A `bearerAuth` declaration in swagger | `base-server-application-api.ts`                         |

So the client half of authentication is written and the server half does not
exist at all. The sign-in form currently leads nowhere: there is no `signIn`
thunk either — `auth/slices/actions.ts` exports only `signUp`.

This affects the whole of the rest of the API: every route in
[05-api.md](05-api.md) implicitly assumes the server knows who is making the
request. Until that exists there is also no ownership check — and with integer
ids that check is critical
([04-database.md](04-database.md#0-why-every-key-is-integer-and-not-uuid)).

## 3. Only request bodies are validated

```ts
// base-server-application.ts
this.app.route({
	handler,
	method,
	schema: {
		body: validation?.body, // params and query never get here
	},
	url: path,
});
```

At the same time `BaseController.mapRequest` **already forwards** `params` and
`query` to the handler — they simply do not pass through zod.

For our API this matters: `/documents/:id/pages?from=47&limit=5` — the id and
both numbers arrive as unvalidated strings. The fix is small, but **two** types
need touching, both declaring `validation?: { body?: ValidationSchema }`:

- `libs/modules/controller/libs/types/controller-route-parameters.type.ts`
- `libs/modules/server-application/libs/types/server-application-route-parameters.type.ts`

plus `addRoute` itself in `base-server-application.ts`, which puts the fields
into `schema`.

**Do it together with the auth guard.** The same two types have no
`preHandler`, no hooks and no notion of a protected route — Fastify supports
all of it natively, the wrapper just does not pass it through. Since protecting
routes and validating `params`/`query` touch exactly the same three files,
extending them once is one change instead of two:

```ts
type ServerApplicationRouteParameters = {
	handler: (request, reply) => Promise<void> | void;
	method: HTTPMethod;
	path: string;
	preHandler?: preHandlerHookHandler; // ← added: the auth guard attaches here
	validation?: {
		body?: ValidationSchema;
		params?: ValidationSchema; // ← added
		query?: ValidationSchema; // ← added
	};
};
```

Otherwise the third round of edits to the same files arrives the moment
`POST /auth/sign-in` starts issuing tokens.

## 3.1 `Service` and `Repository` contracts take no arguments

```ts
// libs/types/service.type.ts
type Service<T = unknown> = {
	create(payload: unknown): Promise<T>;
	delete(): Promise<boolean>; // ← no id
	find(): Promise<T>; // ← no id
	findAll(): Promise<{ items: T[] }>;
	update(): Promise<T>; // ← no id and no payload
};
```

`UserService` and `UserRepository` implement them as stubs
(`return Promise.resolve(null)`), because the template needs nothing more.

We need `find(id)`, `update(id, payload)` and `delete(id)` in literally every
module — not one of them fits this interface.

**Decision: we do not declare `implements Service` / `implements Repository` on
our classes. We do not add generics to these types either.**

The module's file structure stays identical to the sample —
`controller` + `service` + `repository` + `model` + `entity`. The only change
is that our classes do not claim to satisfy the contract.

Why:

- The interface is never used polymorphically — the controller receives a
  concrete class, so `implements` here is a style marker, not a check.
- Extending it with generics means editing a **shared** type, touching the
  template's `users` for zero gain.
- Half of our routes are not CRUD at all: `pages/:id/verify`,
  `lexicon/:id/invalidate`, `documents/:id/ingest|pause|resume`. They do not
  fit `find/update/delete` under any stretch.

The decision is cheap to reverse: it is a type-level change only and does not
touch the runtime.

## 4. Error codes are too coarse

The template's handler knows two types:

```jsonc
{ "errorType": "COMMON",     "message": "…" }
{ "errorType": "VALIDATION", "message": "…", "details": [ … ] }
```

The verification screen has to distinguish at least `transcription_changed`
from `budget_exceeded` — both return 409 and require different behaviour. A
separate `error` field with a stable code is needed; details in
[05-api.md](05-api.md#errors).

## 4.1 There is no request cache on the frontend — and there will not be

RTK Query is **not used** in the template, even though `@reduxjs/toolkit` is
installed. Instead:

```
modules/<name>/
├── slices/
│   ├── <name>.slice.ts     createSlice + DataStatus (idle/pending/fulfilled/rejected)
│   └── actions.ts          createAsyncThunk, api class taken from extra
└── <name>-api.ts           a class over BaseHTTPApi
```

API classes reach thunks through the store's `extraArgument` — they are not
imported inside the thunk directly.

What this means for the verification screen: `updateQueryData`, `patch.undo()`,
`usePrefetch`, invalidation tags — none of it exists. Optimistic updates and
rollback are written by hand in the slice, as shown in
[06-verification-ui.md](06-verification-ui.md#the-ui-does-not-wait-for-the-server).

The temptation to add RTK Query alongside is strong, but two caches in one app
drift apart, and the rest of the template's modules would stay on thunks.

## 5. Swagger is written by hand

`@fastify/swagger` is set up in `static` mode; the document is assembled by
`swagger-jsdoc` from comments above controller methods:

```ts
/**
 * @swagger
 * /auth/sign-up:
 *    post:
 *      description: Sign up user into the system
 *      …
 */
```

There is no generation from zod. 19 routes = 19 hand-written blocks. Forget a
block and the route still works but disappears from the documentation — with no
sign that anything is wrong.

## 6. `zod` is in the wrong section

```jsonc
// packages/shared/package.json
"devDependencies": { "zod": "3.25.76" }
```

`userSignUpValidationSchema` is a runtime value, and the backend imports it at
runtime. Locally everything works thanks to npm workspaces hoisting, but
formally the package declares that it does not need zod at runtime. Move it to
`dependencies`.

## 6.1 Three base-model traps that only show up at runtime

These three are not "missing" — they will work against us if the schema is
written the usual way. All three are already accounted for in
[schema.sql](schema/schema.sql).

**`updated_at` is mandatory even in immutable tables.**

```ts
// abstract.model.ts
public override $beforeInsert(): void {
  const insertDate = new Date().toISOString();
  this.createdAt = insertDate;
  this.updatedAt = insertDate;   // ← ALWAYS written
}
```

The old convention "whatever is not updated has no `updated_at`" breaks here:
the very first `INSERT` into `preset` would fail with
`column "updated_at" of relation "preset" does not exist`. That is why the
column exists in all nine tables; in `preset` and `page_event` it simply never
changes — the immutability trigger guarantees that.

**`bigserial` turns `id` into a string.**

The `pg` driver returns `int8` as a string so as not to lose precision. The
base model declares `public id!: number`. So for a `bigserial` table the type
would be lying: the field would hold `"42"` rather than `42`, and every `===`
comparison would silently be `false`. That is why `lexicon_entry` and
`page_event` are on `serial` (int4) too.

**`count()` and `round()` in views return strings.**

`count()` is a `bigint` and `round()` is a `numeric`; both arrive as strings.
Without casting, `document_progress` would return `"300"` instead of `300`, and
the `progress` field in [05-api.md](05-api.md#get-apiv1documentsid) would not
match its own description. The views carry explicit `::int` and `::float8`.

Money is the exception: `numeric` stays a string on purpose, and the API shows
it as a string too (`"spentUsd": "0.98"`). Rounding a budget to a float is not
acceptable.

**The cache is the only table without the base model.** In
`transcription_cache` the primary key is `cache_key text`, while
`AbstractModel` demands a numeric `id`. Its model extends the plain Objection
`Model` and sets `static idColumn = 'cache_key'`.

---

## 7. There is no infrastructure for our pipeline

Not one of these dependencies is in the project yet:

| What                       | What for                                               | Described in                                                                 |
| -------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| BullMQ + Redis             | The `document.ingest` and `page.transcribe` queues     | [02-data-pipeline.md](02-data-pipeline.md)                                   |
| S3 client (SDK v3) + MinIO | Presigned URLs, page images                            | [02-data-pipeline.md](02-data-pipeline.md#steps-1-4-upload)                  |
| poppler (`pdftoppm`)       | Rendering PDF pages — **a system package, not npm**    | [02-data-pipeline.md](02-data-pipeline.md)                                   |
| `sharp`                    | Normalising images                                     | [02-data-pipeline.md](02-data-pipeline.md)                                   |
| A model client             | Transcription                                          | [01-architecture.md](01-architecture.md)                                     |
| Ajv                        | Validating model output against `preset.output_schema` | [01-architecture.md](01-architecture.md#two-validations-are-not-duplication) |

**poppler is the one dependency `npm install` will not bring.** `pdftoppm` and
`pdfinfo` come from the `poppler-utils` system package. On a developer machine
that is `brew install poppler`; in the image it is an explicit line in the
Dockerfile. It is the only non-npm dependency in the project, which is exactly
why it is easy to forget until the ingest job fails inside a container with
`spawn pdftoppm ENOENT`.

## 7.1 No docker-compose and no CI

The repository has neither `docker-compose.yml` nor `.github/`. So Postgres,
Redis and MinIO have to be brought up locally by hand, and
[01-architecture.md](01-architecture.md) describes `docker compose up` as a
goal, not as the current state.

`.env.example` exists in both apps, but it only covers what the template
already needs: `PORT`, `HOST`, `NODE_ENV` and four database variables.
Everything of ours — S3, Redis, the model key, `APP_MODE` — will have to be
added with three edits at once (see the convict section in the architecture
document).

## 7.2 Four settings that will reject your work without warning

These are not "missing", but you can trip over them within the first hour. The
first row was confirmed in practice — it is exactly where the attempt to
install dependencies stopped.

| What                     | Rule                                                                                   | What happens                                                      |
| ------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Node and npm version** | `.npmrc` has `engine-strict=true`; you need exactly `node 22.x.x` **and** `npm 11.x.x` | `npm install` fails with `EBADENGINE` and installs nothing        |
| `commitlint`             | `TSA-<number>: <+ \| * \| -> <description>`                                            | The git hook rejects a commit with any other text                 |
| `knip` (`lint:trash`)    | `packages/shared` has `includeEntryExports` enabled                                    | An export not yet consumed anywhere fails the lint                |
| `convict`                | `allowed: "strict"`, every field `default: null`                                       | An extra or missing environment variable — the app does not start |

Node comes from `.nvmrc` (which says `22`), but that is **not enough**: Node 22
ships with npm 10, while the requirement is npm 11. So there are two steps, and
the second one is not obvious:

```bash
nvm install 22 && nvm use 22    # node 22.x, npm 10.x
npm i -g npm@11                 # without this, install still fails
```

On Node 25 or 16 nothing runs at all, `npm install` included.

`.npmrc` also has `save-exact=true` — new dependencies are pinned to an exact
version without `^`. That is deliberate; keep it in mind when adding packages.

The consequence for `knip`: DTOs and zod schemas in `shared` must be added
**together** with the code that consumes them, not "up front".

`packages/shared` has `postinstall: npm run build` — the package is built
during installation. If it contains a type error, `npm install` itself fails.

## 8. The database has one table out of nine

There is `users` and the service table `migrations`. Missing are our eight
tables — `preset`, `document`, `page`, `transcription`, `lexicon_entry`,
`page_event`, `transcription_cache`, `document_export` — and with them three
views, four enums, the `preset_family_seq` sequence, two trigger functions and
the eight triggers built on them.

The source of truth is [schema/schema.sql](schema/schema.sql); port it into
Knex migrations following the split in
[04-database.md](04-database.md#what-the-builder-does-and-what-raw-sql-does).

---

## What to do first

The implementation order in the [README](README.md) starts with "get one page
through the whole path". Out of this list only items 7 and 8 are needed for the
first stage — infrastructure and tables.

Auth, JWT and `params` validation become blockers at stage four, when the
verification screen and the notion of "my documents" appear. Patching them
earlier makes no sense.

---

## Next

[09-open-questions.md](09-open-questions.md) — what has been decided and what is still open.
