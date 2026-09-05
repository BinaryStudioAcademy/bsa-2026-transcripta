-- =============================================================================
-- Transcripta - database schema
-- =============================================================================
-- PostgreSQL 17.5
--
-- THIS IS THE SOURCE OF TRUTH FOR THE SCHEMA, but not the way to apply it.
-- The project uses Knex migrations: apps/backend/src/db/migrations/*.ts.
-- Every block below is ported into a migration - plain tables through
-- knex.schema.createTable, partial indexes / views / triggers through knex.raw.
-- Order when the schema changes: edit this file -> write the migration -> never the reverse.
--
-- Quick check on a clean database:
--   psql -f docs/schema/schema.sql
--   psql -f docs/schema/seed.sql
--
-- 9 tables: 8 are ours, users comes from the template (see below).
-- A deliberately minimal schema for a 6-week project.
--
-- Conventions:
--   * time is always timestamptz (never timestamp)
--   * money is numeric (not float: 0.1 + 0.2 <> 0.3)
--   * created_at AND updated_at exist in EVERY table, even an immutable one.
--     This is not style but a requirement: the template's AbstractModel.$beforeInsert
--     writes updatedAt on every insert, and without the column INSERT fails with
--     'column "updated_at" ... does not exist'.
--   * primary keys are serial (int4), NOT bigserial: the pg driver returns int8
--     as a string, while the base model declares id as number.
--
-- The public schema, no separate namespace: the template's migrations write into
-- public, and keeping some tables aside would mean fiddling with search_path
-- in every Knex connection.
-- =============================================================================


-- =============================================================================
-- Enums
-- =============================================================================

CREATE TYPE document_status AS ENUM (
  'draft',        -- created, the file is not uploaded yet
  'ingesting',    -- splitting into pages
  'ready',        -- pages are ready
  'processing',   -- transcription in progress
  'paused',       -- the user stopped it
  'budget_stop',  -- the budget is exhausted
  'done',         -- every page has been verified
  'failed'
);

CREATE TYPE page_status AS ENUM (
  'pending',      -- the page exists, not queued yet
  'queued',       -- in the queue
  'transcribing', -- the worker picked it up
  'transcribed',  -- the machine read it, the human has not
  'confirmed',    -- the human confirmed without changes
  'corrected',    -- the human corrected it
  'skipped',      -- the human skipped it
  'blank',        -- empty page, the LLM was never called
  'failed'
);
-- NOTE: only 'confirmed' and 'corrected' ever feed the context.
-- This is the same constant as CONTEXT_ELIGIBLE in the code. See docs/03-core-logic.md

CREATE TYPE lexicon_kind AS ENUM (
  'person_name', 'surname', 'place', 'term', 'formula', 'abbreviation', 'other'
);

CREATE TYPE export_format AS ENUM ('json', 'csv', 'txt');


-- =============================================================================
-- 1. Users - NOT OUR TABLE
-- =============================================================================
-- users is already created by the template's migration
-- (apps/backend/src/db/migrations/20240127205704_add_users_table.ts),
-- and the ready-made auth module depends on it. We do not rewrite it.
--
-- What that means for the rest of the schema:
--   * id is integer (table.increments), not uuid;
--   * the template's base model (abstract.model.ts) declares `public id!: number`,
--     so ALL our tables are integer too - otherwise domain models could not
--     extend AbstractModel together with its timestamp hooks;
--   * consequence for the API: ids in URLs are sequential and guessable, so the
--     document ownership check is mandatory on EVERY route, not merely desirable;
--   * the password is stored as a password_hash + password_salt pair;
--   * its created_at / updated_at are timestamp without a zone, unlike
--     our tables. The discrepancy is known; touching someone else's migration costs more.
--
-- The CREATE below is needed ONLY to run this file on a clean database
-- (schema check, seed). In the project itself the template's migration does it.

CREATE TABLE IF NOT EXISTS users (
  id            serial      PRIMARY KEY,
  email         text        NOT NULL UNIQUE,
  password_hash text        NOT NULL,
  password_salt text        NOT NULL,
  created_at    timestamp   NOT NULL DEFAULT now(),
  updated_at    timestamp   NOT NULL DEFAULT now()
);

-- The template's schema has no administrator flag.
-- Added by a separate migration when access to other users' documents is needed.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;


-- =============================================================================
-- 2. Presets
-- =============================================================================
-- A preset = transcription settings for a document type.
--
-- The row is NEVER UPDATED. Changing a preset = a new row with version + 1.
-- Reason: a transcription references a specific version. Without that it is
-- impossible to explain why page 10 looks different from page 400.

-- A version family gets its number from a sequence of its own.
-- Through a separate sequence and NOT through `UPDATE ... SET family_id = id`
-- after the insert: the preset_immutable trigger below forbids any UPDATE of
-- this table, so filling the value in afterwards is impossible.
CREATE SEQUENCE preset_family_seq;

CREATE TABLE preset (
  id             serial      PRIMARY KEY,
  -- Shared by all versions of one preset.
  -- New preset: pass nothing, DEFAULT takes the next number.
  -- New version: pass the existing version's family_id explicitly.
  family_id      integer     NOT NULL DEFAULT nextval('preset_family_seq'),
  version        integer     NOT NULL DEFAULT 1,
  owner_id       integer     NOT NULL REFERENCES users(id),

  name           text        NOT NULL,
  description    text        NOT NULL DEFAULT '',
  is_public      boolean     NOT NULL DEFAULT false,

  -- Instructions for the model. They go into the USER MESSAGE,
  -- never into the system one - anyone can write a preset.
  instructions   text        NOT NULL,

  -- JSON Schema of the expected output. Fields with "x-entity-kind"
  -- automatically flow into the lexicon.
  output_schema  jsonb       NOT NULL DEFAULT '{}'::jsonb,

  -- Seed glossary: [{ kind, value, note }]
  -- This is what saves the first pages of a document.
  seed_glossary  jsonb       NOT NULL DEFAULT '[]'::jsonb,

  -- Settings: { provider, model, temperature, dpi, maxContextTokens, ... }
  settings       jsonb       NOT NULL DEFAULT '{}'::jsonb,

  created_at     timestamptz NOT NULL DEFAULT now(),
  -- Never changes (the row is immutable), but the column is mandatory:
  -- AbstractModel.$beforeInsert writes updatedAt on EVERY insert.
  updated_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT preset_version_unique  UNIQUE (family_id, version),
  CONSTRAINT preset_version_positive CHECK (version > 0)
);

CREATE INDEX preset_family_idx ON preset (family_id, version DESC);
CREATE INDEX preset_owner_idx  ON preset (owner_id);
CREATE INDEX preset_public_idx ON preset (is_public) WHERE is_public;


-- =============================================================================
-- 3. Documents
-- =============================================================================

CREATE TABLE document (
  id             serial          PRIMARY KEY,
  owner_id       integer         NOT NULL REFERENCES users(id),
  preset_id      integer         NOT NULL REFERENCES preset(id),
  title          text            NOT NULL,
  status         document_status NOT NULL DEFAULT 'draft',

  -- The file in S3
  source_key     text,
  source_name    text,
  source_bytes   bigint,

  page_count     integer         NOT NULL DEFAULT 0,
  cursor_page_no integer         NOT NULL DEFAULT 1,  -- where the verifier is now

  -- Budget. numeric, because it is money.
  budget_usd     numeric(10,4)   NOT NULL DEFAULT 10.0000,
  spent_usd      numeric(12,6)   NOT NULL DEFAULT 0,

  error_message  text,
  created_at     timestamptz     NOT NULL DEFAULT now(),
  updated_at     timestamptz     NOT NULL DEFAULT now(),

  CONSTRAINT document_pages_nonneg CHECK (page_count >= 0),
  CONSTRAINT document_budget_nonneg CHECK (budget_usd >= 0 AND spent_usd >= 0)
);

CREATE INDEX document_owner_idx  ON document (owner_id, created_at DESC);
CREATE INDEX document_status_idx ON document (status);


-- =============================================================================
-- 4. Pages
-- =============================================================================

CREATE TABLE page (
  id           serial      PRIMARY KEY,
  document_id  integer     NOT NULL REFERENCES document(id) ON DELETE CASCADE,
  page_no      integer     NOT NULL,

  image_key    text,        -- normalised image for the LLM
  thumb_key    text,        -- thumbnail for the strip in the UI
  image_sha256 text,        -- cache key: same image = same result

  status       page_status NOT NULL DEFAULT 'pending',

  -- Who verified it and when. Edit history lives in page_event.
  verified_by  integer     REFERENCES users(id),
  verified_at  timestamptz,

  attempts     integer     NOT NULL DEFAULT 0,
  last_error   text,

  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT page_unique_in_document UNIQUE (document_id, page_no),
  CONSTRAINT page_no_positive        CHECK (page_no >= 1)
);

-- The main index: next page for the verifier, filling the window
CREATE INDEX page_doc_no_idx  ON page (document_id, page_no);
CREATE INDEX page_status_idx  ON page (document_id, status);
-- For finding stuck pages
CREATE INDEX page_stuck_idx   ON page (updated_at) WHERE status IN ('queued', 'transcribing');


-- =============================================================================
-- 5. Transcriptions
-- =============================================================================
-- A page can have several transcriptions (re-runs).
-- The current one is marked is_current - a partial UNIQUE guarantees there is one.

CREATE TABLE transcription (
  id            serial      PRIMARY KEY,
  page_id       integer     NOT NULL REFERENCES page(id) ON DELETE CASCADE,
  document_id   integer     NOT NULL REFERENCES document(id) ON DELETE CASCADE,
  preset_id     integer     NOT NULL REFERENCES preset(id),

  -- What the model read
  text          text        NOT NULL DEFAULT '',
  structured    jsonb,       -- follows the preset's output_schema

  -- The human's corrections (NULL if confirmed unchanged)
  edited_text   text,
  edited_structured jsonb,

  -- WHICH CONTEXT WENT INTO THIS CALL.
  -- Without it there is no way to find the pages affected by a wrong word
  -- in the lexicon, and the only option left is recomputing the whole document.
  -- Format: { pageIds: [...], lexiconIds: [...], hash: "...", tokens: 1840 }
  context_used  jsonb       NOT NULL DEFAULT '{}'::jsonb,

  -- What it cost. In the same table to avoid extra joins.
  provider      text,
  model         text,
  input_tokens  integer     NOT NULL DEFAULT 0,
  output_tokens integer     NOT NULL DEFAULT 0,
  cost_usd      numeric(12,6) NOT NULL DEFAULT 0,
  latency_ms    integer     NOT NULL DEFAULT 0,
  from_cache    boolean     NOT NULL DEFAULT false,

  is_current    boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Guarantee: exactly one current transcription per page
CREATE UNIQUE INDEX transcription_one_current
  ON transcription (page_id) WHERE is_current;

CREATE INDEX transcription_page_idx ON transcription (page_id, created_at DESC);
CREATE INDEX transcription_doc_idx  ON transcription (document_id);
-- For finding pages that used a specific lexicon word
CREATE INDEX transcription_context_idx ON transcription USING GIN (context_used);

COMMENT ON COLUMN transcription.context_used IS
  'A snapshot of the context. Main query: find pages whose context contained '
  'a wrong word - context_used -> ''lexiconIds'' @> to_jsonb(id)';


-- =============================================================================
-- 6. Document lexicon
-- =============================================================================
-- Filled from confirmed pages. Read while building the context.

CREATE TABLE lexicon_entry (
  id               serial       PRIMARY KEY,
  document_id      integer      NOT NULL REFERENCES document(id) ON DELETE CASCADE,
  kind             lexicon_kind NOT NULL,

  value_normalized text         NOT NULL,   -- for deduplication: "ivanenko"
  value_display    text         NOT NULL,   -- for the prompt: "Ivanenko"

  freq             integer      NOT NULL DEFAULT 1,
  -- The threshold for entering the context is counted ON THIS field, not on freq.
  -- A surname 30 times on one page is a weaker signal than
  -- a surname once on each of three pages.
  distinct_pages   integer      NOT NULL DEFAULT 1,
  first_page_no    integer      NOT NULL,
  last_page_no     integer      NOT NULL,

  -- The "this word is wrong" mark. Such words never feed the context.
  invalidated_at   timestamptz,
  invalid_reason   text,

  created_at       timestamptz  NOT NULL DEFAULT now(),
  updated_at       timestamptz  NOT NULL DEFAULT now(),

  CONSTRAINT lexicon_unique UNIQUE (document_id, kind, value_normalized),
  CONSTRAINT lexicon_freq_positive CHECK (freq >= 1)
);

-- The main context-building query: top-K live words
CREATE INDEX lexicon_topk_idx
  ON lexicon_entry (document_id, distinct_pages DESC, freq DESC)
  WHERE invalidated_at IS NULL;


-- =============================================================================
-- 7. Event history
-- =============================================================================
-- One table for both the audit trail and the verification history.
-- Append-only: rows are never updated.

CREATE TABLE page_event (
  id          serial      PRIMARY KEY,
  document_id integer     NOT NULL REFERENCES document(id) ON DELETE CASCADE,
  page_id     integer     REFERENCES page(id) ON DELETE CASCADE,

  -- Which transcription the human acted against. NULL for system events
  -- (transcribed, failed). For human actions it is what makes a replay
  -- detectable - see the unique index below.
  transcription_id integer REFERENCES transcription(id) ON DELETE CASCADE,

  -- confirm | correct | skip | reprocess | transcribed | failed | ...
  event       text        NOT NULL,
  actor_id    integer     REFERENCES users(id),

  -- For edits: { before, after, editDistance }
  -- For errors: { error, attempt }
  details     jsonb       NOT NULL DEFAULT '{}'::jsonb,

  -- How long the human spent on the page. The headline product metric.
  duration_ms integer,

  created_at  timestamptz NOT NULL DEFAULT now(),
  -- append-only, but the column is required by the base model's $beforeInsert
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Idempotency of verification. The offline queue in the browser may resend the
-- same action: the request went through but the response was lost. Without this
-- index a replay would increment the lexicon counters a second time, and
-- distinct_pages is the threshold for entering the context - a word would reach
-- the prompt without having earned it.
-- Partial: only human actions are unique. transcribed/failed repeat on re-runs.
CREATE UNIQUE INDEX page_event_once
  ON page_event (page_id, transcription_id, event)
  WHERE event IN ('confirm', 'correct', 'skip');

CREATE INDEX page_event_page_idx ON page_event (page_id, created_at DESC);
CREATE INDEX page_event_doc_idx  ON page_event (document_id, created_at DESC);


-- =============================================================================
-- 8. Transcription cache
-- =============================================================================
-- In Postgres, not Redis: a cache that vanishes on restart does not do
-- its main job - making a re-run free.

CREATE TABLE transcription_cache (
  cache_key     text        PRIMARY KEY,  -- sha256(image_sha|preset_id|model|context_hash)
  text          text        NOT NULL,
  structured    jsonb,
  input_tokens  integer     NOT NULL DEFAULT 0,
  output_tokens integer     NOT NULL DEFAULT 0,
  cost_usd      numeric(12,6) NOT NULL DEFAULT 0,
  hit_count     integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  last_hit_at   timestamptz
);


-- =============================================================================
-- 9. Exports
-- =============================================================================

CREATE TABLE document_export (
  id           serial        PRIMARY KEY,
  document_id  integer       NOT NULL REFERENCES document(id) ON DELETE CASCADE,
  format       export_format NOT NULL,
  status       text          NOT NULL DEFAULT 'queued',  -- queued | ready | failed
  object_key   text,
  requested_by integer       NOT NULL REFERENCES users(id),
  created_at   timestamptz   NOT NULL DEFAULT now(),
  updated_at   timestamptz   NOT NULL DEFAULT now(),
  finished_at  timestamptz,
  error_message text
);

CREATE INDEX document_export_doc_idx ON document_export (document_id, created_at DESC);


-- =============================================================================
-- Ready-made queries as VIEWs
-- =============================================================================
-- Progress is requested on every verification step - let the DB compute it.

CREATE VIEW document_progress AS
SELECT
  d.id                                                     AS document_id,
  d.title,
  d.status,
  d.page_count,
  d.cursor_page_no,
  d.budget_usd,
  d.spent_usd,
  -- ::int and ::float8 are mandatory. count() returns bigint, round() numeric,
  -- and the pg driver turns both into STRINGS. Without casting the frontend gets
  -- "300" instead of 300 and "15.3" instead of 15.3.
  count(p.*)::int                                          AS pages_total,
  count(p.*) FILTER (WHERE p.status IN ('confirmed','corrected'))::int AS pages_verified,
  count(p.*) FILTER (WHERE p.status = 'transcribed')::int  AS pages_ready_to_check,
  count(p.*) FILTER (WHERE p.status IN ('queued','transcribing'))::int AS pages_in_work,
  count(p.*) FILTER (WHERE p.status = 'pending')::int       AS pages_pending,
  count(p.*) FILTER (WHERE p.status = 'failed')::int       AS pages_failed,
  count(p.*) FILTER (WHERE p.status = 'blank')::int        AS pages_blank,
  count(p.*) FILTER (WHERE p.status = 'skipped')::int      AS pages_skipped,
  -- Two different percentages, and confusing them makes the UI lie.
  -- verified_pct - how much a HUMAN actually read.
  -- closed_pct   - how much is finished. blank/skipped/failed are closed but
  --                not verified, so a done document can sit at verified 96%.
  CASE WHEN count(p.*) > 0
       THEN round(count(p.*) FILTER (WHERE p.status IN ('confirmed','corrected'))::numeric
                  / count(p.*) * 100, 1)::float8
       ELSE 0 END                                          AS verified_pct,
  CASE WHEN count(p.*) > 0
       THEN round(count(p.*) FILTER (WHERE p.status IN
                  ('confirmed','corrected','skipped','blank','failed'))::numeric
                  / count(p.*) * 100, 1)::float8
       ELSE 0 END                                          AS closed_pct
FROM document d
LEFT JOIN page p ON p.document_id = d.id
GROUP BY d.id;


-- What the document cost and how much of it the context ate.
CREATE VIEW document_cost AS
SELECT
  document_id,
  count(*)::int                     AS calls,
  sum(cost_usd)                     AS total_cost_usd,  -- numeric: stays a string, it is money
  sum(input_tokens)::int            AS input_tokens,
  sum(output_tokens)::int           AS output_tokens,
  round(avg(latency_ms))::int       AS avg_latency_ms,
  count(*) FILTER (WHERE from_cache)::int AS cache_hits
FROM transcription
GROUP BY document_id;


-- Verification speed - the headline product metric.
CREATE VIEW verification_speed AS
SELECT
  document_id,
  actor_id,
  count(*)::int                                                   AS pages,
  round(avg(duration_ms))::int                                    AS avg_ms,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY duration_ms)        AS median_ms,
  -- Share of pages confirmed without edits. The cheapest indicator of
  -- model quality: it needs no ground truth and runs on live data.
  round(count(*) FILTER (WHERE event = 'confirm')::numeric
        / nullif(count(*) FILTER (WHERE event IN ('confirm','correct')), 0), 3)::float8 AS clean_rate
FROM page_event
WHERE event IN ('confirm', 'correct') AND duration_ms IS NOT NULL
GROUP BY document_id, actor_id;


-- =============================================================================
-- Triggers
-- =============================================================================

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER document_touch BEFORE UPDATE ON document
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER page_touch BEFORE UPDATE ON page
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER lexicon_touch BEFORE UPDATE ON lexicon_entry
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER transcription_touch BEFORE UPDATE ON transcription
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER export_touch BEFORE UPDATE ON document_export
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER cache_touch BEFORE UPDATE ON transcription_cache
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();


-- Presets and the event history are never updated.
-- Discipline enforced by the database, not only by agreement in code review.
CREATE OR REPLACE FUNCTION forbid_update() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION '% table is not updatable, create a new row', TG_TABLE_NAME;
END;
$$;

CREATE TRIGGER preset_immutable BEFORE UPDATE ON preset
  FOR EACH ROW EXECUTE FUNCTION forbid_update();
CREATE TRIGGER page_event_immutable BEFORE UPDATE ON page_event
  FOR EACH ROW EXECUTE FUNCTION forbid_update();


-- =============================================================================
-- How this maps onto Knex migrations
-- =============================================================================
-- Not everything in the schema can be expressed with the builder. The split:
--
--   knex.schema.createTable   plain columns, PK, FK, UNIQUE, ordinary indexes
--   knex.raw                  CREATE TYPE, partial indexes (WHERE ...),
--                             GIN, views, functions, triggers, COMMENT ON
--
-- Enums are conveniently declared as native ones:
--   table.enu('status', null, {
--     useNative: true, existingType: true, enumName: 'page_status'
--   })
-- the CREATE TYPE itself is a separate knex.raw BEFORE createTable.
--
-- Migration order matters: types -> tables -> indexes -> views -> triggers.
-- In down() everything is removed in reverse order, otherwise DROP TYPE fails
-- because of dependent columns.
--
-- What must NOT be lost in the port, because it is what makes the schema right:
--   * transcription_one_current - partial UNIQUE, the "exactly one current" guarantee
--   * lexicon_topk_idx          - partial index, the main context query
--   * transcription_context_idx - GIN, finding affected pages
--   * preset_immutable          - forbids UPDATE on a preset
--   * page_event_immutable      - append-only history
