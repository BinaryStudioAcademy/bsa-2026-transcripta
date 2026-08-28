# Transcripta

A web app for transcribing scanned handwritten documents.

The user uploads a PDF, the system reads every page with a multimodal model,
and a human verifies the result quickly. **Verified pages are fed back into the
prompt as hints for the next ones** — and the further you go, the more
accurately the system reads surnames, terms and set phrases.

---

|               |                                                                                        |
| ------------- | -------------------------------------------------------------------------------------- |
| Status        | Design stage. The only code is the repository template: auth and users                 |
| Repository    | [sergiy4/bsa-transcripta](https://github.com/sergiy4/bsa-transcripta)                  |
| Stack         | TypeScript, Node 22, Fastify, Knex + Objection, PostgreSQL 17.5, React + Redux Toolkit |
| This document | Architecture and data path                                                             |

The stack is dictated by the repository template, not chosen here. What that
changed compared with the earlier revision of this document is in
[01-architecture.md](01-architecture.md#what-changed-against-the-original-idea).

---

## Start reading here

**If you have 10 minutes:**

1. [00-overview.md](00-overview.md) — what this is and why
2. [07-how-it-works.md](07-how-it-works.md) — **how it works, in plain words**

**If you are about to implement it:**

1. [01-architecture.md](01-architecture.md) — what the system is made of
2. [02-data-pipeline.md](02-data-pipeline.md) — the file's path, step by step
3. [04-database.md](04-database.md) + [schema/schema.sql](schema/schema.sql)

---

## The system in one picture

```
     USER                     SERVER                   OUTSIDE
       │                       │                         │
       │  1. "I want to upload"│                         │
       ├──────────────────────►│  creates document       │
       │  2. presigned URL     │                         │
       │◄──────────────────────┤                         │
       │                                                 │
       │  3. PUT the file DIRECTLY into S3 ─────────────►│ S3
       │                                                 │
       │  4. "go ahead"        │                         │
       ├──────────────────────►│                         │
       │                  ┌────▼─────┐                   │
       │                  │  WORKER  │                   │
       │                  └────┬─────┘                   │
       │                       │  5. downloads file ◄────┤ S3
       │                       │  6. splits into pages   │
       │                       │  7. images ────────────►│ S3
       │                       │  8. writes page rows    │
       │                       │                         │
       │                       │  for every page:        │
       │                       │  9. builds context      │
       │                       │ 10. calls model ───────►│ LLM
       │                       │ 11. writes transcription│
       │                       │                         │
       │ 12. verifies          │                         │
       │◄─────────────────────►│                         │
       │                       │ 13. confirmed text goes │
       │                       │     back into context ──┘
       │                       │     (arrow to step 9)
       │ 14. export            │
       │◄──────────────────────┤
```

**Step 13 is the whole point of the project.** The rest is an ordinary file
processing pipeline.

---

## Documents

| File                                           | About                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| [00-overview.md](00-overview.md)               | What this is, why, and for which documents                               |
| [01-architecture.md](01-architecture.md)       | Monolith, components, stack, repository layout                           |
| [02-data-pipeline.md](02-data-pipeline.md)     | **The file's path, step by step**                                        |
| [03-core-logic.md](03-core-logic.md)           | **Context learning: how it works and how not to ruin it**                |
| [04-database.md](04-database.md)               | 9 tables and why exactly these                                           |
| [05-api.md](05-api.md)                         | 19 routes — the entire backend                                           |
| [06-verification-ui.md](06-verification-ui.md) | The screen where the user lives                                          |
| [07-how-it-works.md](07-how-it-works.md)       | **How the whole app works in plain words — from file to export**         |
| [08-template-gaps.md](08-template-gaps.md)     | **What the repository has, what is a stub, what is missing**             |
| [09-open-questions.md](09-open-questions.md)   | **What is not decided yet: columns without rules, undescribed screens**  |
| [10-infra.md](10-infra.md)                     | One EC2 host, two S3 buckets, what it costs and how to switch it off     |
| [11-how-we-work.md](11-how-we-work.md)         | **The board, the releases, who moves what — start here as a newcomer**   |
| [12-claude-code.md](12-claude-code.md)         | Shared Claude Code agent (`code-review`) and skill (`feature-assistant`) |
| [13-codex.md](13-codex.md)                     | Shared Codex CLI agent (`code-review`) and skill (`feature-assistant`)   |

## Diagrams

Mermaid. They render on GitHub and in VS Code (Markdown Preview Mermaid
extension).

Every diagram carries its own explanations: a colour and line legend, a "how to
read this" hint, and panels with the reasoning behind decisions. A walkthrough
of each is in **[diagrams/README.md](diagrams/README.md)**.

| File                                                              | What it shows                                                 | How to read it                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------- |
| [01-overview.mmd](diagrams/01-overview.mmd)                       | System components and the 7 links between them                | top to bottom                      |
| [02-data-pipeline.mmd](diagrams/02-data-pipeline.mmd)             | **The data pipeline — the main one.** 23 steps, 4 phases      | right for phases, down for steps   |
| [03-transcribe-sequence.mmd](diagrams/03-transcribe-sequence.mmd) | Processing one page: who calls whom                           | top to bottom                      |
| [04-context-learning.mmd](diagrams/04-context-learning.mmd)       | **The context feedback loop in full**                         | top to bottom, closes on the right |
| [05-sliding-window.mmd](diagrams/05-sliding-window.mmd)           | Why the human never waits and why the window is 5             | top to bottom                      |
| [06-database.mmd](diagrams/06-database.mmd)                       | DB schema: 9 tables with every field explained                | top to bottom, by ownership        |
| [07-page-states.mmd](diagrams/07-page-states.mmd)                 | Life of a page: 9 states, set by the machine and by the human | left to right                      |

## Demo video

An animation of the system as a working web app — from uploading a PDF to
exporting CSV, 1920×1080, ~110 seconds. It walks the same flow this
documentation describes, blank pages and budget counter included.

```bash
npm run demo:setup   # once: Playwright + Chromium into docs/demo/.cache
npm run demo         # → docs/demo/out/transcripta-demo.mp4
npm run demo:shots   # stills only, a fast check
```

Source lives in [demo/](demo/README.md) and is 40 KB of plain HTML; the render
in `out/` is git-ignored as a regenerable artefact.

## Database schema

| File                                   | What                                             |
| -------------------------------------- | ------------------------------------------------ |
| [schema/schema.sql](schema/schema.sql) | Full DDL with comments — **the source of truth** |
| [schema/seed.sql](schema/seed.sql)     | Seed data + an example preset                    |

It is applied through Knex migrations in `apps/backend/src/db/migrations/`,
not by running these files. The order when the schema changes: edit the SQL →
write the migration. The split between the query builder and `knex.raw` is in
[04-database.md](04-database.md#knex-and-objection).

The `users` table is not part of this: it is already created by the template's
migration, which is exactly why every reference to a user in the schema is
`integer` and not `uuid`.

---

## Implementation order

**The main rule: first get one file through the whole path, then everything
else.**

```
1. one page by hand, no database and no queue   ← check the model can read at all
2. database + upload + splitting into pages
3. queue + the whole document gets processed
4. verification screen                          ← usefulness appears
5. context learning + CER measurement           ← the product appears
6. export, presets, polish
```

Do not start with the queue. Do not start with a beautiful UI. Do not start
with a 20-table database. Every stage ends with something you can show; if you
stop at stage 4, the system already works, just without accumulating context.

---

## Two things to know before you start

### 1. Measure CER first, write code second

Before writing the database, the queue and the UI, measure **CER** — the
percentage of wrong characters — on real scans of your kind of document.

| CER       | Decision                                                     |
| --------- | ------------------------------------------------------------ |
| < 15%     | Go ahead                                                     |
| 15-30%    | Go ahead, but tune dpi, model and prompt first               |
| **> 30%** | **Stop.** Typing from scratch is faster. Change the material |

Without this check the rest of the work may turn out to be pointless.

### 2. Context poisoning is the main danger

If a human confirms a mistake, it enters the lexicon and **multiplies** across
every following page. Worse still — the text becomes more consistent, so it
looks **better**.

Four guards are designed in from the start, not bolted on later:
[03-core-logic.md](03-core-logic.md#6-context-poisoning--the-main-danger).

The only way to prove context learning works is measurement: 15 pages typed by
hand **blind**, one run with context and one without, then compare CER.

---

## Verifying the artefacts

```bash
# DB schema against a clean Postgres
docker run -d --rm --name pg -e POSTGRES_PASSWORD=x -p 55432:5432 postgres:17 && sleep 6
PGPASSWORD=x psql -h 127.0.0.1 -p 55432 -U postgres -v ON_ERROR_STOP=1 -f docs/schema/schema.sql
PGPASSWORD=x psql -h 127.0.0.1 -p 55432 -U postgres -v ON_ERROR_STOP=1 -f docs/schema/seed.sql
PGPASSWORD=x psql -h 127.0.0.1 -p 55432 -U postgres -c "SELECT * FROM document_progress;"
docker stop pg

# Diagrams
for f in docs/diagrams/*.mmd; do npx -p @mermaid-js/mermaid-cli mmdc -i "$f" -o "/tmp/$(basename $f .mmd).svg"; done
```

If you have no docker, the same check runs without it — Postgres is built to
WASM and starts straight inside Node:

```bash
npm i @electric-sql/pglite
node -e "
const {PGlite}=require('@electric-sql/pglite'),fs=require('fs');
(async()=>{const db=new PGlite();
await db.exec(fs.readFileSync('docs/schema/schema.sql','utf8'));
await db.exec(fs.readFileSync('docs/schema/seed.sql','utf8'));
console.table((await db.query('SELECT * FROM document_progress')).rows);})()"
```

**Verification status.** `schema.sql` and `seed.sql` run without errors on
**PostgreSQL 17.5**, the target version. All five guards fire (immutable
`preset`, append-only `page_event`, unique `is_current`, `version > 0`,
non-negative budget), the `page_event_once` index rejects a replayed
confirmation, and the views return numbers as numbers and money as strings —
checked on the real `pg` driver, where an un-cast `count()` would have come
back as a string.
