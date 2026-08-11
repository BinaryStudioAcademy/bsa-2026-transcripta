# 02 - Data pipeline

This is the main document for understanding the system. It shows **the path of
a single file** from upload to a finished transcription.

Diagram: [02-data-pipeline.mmd](diagrams/02-data-pipeline.mmd)

---

## The big picture

```
      USER                    SERVER                    OUTSIDE
       │                       │                         │
       │  1. "I want to upload"│                         │
       ├──────────────────────►│                         │
       │                       │  creates a document     │
       │  2. presigned URL     │  in the DB (status: draft)
       │◄──────────────────────┤                         │
       │                                                 │
       │  3. PUT the file DIRECTLY into S3               │
       ├────────────────────────────────────────────────►│ S3
       │                                                 │
       │  4. "uploaded, go"    │                         │
       ├──────────────────────►│                         │
       │                       │  enqueues a job         │
       │                       │                         │
       │                  ┌────▼─────┐                   │
       │                  │  WORKER  │                   │
       │                  └────┬─────┘                   │
       │                       │  5. downloads from S3 ◄─┤ S3
       │                       │  6. splits into pages   │
       │                       │  7. puts images ───────►│ S3
       │                       │  8. writes page rows    │
       │                       │                         │
       │                       │  for every page:        │
       │                       │  9. builds the context  │
       │                       │ 10. calls the LLM ─────►│ LLM API
       │                       │ 11. writes transcription│
       │                       │                         │
       │ 12. verifies pages    │                         │
       │◄─────────────────────►│                         │
       │                       │ 13. confirmed text goes │
       │                       │     back into context ──┘
       │                       │     (arrow to step 9)
       │ 14. export            │
       │◄──────────────────────┤
```

Step 13 is the product's trick. The rest is an ordinary file processing
pipeline.

---

## Step by step

### Steps 1-4: upload

| #   | Who     | What it does                                                                                 |
| --- | ------- | -------------------------------------------------------------------------------------------- |
| 1   | Browser | `POST /api/v1/documents` — title, chosen preset, file size                                   |
| 2   | Server  | Checks size and type. Creates a `document` row (status `draft`). Returns a **presigned URL** |
| 3   | Browser | `PUT`s the file **directly into S3/MinIO**, bypassing our server                             |
| 4   | Browser | `POST /api/v1/documents/:id/ingest` — the server enqueues a job                              |

**Why the file bypasses the server.** The file can be 500 MB. Sent through
Node, the process would either eat all the memory or force us to write complex
streaming logic with temporary files. A presigned URL is a signed link the
browser uses to put the file straight into storage. The server never holds the
file.

```ts
// apps/backend/src/modules/documents/document.controller.ts
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const url = await getSignedUrl(
	s3Client,
	new PutObjectCommand({
		Bucket: "transcripta-uploads",
		Key: `uploads/${documentId}/original.pdf`,
		ContentType: "application/pdf",
	}),
	{ expiresIn: 3600 },
);
```

---

### Steps 5-8: splitting into pages (job `document.ingest`)

The worker picks the job off the queue and does this:

```
1. download the file from S3 into a temp folder
2. find out the page count       (pdfinfo — fast, does not open the whole file)
3. if pages > 500 → error, document too large
4. LOOP over pages:
     a. render ONE page to PNG     (pdftoppm)
     b. normalise with sharp       (greyscale, 2048px, WebP)
     c. make a thumbnail           (256px, WebP) — for the page strip
     d. is the page blank?         (sharp stats, see below)
     e. upload both to S3
     f. INSERT into the page table (status pending, or blank)
5. document.status = 'ready'
6. enqueue the first N pages for transcription — blank ones are skipped
```

**The most important part is step 4 — the loop, one page at a time.**

The temptation to write "open the PDF, pull out all the pages" is strong. It
must not be done: 500 pages at 400 dpi is several gigabytes in memory and the
process dies. Rendering one page at a time in a separate subprocess gives three
things:

- memory is bounded by a single page
- a broken page kills one page, not the whole document
- the timeout genuinely works — a subprocess can be killed

