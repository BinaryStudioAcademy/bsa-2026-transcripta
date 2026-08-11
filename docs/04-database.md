# 04 - Database

Full SQL: [schema/schema.sql](schema/schema.sql).
Seed data: [schema/seed.sql](schema/seed.sql).
Diagram: [06-database.mmd](diagrams/06-database.mmd)

**Verification status.** Both files run on a clean **PostgreSQL 17.5** — the
target version — without errors. Verified against real Postgres binaries, not
an emulation. The commands are
[at the end of this document](#verifying-the-schema).

What was confirmed by running it, not by reading:

| Check                                         | Result                                                                |
| --------------------------------------------- | --------------------------------------------------------------------- |
| `schema.sql` + `seed.sql` on a clean database | they run                                                              |
| The `preset` immutability trigger             | `UPDATE` fails                                                        |
| Append-only `page_event`                      | `UPDATE` fails                                                        |
| Partial UNIQUE on `is_current`                | a second current transcription fails                                  |
| `CHECK` on `version > 0` and the budget       | both fail                                                             |
| `document_progress`                           | `pages_total` a number, `verified_pct` a number, `spent_usd` a string |
| Sequences after the seed                      | subsequent `INSERT`s do not clash; `family_id` takes its `DEFAULT`    |
| Lexicon top-K and the affected-pages lookup   | return the expected rows                                              |
| The `page_event_once` index                   | a replayed `confirm` is rejected, a different action still passes     |
| Object counts                                 | 9 tables, 3 views, 4 enums, 8 triggers — matching this document       |

9 tables, 3 views, 4 enums. Applied through Knex migrations, not by running
this file.

---

## The schema at a glance

```
users  ← from the template, not ours
   │
   ├──< preset          (immutable, versions through family_id + version)
   │       │
   └──< document ───────┘
          │
          ├──< page ──< transcription
          │      │
          │      └──< page_event        (history: who, what, when, how long)
          │
          ├──< lexicon_entry            (document lexicon)
          └──< document_export

transcription_cache     (standalone, unrelated)
```

---

## Tables

| #   | Table                 | What for                                                            |
| --- | --------------------- | ------------------------------------------------------------------- |
| 1   | `users`               | **From the template.** Users, email + password. We do not create it |
| 2   | `preset`              | Settings for a document type. The row is never updated              |
| 3   | `document`            | Uploaded file, status, budget, cursor position                      |
| 4   | `page`                | A page: image keys, status, who verified it                         |
| 5   | `transcription`       | What the model read + corrections + cost + which context was used   |
| 6   | `lexicon_entry`       | Document lexicon with frequencies                                   |
| 7   | `page_event`          | Action history. Append-only                                         |
| 8   | `transcription_cache` | So we never pay twice for the same thing                            |
| 9   | `document_export`     | Generated exports                                                   |

---

## Explaining the tricky decisions

### 0. Why every key is `integer` and not `uuid`

The reason is not in the database but in the template's base model:

```ts
// apps/backend/src/libs/modules/database/abstract.model.ts
class Abstract extends Model {
	public id!: number;
	public createdAt!: string;
	public updatedAt!: string;
	// $beforeInsert / $beforeUpdate set the timestamps
}
```

`id` is declared as `number`, hard. Domain models extend `AbstractModel` for
the timestamp hooks and the types — so their primary keys are `integer` too.
Keeping uuid would mean either writing a parallel base model or giving up
inheritance entirely.

| Consequence                                   | What it means in practice                                                     |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| All PKs and FKs are `integer`                 | `serial` in every one of our tables, no exceptions                            |
| Password is `password_hash` + `password_salt` | The hashing scheme is set by the template; the seed does not recreate it      |
| `users` uses time without a zone              | Our tables stay on `timestamptz`; the discrepancy is known and deliberate     |
| No `is_admin`                                 | Added by a separate migration when access to other users' documents is needed |

**The price of this decision is security, and it has to be paid explicitly.**
Sequential ids in `/api/v1/documents/47` are trivial to enumerate. So the
ownership check (`document.owner_id = currentUser.id` → otherwise
`403 forbidden`) is mandatory on **every** route that accepts an id. With uuid
sloppiness here could go unnoticed for a long time; with integers it is caught
in the first review.

### 0.1 The preset's `family_id` in the absence of uuid

`family_id` used to be a separate uuid generated by the application. With
integers there is nowhere to get one at insert time, so we set up a sequence of
our own:

```sql
CREATE SEQUENCE preset_family_seq;
family_id integer NOT NULL DEFAULT nextval('preset_family_seq')
```

| Action      | How                                                               |
| ----------- | ----------------------------------------------------------------- |
| New preset  | Do not pass `family_id` at all — `DEFAULT` takes the next number  |
| New version | Pass the existing version's `family_id` explicitly, `version + 1` |

**Why not "insert, then `UPDATE ... SET family_id = id`".** The tempting idea
is to skip the sequence, because the first version's id is already unique. But
this table is protected by the `preset_immutable` trigger, which forbids
**any** `UPDATE`. Filling the value in after the insert is impossible — the
transaction fails with `preset table is not updatable`.

### 1. A preset is never updated — a new version is created

```sql
CONSTRAINT preset_version_unique UNIQUE (family_id, version)
CREATE TRIGGER preset_immutable BEFORE UPDATE ON preset ...
```

`family_id` is shared by all versions of one preset, `version` grows. Change
the prompt and a new row with `version = 2` appears.

**Why.** A transcription references a specific `preset_id`. Without that you
cannot answer "why does page 10 look different from page 400" — and that
question is guaranteed to come up the moment someone edits a preset mid-run.

A trigger, not an agreement: agreements are forgotten, triggers are not.

```
=> UPDATE preset SET name = 'new';
ERROR:  preset table is not updatable, create a new row
```

### 2. `is_current` instead of a pointer from `page` to a transcription

It is tempting to add `page.current_transcription_id`. We do not: that is
duplicated state, and one day it will go out of sync.

Instead there is a flag on the transcription plus a partial unique index:

```sql
CREATE UNIQUE INDEX transcription_one_current
  ON transcription (page_id) WHERE is_current;
```

The database itself guarantees there is exactly one current transcription,
while the history of re-runs is preserved.

### 3. `context_used` — the most important field in the schema

```sql
context_used jsonb NOT NULL DEFAULT '{}'::jsonb
-- { "pageIds": [...], "lexiconIds": [1, 2], "hash": "...", "tokens": 1840 }
```

This records **which context exactly went into this call**.

Without this field, fixing context poisoning is impossible. You discover a word
in the lexicon is wrong — then what? Recompute all 500 pages? With the field
you can find precisely the ones that were affected:

```sql
SELECT p.page_no, p.status
FROM page p
JOIN transcription t ON t.page_id = p.id AND t.is_current
WHERE p.document_id = $1
  AND p.status = 'transcribed'                       -- not yet confirmed by a human
  AND t.context_used -> 'lexiconIds' @> to_jsonb($2::int);
```

The GIN index on `context_used` makes this query fast.

**Confirmed pages are not reprocessed automatically** — they are only flagged.
Overwriting what a human confirmed is worse than leaving the mistake in place.

### 4. `distinct_pages` separately from `freq`

```sql
freq           integer  -- how many times the word occurred
distinct_pages integer  -- on how many DIFFERENT pages
```

The threshold for entering the context is counted on `distinct_pages`.

A surname mentioned 30 times on one page may be a single mistake repeated
inside a table. A surname appearing once on three pages is three independent
confirmations. The second is more reliable.

A partial index for the main context-building query:

```sql
CREATE INDEX lexicon_topk_idx
  ON lexicon_entry (document_id, distinct_pages DESC, freq DESC)
  WHERE invalidated_at IS NULL;
```

`WHERE invalidated_at IS NULL` right in the index — wrong words physically do
not enter the index rather than merely being filtered out.

### 5. Cost is stored in `transcription`, not in a separate table

```sql
provider, model, input_tokens, output_tokens, cost_usd, latency_ms
```

By the rules of normalisation this should be a separate table of calls. Here
that would be an extra join in every query.

What we lose: accounting for failed calls, which also cost money. Acceptable —
there are few of them and they are visible in `page_event`.

### 5.1 The cache is never cleaned, and that is a decision

`transcription_cache` deliberately has no foreign keys — it must survive the
deletion of a document. The consequence is that nothing ever removes rows from
it.

For this project that is fine: a few thousand rows of text. It is written down
so that "the cache grows forever" is a decision rather than something nobody
thought about. `last_hit_at` is already in the schema, so a TTL can be added
later without a migration:

```sql
DELETE FROM transcription_cache WHERE last_hit_at < now() - interval '90 days';
```

### 6. One `page_event` table instead of separate audit and history

Verification history and audit are the same thing: who did what and when.
There is no reason to split them into two tables.

`duration_ms` lives there too — it is the headline product metric, "seconds per
page".

---

## Ready-made queries as views

Progress is requested on every verification step. Let the database compute it,
not the application.

### `document_progress`

```
        title             |   status   | pages_total | pages_verified | verified_pct
--------------------------+------------+-------------+----------------+--------------
 Parish register …, 1887  | processing |           3 |              1 |         33.3
```

### `document_cost`

```
 calls | total_cost_usd | input_tokens | avg_latency_ms | cache_hits
-------+----------------+--------------+----------------+------------
     2 |       0.043200 |         7300 |          25450 |          0
```

### `verification_speed`

```
 pages | avg_ms | median_ms | clean_rate
-------+--------+-----------+------------
     1 |   7400 |      7400 |      1.000
```

### Two percentages, and confusing them makes the UI lie

`document_progress` returns both `verified_pct` and `closed_pct`, and they
answer different questions:

| Column         | Counts                                  | Answers                      |
| -------------- | --------------------------------------- | ---------------------------- |
| `verified_pct` | `confirmed` + `corrected`               | How much a human really read |
| `closed_pct`   | those plus `skipped`, `blank`, `failed` | How much is finished         |

They diverge, and that is not a bug. A document where two pages were skipped
and one is blank reaches `status = 'done'` at `closed_pct = 100` while
`verified_pct` stays at 97. Showing `verified_pct` next to the word "done"
would look broken; showing `closed_pct` alone would hide that three pages
nobody read are about to be exported.

The progress bar uses `closed_pct`; the number beside it is `verified_pct`.

`clean_rate` is the share of pages confirmed without edits. It is the cheapest
quality indicator: it needs no ground truth and is computed on live data.

| clean_rate | What it means                                                               |
| ---------- | --------------------------------------------------------------------------- |
| < 0.3      | The model is bad, the human is effectively typing                           |
| 0.3-0.6    | The working range for difficult cursive                                     |
| 0.6-0.85   | Good                                                                        |
| > 0.9      | Either the material is easy, or **the human is confirming without looking** |

The last row matters: a sharp jump in `clean_rate` together with a drop in
`avg_ms` means a tired verifier — and that is exactly when mistakes crawl into
the context.

---

## The indexes that actually carry load

Out of all the indexes in the schema, four carry the load:

| Index                             | Query                           | When it is used          |
| --------------------------------- | ------------------------------- | ------------------------ |
| `page_doc_no_idx`                 | Next page, filling the window   | Every verification step  |
| `transcription_one_current`       | Current transcription of a page | Every verification step  |
| `lexicon_topk_idx`                | Lexicon top-K                   | Every transcription      |
| `transcription_context_idx` (GIN) | Finding affected pages          | Rarely, but must be fast |

---

## Verifying the schema

```bash
docker run -d --rm --name pg -e POSTGRES_PASSWORD=x -p 55432:5432 postgres:17
sleep 6
PGPASSWORD=x psql -h 127.0.0.1 -p 55432 -U postgres -v ON_ERROR_STOP=1 -f docs/schema/schema.sql
PGPASSWORD=x psql -h 127.0.0.1 -p 55432 -U postgres -v ON_ERROR_STOP=1 -f docs/schema/seed.sql
PGPASSWORD=x psql -h 127.0.0.1 -p 55432 -U postgres -c "SELECT * FROM document_progress;"
docker stop pg
```

Without docker — the same thing through PGlite; the command is in the
[README](README.md#verifying-the-artefacts).

These queries must **fail** — that is how you check the guards work:

```sql
UPDATE preset SET name = 'hack';                    -- immutability trigger
UPDATE page_event SET event = 'hack';               -- append-only
INSERT INTO transcription (page_id, document_id, preset_id, text, is_current)
  VALUES (1, 1, 1, 'duplicate', true);              -- second current row per page
INSERT INTO preset (family_id, version, owner_id, name, instructions)
  VALUES (99, 0, 1, 'x', 'y');                      -- version > 0
INSERT INTO document (owner_id, preset_id, title, budget_usd)
  VALUES (1, 1, 'x', -5);                           -- non-negative budget
```

All five fail — confirmed by running them.

---

## Knex and Objection

The schema is applied through **Knex migrations** in
`apps/backend/src/db/migrations/`. File names are `snake_case`, as
`.ls-lint.yml` requires.

The commands are ready-made npm scripts in `apps/backend`, not `npx knex`:

```bash
npm run migrate:dev:make -w apps/backend -- add_documents_table   # new migration
npm run migrate:dev      -w apps/backend                          # apply
npm run migrate:dev:down -w apps/backend                          # roll back one
npm run migrate:dev:rollback -w apps/backend                      # roll back all
```

**Calling `npx knex` directly will not work.** `knexfile.ts` imports the config
through the `~/` alias, so the scripts run the CLI under
`ts-paths-esm-loader`:

```
node --loader ts-paths-esm-loader ../../node_modules/knex/bin/cli.js migrate:latest
```

The `migrate` / `prestart` pair without the `:dev` suffix is for the built
application: `npm start` applies migrations first, then brings the server up.

**The source of truth is the SQL in `docs/schema/schema.sql`.** A migration
ports it, it does not replace it. The order when the schema changes: edit the
SQL → write the migration.

### What the builder does and what raw SQL does

| Construct                                | How it is written                                                                                   |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Tables, columns, FKs, ordinary indexes   | `knex.schema.createTable`                                                                           |
| Enums                                    | `knex.raw('CREATE TYPE …')`, then `table.enu(…, { useNative: true, existingType: true, enumName })` |
| Partial indexes (`WHERE …`)              | `knex.raw`                                                                                          |
| GIN over jsonb                           | `knex.raw`                                                                                          |
| Views, functions, triggers, `COMMENT ON` | `knex.raw`                                                                                          |

The order inside migrations: types → tables → indexes → views → triggers. In
`down()` the reverse, otherwise `DROP TYPE` fails because of dependent columns.

### Objection for CRUD, Knex for the rest

Objection models extend `AbstractModel` and take their table name from
`DatabaseTableName`, like `UserModel` in the template. Our tables must be added
to that enum; right now it holds only `MIGRATIONS` and `USERS`.

Complex queries — lexicon top-K, the affected-pages lookup, aggregates, the
upsert with `CASE WHEN` — are written as raw SQL through `knex.raw`. Do not
fight the builder where SQL is shorter.

Typing is weaker than Prisma would give: entity types are written by hand in
`packages/shared`, where the frontend can see them too.

### The trap: `knex.raw` does not go through the name mapper

The template enables
`knexSnakeCaseMappers({ underscoreBetweenUppercaseLetters: true })` in
`apps/backend/src/libs/modules/database/base-database.module.ts`. The mapper
works **for the builder only**:

| Way of querying          | How to write columns            | What comes back |
| ------------------------ | ------------------------------- | --------------- |
| Objection / Knex builder | `documentId`, `distinctPages`   | camelCase       |
| `knex.raw`               | `document_id`, `distinct_pages` | **snake_case**  |

So our two main queries — lexicon top-K and the affected-pages lookup — will
return `value_display`, not `valueDisplay`. If the surrounding code expects
camelCase, the values will silently be `undefined`: no error, just an empty
context. Either map the result by hand or keep those queries in the builder.

### Three requirements the base model imposes on the schema

Not style but conditions for working at all. Break them and it breaks at
runtime, and two of the three break silently. The full analysis with quotes is
in
[08-template-gaps.md](08-template-gaps.md#61-three-base-model-traps-that-only-show-up-at-runtime).

| Requirement                                               | What happens otherwise                                            |
| --------------------------------------------------------- | ----------------------------------------------------------------- |
| `updated_at` in **every** table                           | `INSERT` fails: `$beforeInsert` always writes `updatedAt`         |
| PKs are `serial`, not `bigserial`                         | `pg` returns `int8` as a string while the model promises `number` |
| `count()` / `round()` in views carry `::int` / `::float8` | The frontend receives `"300"` instead of `300`                    |

Money stays `numeric` and arrives as a string on purpose: `"spentUsd": "0.98"`.
Rounding a budget to a float is not acceptable, and the API reflects that.

### The `updated_at` triggers are needed despite the template's hooks

`AbstractModel` already sets `createdAt`/`updatedAt` in `$beforeInsert` and
`$beforeUpdate`. It looks as though the SQL trigger `touch_updated_at` is
redundant.

It is not: **Objection hooks do not fire on `knex.raw`**, and that is exactly
how we update the lexicon and statuses in batches. The trigger catches what
goes past the model. The overlap is deliberate — both write the same value.

---

## Next

[05-api.md](05-api.md) — the endpoints.
