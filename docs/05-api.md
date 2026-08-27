# 05 - API

Fastify, REST, prefix `/api/v1`. Authentication — a JWT in the
`Authorization: Bearer` header.

The prefix is not written by hand: `BaseServerApplicationApi` prepends
`/api/${version}` to every path itself. In a controller the path looks like
`/documents/:id`.

On the frontend the same `:parameters` are substituted by `configureString`
inside `getFullEndpoint` — the second argument is the replacement object:

```ts
this.getFullEndpoint(DocumentsApiPath.$ID, { id: String(documentId) });
// '/api/v1/documents/:id' + { id: '47' } -> '/api/v1/documents/47'
```

20 routes over 17 distinct paths in total. That is the entire backend.

**Where everything is declared.** Prefixes live in the `APIPath` enum
(`packages/shared`), which currently holds only `AUTH` and `USERS`; we add
`DOCUMENTS`, `PAGES`, `PRESETS`, `LEXICON`, `EXPORTS`. Path tails live in the
module's own enum, like `UsersApiPath`. `BaseController` assembles the full
path: `APIPath.X` + `<Module>ApiPath.Y`.

Request bodies and DTOs are zod schemas in
`packages/shared/src/modules/<name>/libs/validation-schemas/`. The file is
named `<action>.validation-schema.ts`; inside, the export has a short name
(`userSignUp`), and the suffix is added when re-exporting from the module
barrel: `export { userSignUp as userSignUpValidationSchema }`. Error texts and
numeric bounds live separately, in the `*-validation-message` and
`*-validation-rule` enums.

Both sides see them: the backend (Fastify validation) and the frontend (types
for the api classes and resolvers for `use-app-form`). There is no need to
duplicate types on both sides.

Validating the model's output does not belong here — that goes through Ajv
against `preset.output_schema`, because the schema is written by the user and
stored in the database.

**Swagger is not generated automatically.** The template starts
`@fastify/swagger` in `static` mode and assembles the document from
hand-written `@swagger` comments above controller methods. Every route in the
list below needs its own block — 19 blocks that nobody will write for us.

---

## The list

| Method   | Path                             | What it does                                   |
| -------- | -------------------------------- | ---------------------------------------------- |
| `POST`   | `/api/v1/auth/sign-up`           | Registration. **Skeleton exists, no hashing**  |
| `POST`   | `/api/v1/auth/sign-in`           | Sign-in, returns a JWT. **Does not exist yet** |
|          |                                  |                                                |
| `GET`    | `/api/v1/users/me`               | Get current authenticated user                 |
|          |                                  |                                                |
| `GET`    | `/api/v1/documents`              | List of documents                              |
| `POST`   | `/api/v1/documents`              | Create + get an upload link                    |
| `GET`    | `/api/v1/documents/:id`          | Details + progress                             |
| `POST`   | `/api/v1/documents/:id/ingest`   | Start processing                               |
| `POST`   | `/api/v1/documents/:id/pause`    | Pause                                          |
| `POST`   | `/api/v1/documents/:id/resume`   | Resume                                         |
| `PATCH`  | `/api/v1/documents/:id/budget`   | Raise the spending limit                       |
| `DELETE` | `/api/v1/documents/:id`          | Delete                                         |
|          |                                  |                                                |
| `GET`    | `/api/v1/documents/:id/pages`    | Pages with their transcriptions                |
| `POST`   | `/api/v1/pages/:id/verify`       | **The main endpoint**                          |
| `POST`   | `/api/v1/pages/:id/reprocess`    | Re-read a page                                 |
|          |                                  |                                                |
| `GET`    | `/api/v1/documents/:id/lexicon`  | The lexicon                                    |
| `POST`   | `/api/v1/lexicon/:id/invalidate` | Mark a word as wrong                           |
|          |                                  |                                                |
| `GET`    | `/api/v1/presets`                | List of presets                                |
| `POST`   | `/api/v1/presets`                | Create one, or a new version                   |
|          |                                  |                                                |
| `POST`   | `/api/v1/documents/:id/export`   | Request an export                              |
| `GET`    | `/api/v1/exports/:id`            | Collect the link                               |

---

## Uploading a file

### `POST /api/v1/documents`