```ts
// apps/backend/src/jobs/ingest.ts
for (let n = 1; n <= totalPages; n++) {
	// a separate process per page
	await execFile(
		"pdftoppm",
		[
			"-f",
			String(n),
			"-l",
			String(n), // page n only
			"-r",
			"300",
			"-png",
			"-singlefile",
			pdfPath,
			`${tmpDir}/page-${n}`,
		],
		{ timeout: 60_000 },
	);

	const source = sharp(`${tmpDir}/page-${n}.png`).grayscale();

	const normalized = await source
		.clone()
		.resize({ width: 2048, withoutEnlargement: true })
		.webp({ quality: 85 })
		.toBuffer();

	// The strip shows a thumbnail on hover. Without this the browser would
	// download a 200 KB page image for every hover.
	const thumb = await source
		.clone()
		.resize({ width: 256, withoutEnlargement: true })
		.webp({ quality: 70 })
		.toBuffer();

	const imageKey = `pages/${docId}/${pad(n)}.webp`;
	const thumbKey = `pages/${docId}/${pad(n)}-thumb.webp`;

	await Promise.all([
		s3Client.send(
			new PutObjectCommand({
				Bucket: "transcripta-pages",
				Key: imageKey,
				Body: normalized,
			}),
		),
		s3Client.send(
			new PutObjectCommand({
				Bucket: "transcripta-pages",
				Key: thumbKey,
				Body: thumb,
			}),
		),
	]);

	await PageModel.query().insert({
		documentId,
		pageNo: n,
		imageKey,
		thumbKey,
		imageSha256: sha256(normalized),
		status: "pending",
	});
}
```

**`sharp(...).clone()`, not two `sharp()` calls.** A sharp pipeline is
consumed once; reading and decoding the same PNG twice would double the
per-page cost for nothing.

`imageSha256` is computed from the **normalised** image, not from the original
PNG. It is part of the cache key, and what goes to the model is the normalised
version — if the dpi or the width changes, the hash must change too.

### Detecting a blank page

A blank page must never reach the model: it costs the same as a full one and
returns nothing. The check goes here, right after normalisation — this is the
only moment the image is already decoded in memory:

```ts
const { channels } = await sharp(normalized).stats();
const [grey] = channels;
const isBlank = grey.stdev < preset.settings.blankStdevThreshold; // default 6
```

A page with almost no variance in brightness is empty paper. Such a page goes
straight into status `blank`, is never queued, and the LLM is never called.

**The threshold has to be calibrated on real scans, not guessed.** Faded ink on
grey paper is not far from an empty sheet — set it too high and pages with
genuine text get silently dropped. That is why it lives in
`preset.settings.blankStdevThreshold` and not as a constant in the code:
different material needs different values.

If the calibration turns out to be unreliable on your scans, the honest
fallback is to disable the check (`blankStdevThreshold: 0`) and let empty pages
go through the model. That costs about $0.02 per page and never loses text.

Fields in Objection are written in camelCase — `knexSnakeCaseMappers`
translates them into `document_id`, `page_no`, `image_key`. This applies to the
query builder only: inside `knex.raw` the column names must be written exactly
as they are in the database.

**Normalisation** — why each step exists:

| Step              | Why                                                           |
| ----------------- | ------------------------------------------------------------- |
| Greyscale         | Colour carries no information in handwriting but costs tokens |
| Resize to 2048 px | The model's limit. Bigger is not better, only more expensive  |
| WebP q=85         | Three times smaller than PNG at the same readability          |

---

### Steps 9-11: transcribing a page (job `page.transcribe`)

This is the heart of the system. One job = one page.

```
1. check the document is not cancelled or paused
       if it is → exit, do nothing
2. check the document budget
       if exhausted → stop the document, exit
3. BUILD THE CONTEXT:
       - text of the last 3 CONFIRMED pages
       - document lexicon (top-100 words by frequency)
       - seed glossary from the preset
4. check the cache: have we computed this with the same context already?
       if yes → take it from the cache, pay nothing
5. assemble the prompt: system + preset + context + image
6. call the LLM
7. check the output is valid JSON against the preset schema
       if not → one repair request → if still not, error
8. write to the DB, in ONE transaction:
       - transcription + what it cost + which context was used
       - document.spent_usd += cost
       - page.status = 'transcribed'
9. re-check the budget AFTER the charge
       if the ceiling is crossed → document.status = 'budget_stop'
```

Steps 1 and 2 are cheap checks made before spending money. That matters: the
user pressed "cancel" on a 500-page document, but 400 jobs are already in the
queue. Without the check every one of them would make a paid call.

Step 4 is the cache. The key is a hash of `(image + preset + model + context)`.
If nothing changed, a re-run is free.

**Step 8 is where the money is actually recorded, and it must be atomic.**
Several `page.transcribe` jobs run in parallel. Read `spent_usd` into the
application, add the cost and write it back, and two jobs will read the same
value and one charge will vanish:

```ts
// WRONG — the classic lost update
const doc = await DocumentModel.query().findById(documentId);
await DocumentModel.query().patchAndFetchById(documentId, {
	spentUsd: Number(doc.spentUsd) + cost, // and Number() on money as well
});

// correct — the database adds it up itself
const [doc] = await knex.raw(
	`UPDATE document
      SET spent_usd = spent_usd + ?
    WHERE id = ?
  RETURNING spent_usd, budget_usd`,
	[cost, documentId],
);
```

**The budget is checked twice, and that is not a duplicate.** Step 2 refuses to
start a call we cannot afford. Step 9 catches the case where the ceiling was
crossed _by this very call_ — several jobs each pass the "before" check while
the budget still allows one of them, and together they overspend. The second
check stops the document; the overspend is bounded by the number of concurrent
jobs times the price of one page.

### Retries: one counter, not two

BullMQ has its own retry mechanism and the `page` table has `attempts` and
`last_error`. Two counters for the same thing is how a page gets read six times
instead of three.

**`page.attempts` is the authoritative one.** The job is registered with
`attempts: 1`, so BullMQ never retries on its own:

```ts
await queue.add("page.transcribe", payload, { attempts: 1 });
```

On failure the handler increments `page.attempts`, writes `last_error` and
re-enqueues the page itself while `attempts < 3`. After the third failure the
page goes to `failed` and stays there until a human presses "re-read".

The reason for keeping the policy in our code rather than in BullMQ: the retry
decision depends on **why** it failed. Malformed JSON deserves the single
repair request from step 7; a provider timeout deserves a retry with a delay;
`budget_exceeded` deserves no retry at all. BullMQ cannot tell these apart.

### Who sets `document.status = 'done'`

Every other status has an owner — `ingesting` and `ready` come from the ingest
job, `processing` from the first transcription, `budget_stop` from the budget
check. `done` is set by the **verify handler**, right after the cursor moves:

```sql
UPDATE document SET status = 'done'
WHERE id = $1
  AND NOT EXISTS (
    SELECT 1 FROM page
     WHERE document_id = $1
       AND status NOT IN ('confirmed', 'corrected', 'skipped', 'blank', 'failed')
  );
```

One aggregate query per confirmation is affordable, and running it in the same
transaction as the confirmation means the status can never lag behind reality.

Note that `failed`, `skipped` and `blank` count as closed. Otherwise a single
unreadable page would keep a fully verified document in `processing` forever.

---

### Steps 12-13: verification and feedback

```
The human sees: [page image] | [text from the model]

Presses Enter (confirm) or edits the text and presses Enter
       ↓
1. page.status = 'confirmed' or 'corrected'
2. entity words are extracted from the text (names, places, terms)
3. they go into the lexicon_entry table (the document lexicon)
4. the cursor moves to the next page
5. a new page ahead of the cursor is enqueued
```

**Step 3 closes the loop.** The next page, when transcribed (step 3 of the
previous section), will take this lexicon and show it to the model. The model
will see "this document contains the surname Ivanenko" and read it correctly
instead of "Ivanchenko".

That is context learning. No magic — confirmed text simply goes back into the
prompt.

---

### Step 14: export

A separate job, because assembling a large document takes minutes. The result
goes into S3 and the user gets a link.

MVP formats: **JSON, CSV, TXT**. Everything else goes to the backlog.

---

## The sliding window — how not to make the human wait