```jsonc
// request
{
  "title": "Parish register of Dykanka, 1887",
  "presetId": 1,
  "fileName": "dykanka-1887.pdf",
  "fileBytes": 184320000
}

// response 201
{
  "id": 1,
  "status": "draft",
  "uploadUrl": "http://minio:9000/transcripta-uploads/...?X-Amz-Signature=...",
  "expiresAt": "2026-08-07T11:30:00Z"
}
```

Size and type are checked **here**, before the link is handed out. Otherwise
the user uploads 2 GB and only then learns the file is too large.

### Then the browser

```ts
// the file goes DIRECTLY into storage, bypassing our server
await fetch(uploadUrl, { method: "PUT", body: file });
await fetch(`/api/v1/documents/${id}/ingest`, { method: "POST" });
```

---

## `GET /api/v1/documents/:id`

```jsonc
{
	"id": 1,
	"title": "Parish register of Dykanka, 1887",
	"status": "processing",
	"preset": { "id": 1, "name": "19th-century parish register", "version": 1 },
	"pageCount": 300,
	"cursorPageNo": 47,
	"progress": {
		"pagesTotal": 300,
		"pagesVerified": 46,
		"pagesReadyToCheck": 5,
		"pagesInWork": 2,
		"pagesFailed": 0,
		"pagesBlank": 2,
		"pagesSkipped": 1,
		"verifiedPct": 15.3,
		"closedPct": 16.3,
	},
	"budget": { "limitUsd": "10.00", "spentUsd": "0.98", "usedPct": 9.8 },
}
```

The `progress` block is read with a single query from the `document_progress`
view.

`verifiedPct` and `closedPct` are not the same number and must not be swapped.
The first counts only what a human read; the second also counts `skipped`,
`blank` and `failed` — pages that are finished without having been verified. A
document reaches `status: "done"` at `closedPct: 100`, which can happen while
`verifiedPct` is still 97. The progress bar follows `closedPct`, the figure
beside it is `verifiedPct`
([04-database.md](04-database.md#two-percentages-and-confusing-them-makes-the-ui-lie)).

---

## `GET /api/v1/documents/:id/pages?from=47&limit=5`

```jsonc
{
	"items": [
		{
			"id": 47,
			"pageNo": 47,
			"status": "transcribed",
			"imageUrl": "http://minio:9000/...?X-Amz-Signature=...", // valid 1 hour
			"thumbUrl": "...",
			"transcription": {
				"id": 312,
				"text": "No. 15. Born on 11 January, Anna. Parents: peasant of Dykanka village...",
				"structured": { "records": [] },
				"contextWords": [
					{
						"word": "Dykanka",
						"lexiconId": 2,
						"start": 52,
						"end": 60,
						"seenOnPages": 7,
					},
				],
			},
		},
	],
}
```

`contextWords` are the words the context suggested. The frontend highlights
exactly these, because they carry the highest risk of context poisoning. See
[03-core-logic.md](03-core-logic.md#6-context-poisoning--the-main-danger).

---

## `POST /api/v1/pages/:id/verify` — the main endpoint

The product's headline metric depends on how fast this is.

```jsonc
// request
{
  "action": "correct",              // confirm | correct | skip
  "transcriptionId": 312,           // what was checked against
  "text": "No. 15. Born on 11 January, Anna...",
  "durationMs": 7400
}

// response 200
{
  "pageId": 47,
  "status": "corrected",
  "lexiconAdded": [
    { "id": 8, "word": "Anna", "distinctPages": 1, "inContext": false }
  ],
  "next": {
    "pageId": 48,
    "pageNo": 48,
    "status": "transcribed",
    "transcription": { "text": "...", "contextWords": [] }
  }
}
```

Three details, each with a reason:

**1. `transcriptionId` in the request.**
If the current transcription is already a different one (a re-run fired while
the human was reading), the server returns `409` and the frontend reloads the
page. Without this the human confirms text that no longer exists.

**2. `next` in the same response.**
The next page arrives immediately, the frontend does not make a second
request. One round-trip instead of two per page — across 300 pages that is
noticeable.

**3. `lexiconAdded` with the `inContext` field.**
Shows whether the word has already passed the two-page threshold and started
influencing later transcriptions.

---

## `POST /api/v1/lexicon/:id/invalidate`

Fixing context poisoning.

```jsonc
// request
{ "reason": "Misread, the correct form is Ivanenko" }

// response
{
  "invalidatedId": 5,
  "pagesQueuedForReprocess": 12,   // unconfirmed pages that used this word
  "verifiedPagesFlagged": 3        // confirmed ones are only flagged, NOT rewritten
}
```

Confirmed pages are not reprocessed automatically. Overwriting what a human
confirmed is worse than leaving the mistake in place.

---

## `POST /api/v1/presets`

```jsonc
{
	"familyId": null, // null = a new preset; a value = a new version
	"name": "19th-century parish register",
	"instructions": "This is a page from a parish register...",
	"outputSchema": { "type": "object", "properties": {} },
	"seedGlossary": [{ "kind": "formula", "value": "born and baptised" }],
	"settings": {
		"model": "claude-opus-5",
		"temperature": 0,
		"dpi": 400,
		"neighbourPages": 3,
		"lexiconTopK": 100,
		"windowSize": 5,
	},
}
```

Creates a **new row**, never updates an existing one. If `familyId` is given,
`version` is incremented by one.

---

## Progress in real time

The simplest thing that works: **polling**.

```
GET /api/v1/documents/:id            every 2 seconds while status = 'processing'
```

Server-Sent Events would be nicer, but that is extra work on both sides plus
reconnection problems. Polling every 2 seconds is entirely sufficient here:
there are only a handful of users and the request is cheap (a single view).

SSE can be added later without changing the rest of the API.

---

## Errors

The template already has its own error envelope, and it **does not match** what
we need. Right now the handler in `base-server-application.ts` returns:

```jsonc
// ServerCommonErrorResponse
{ "errorType": "COMMON", "message": "…" }

// ServerValidationErrorResponse — when a zod schema fails
{ "errorType": "VALIDATION", "message": "…",
  "details": [{ "path": ["email"], "message": "Invalid email" }] }
```

`errorType` has exactly two values and cannot distinguish "out of budget" from
"someone else's document". So we add an `error` field with a stable code
without breaking the existing envelope:

```jsonc
{
	"errorType": "COMMON",
	"error": "budget_exceeded",
	"message": "Spent 10.03 USD of a 10.00 limit. Processing stopped.",
	"details": { "spentUsd": "10.0312", "limitUsd": "10.0000" },
}
```

`error` is the stable code the frontend uses to tell cases apart
programmatically.

**Never parse `message`.** On a validation error the template dumps the raw zod
issues in there — confirmed with a live request:

```jsonc
{
	"errorType": "VALIDATION",
	"details": [{ "message": "Email is wrong", "path": ["email"] }],
	"message": "[\n  {\n    \"validation\": \"email\",\n    \"code\": …",
}
```

Only `details` can be shown to the user; for validation errors `message` is a
technical string, unusable in an interface.

Implementation: our own error class on top of `HTTPError` carrying an `error`
field, plus a branch in `setErrorHandler` that forwards it. Until that exists,
the frontend cannot tell a 409 "the text changed" from a 409 "out of money" —
and those are two different behaviours of the verification screen.

| Code                    | HTTP | When                                        |
| ----------------------- | ---- | ------------------------------------------- |
| `unauthorized`          | 401  | No token, or an expired one                 |
| `forbidden`             | 403  | Someone else's document                     |
| `not_found`             | 404  | No such thing                               |
| `file_too_large`        | 413  | File over the limit                         |
| `unsupported_type`      | 415  | Not a PDF and not an archive                |
| `transcription_changed` | 409  | The page was re-read while the human looked |
| `budget_exceeded`       | 409  | The document ran out of money               |
| `rate_limited`          | 429  | Too many requests                           |

---

## What goes into the queue

**Identifiers only.** No images and no texts.

```ts
// apps/backend/src/jobs/libs/types/job.type.ts

interface IngestJob {
	documentId: number;
	sourceKey: string; // the S3 key, not the contents
}

interface TranscribeJob {
	documentId: number;
	pageId: number;
	pageNo: number;
	presetId: number;
}

interface ExportJob {
	documentId: number;
	exportId: number;
	format: "json" | "csv" | "txt";
}
```

The largest payload is a few hundred bytes. Put a base64 image in there and
Redis will balloon and take the whole queue down with it.

---

## Next

[06-verification-ui.md](06-verification-ui.md) — the screen where the user
lives.