The problem: transcribing a page takes 20-30 seconds. Verification takes 8. If
a page is only transcribed once the human reaches it, they wait 20 seconds on
every single one.

But transcribing everything up front leaves no context, because page 500 is
processed before the human confirms page 1.

**The solution: keep N pages ready ahead of the cursor.**

```
                    the human is here
                          │
  ┌───┬───┬───┬───┬───┬───▼───┬───┬───┬───┬───┬───┐
  │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ✓ │ ▓ │ ▓ │ ▓ │ ▓ │ · │ · │
  └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
   confirmed           └── ready, N=4 ──┘  not queued yet
   (feed the context)
```

Every confirmation shifts the window and enqueues one new page.

For the MVP a **fixed N = 5** is used. Auto-tuning N goes to the backlog: first
we need to see the real latency numbers.

### The window alone is not enough — concurrency is the second parameter

A window of 5 says how far ahead we prepare. It says nothing about whether the
worker can keep up. If the human verifies faster than pages are produced, the
buffer drains and the window becomes an empty promise.

That is a throughput question, and it has an answer rather than a guess. In
steady state the worker must produce a page at least as fast as the human
consumes one:

```
L / C  ≤  H

L = latency of one transcription   (20-40 s)
C = concurrent page.transcribe jobs
H = human seconds per page         (target < 10)
```

So `C ≥ L / H`. With `L = 30` and `H = 10` that is **C = 3**; at the pessimistic
`L = 40` it is 4.

Two ceilings cap it:

- **`C ≤ N`.** More concurrent jobs than the window holds is pointless — there
  is nothing for the extra workers to take. With `N = 5`, `C` above 5 idles.
- **The provider's rate limit.** If the account allows fewer requests per
  minute than `C` would generate, the limit wins and `C` has to come down; the
  human waits, and that is a fact to state in the UI rather than hide.

**Start at `C = 3`** and correct it after the first full document, when the
real `L` is known from `document_cost.avg_latency_ms` and the real `H` from
`verification_speed.avg_ms`. Both views exist for exactly this
([04-database.md](04-database.md#ready-made-queries-as-views)).

Diagram: [05-sliding-window.mmd](diagrams/05-sliding-window.mmd)

---

## Page states

```
pending ──► queued ──► transcribing ──► transcribed ──► confirmed
   │                        │                │              │
   │                        │                └──► corrected ┘
   │                        │                │
   │                        └──► failed      └──► skipped
   │
   └──► blank  (empty page, skipped without calling the LLM)
```

**Only `confirmed` and `corrected` feed the context.** Not `skipped`, not
`transcribed`. The reason is in [03-core-logic](03-core-logic.md).

Diagram: [07-page-states.mmd](diagrams/07-page-states.mmd)

---

## Where everything is stored

| Data                     | Where      | Why there                                             |
| ------------------------ | ---------- | ----------------------------------------------------- |
| Original file            | S3         | Large, read rarely                                    |
| Page images              | S3         | Large, served to the browser directly via a link      |
| Transcription text       | PostgreSQL | Needs searching, joining, aggregating                 |
| Lexicon, statuses, users | PostgreSQL | The same                                              |
| Job queue                | Redis      | Transient state                                       |
| Transcription cache      | PostgreSQL | Not transient — it is an asset, must survive restarts |

**The rule about Redis:** the queue holds **identifiers only**.

```ts
// correct
{ documentId: 12, pageId: 4711, pageNo: 47 }

// WRONG — Redis will balloon and die
{ imageBase64: "iVBORw0KG...", fullText: "..." }
```

Put images or texts in the queue and Redis grows without bound, hits its memory
limit and gets killed by the OS. And since the queue lives inside it, every
unfinished job disappears with it.

---

## What to say in a demo

Three sentences that explain the system:

> The user uploads a PDF straight into S3 through a temporary link. A worker
> takes the file, splits it into pages one at a time, puts every image back
> into S3, and then sends them to a multimodal model one by one together with
> the text of the pages already confirmed.
> The human checks the result in a fast interface, and every confirmation
> improves the recognition of the pages that follow.

---

## Next

[03-core-logic.md](03-core-logic.md) — how context learning actually works.
