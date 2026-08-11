-- =============================================================================
-- Transcripta - seed data
-- =============================================================================
-- Run AFTER schema.sql:
--   psql -f docs/schema/schema.sql
--   psql -f docs/schema/seed.sql
--
-- Creates: a user, an example preset, a 3-page document.
-- Enough to check the VIEWs and start the frontend without a real file.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- User
-- -----------------------------------------------------------------------------
-- The users table comes from the template: integer id, a password_hash +
-- password_salt pair. The values below are fake. A real user should be created
-- through POST /api/v1/auth/sign-up so the hash is computed by the same code
-- that will verify it - but right now that route also writes the literals
-- "HASH"/"SALT" (see docs/08-template-gaps.md).

INSERT INTO users (id, email, password_hash, password_salt, is_admin) VALUES
  (1, 'demo@example.org', 'seed-placeholder-hash', 'seed-placeholder-salt', true)
ON CONFLICT (email) DO NOTHING;

-- serial knows nothing about a manually inserted id - without this the next
-- register call would fail on a primary key conflict.
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT max(id) FROM users));


-- -----------------------------------------------------------------------------
-- Preset: parish register
-- -----------------------------------------------------------------------------
-- Shows every part of a preset. Copy it as a template for your document type.

INSERT INTO preset (
  id, family_id, version, owner_id, name, description,
  instructions, output_schema, seed_glossary, settings
) VALUES (
  1,
  1,
  1,
  1,
  'Parish register, late 19th century',
  'Parish records of births, marriages and deaths. Cursive, faded ink.',

  -- instructions: goes into the USER MESSAGE, not the system one
  'This is a page from a late 19th-century Orthodox parish register.
The text is written in cursive and the ink has faded in places.

Rules:
- Preserve the original spelling, including archaic letters. Do not modernise.
- Expand abbreviations in square brackets: "archpr." -> "archpr.[iest]".
- Mark the illegible as [?] and the completely lost as [...].
- Keep dates exactly as written, do not convert the calendar.
- Return an empty cell as null, not as an empty string.',

  -- output_schema: fields with "x-entity-kind" flow into the lexicon
  -- automatically. This saves a separate LLM call for entity extraction.
  '{
    "type": "object",
    "required": ["records"],
    "properties": {
      "records": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "record_no":  { "type": ["integer","null"] },
            "event_type": { "type": "string", "enum": ["birth","marriage","death","unknown"] },
            "date_text":  { "type": ["string","null"] },
            "given_name": { "type": ["string","null"], "x-entity-kind": "person_name" },
            "surname":    { "type": ["string","null"], "x-entity-kind": "surname" },
            "place":      { "type": ["string","null"], "x-entity-kind": "place" },
            "notes":      { "type": ["string","null"] },
            "uncertain":  { "type": "boolean", "default": false }
          }
        }
      }
    }
  }'::jsonb,

  -- seed_glossary: THIS IS WHAT SAVES THE FIRST PAGES.
  -- Without it the first 20 pages read worst - exactly when the user is
  -- forming an impression of the system.
  '[
    { "kind": "formula",      "value": "born and baptised",   "note": "birth record" },
    { "kind": "formula",      "value": "in lawful wedlock",   "note": "" },
    { "kind": "formula",      "value": "died of old age",     "note": "" },
    { "kind": "formula",      "value": "the godparents were", "note": "baptism record" },
    { "kind": "abbreviation", "value": "archpr.",             "note": "archpriest" },
    { "kind": "abbreviation", "value": "peas.",               "note": "peasant" },
    { "kind": "term",         "value": "godparent",           "note": "" },
    { "kind": "place",        "value": "Poltava Governorate", "note": "" }
  ]'::jsonb,

  -- settings: everything is configurable. No magic numbers in the code.
  '{
    "provider": "anthropic",
    "model": "claude-opus-5",
    "temperature": 0,
    "maxOutputTokens": 4096,

    "dpi": 400,
    "maxImageWidth": 2048,
    "grayscale": true,

    "neighbourPages": 3,
    "lexiconTopK": 100,
    "minDistinctPages": 2,
    "maxContextTokens": 6000,

    "windowSize": 5
  }'::jsonb
)
ON CONFLICT (family_id, version) DO NOTHING;


-- -----------------------------------------------------------------------------
-- Demo document, 3 pages
-- -----------------------------------------------------------------------------
-- Page 1 - confirmed (so its text feeds the context)
-- Page 2 - transcribed, waiting to be checked
-- Page 3 - queued

INSERT INTO document (id, owner_id, preset_id, title, status,
                      source_name, page_count, cursor_page_no,
                      budget_usd, spent_usd)
VALUES (1,
        1,
        1,
        'Parish register of Dykanka, 1887',
        'processing', 'dykanka-1887.pdf', 3, 2, 10.0000, 0.043200)
ON CONFLICT (id) DO NOTHING;

INSERT INTO page (id, document_id, page_no, image_key, image_sha256, status, verified_by, verified_at) VALUES
  (1, 1, 1,
   'pages/…/000001.webp', repeat('a',64), 'confirmed', 1, now()),
  (2, 1, 2,
   'pages/…/000002.webp', repeat('b',64), 'transcribed', NULL, NULL),
  (3, 1, 3,
   'pages/…/000003.webp', repeat('c',64), 'queued', NULL, NULL)
ON CONFLICT (document_id, page_no) DO NOTHING;


-- -----------------------------------------------------------------------------
-- Lexicon - filled from CONFIRMED pages
-- -----------------------------------------------------------------------------
-- Inserted BEFORE the transcriptions, because transcription.context_used
-- references the ids of these rows.

INSERT INTO lexicon_entry (document_id, kind, value_normalized, value_display,
                           freq, distinct_pages, first_page_no, last_page_no) VALUES
  (1, 'surname',     'ivanenko', 'Ivanenko', 3, 2, 1, 2),
  (1, 'place',       'dykanka',  'Dykanka',  2, 2, 1, 2),
  -- distinct_pages = 1 -> DOES NOT feed the context yet (threshold is 2)
  (1, 'person_name', 'petr',     'Petr',     1, 1, 1, 1)
ON CONFLICT (document_id, kind, value_normalized) DO NOTHING;


-- -----------------------------------------------------------------------------
-- Transcriptions
-- -----------------------------------------------------------------------------

-- Page 1: there was no context, this is the first page
INSERT INTO transcription (id, page_id, document_id, preset_id, text, context_used,
                           provider, model, input_tokens, output_tokens,
                           cost_usd, latency_ms, is_current)
VALUES (1,
        1,
        1,
        1,
        'No. 14. Born on 7 January, baptised on the 9th, Ioann. Parents: peasant of Dykanka village Petr Ivanenko...',
        '{"pageIds": [], "lexiconIds": [], "hash": "ctx-empty", "tokens": 480}'::jsonb,
        'anthropic', 'claude-opus-5', 3200, 820, 0.021600, 24100, true)
ON CONFLICT (id) DO NOTHING;

-- Page 2: context = page 1 + the two lexicon words that passed the threshold
INSERT INTO transcription (id, page_id, document_id, preset_id, text, context_used,
                           provider, model, input_tokens, output_tokens,
                           cost_usd, latency_ms, is_current)
SELECT 2,
       2,
       1,
       1,
       'No. 15. Born on 11 January, Anna. Parents: peasant of Dykanka village...',
       jsonb_build_object(
         'pageIds',    jsonb_build_array(1),
         'lexiconIds', (SELECT jsonb_agg(id ORDER BY id) FROM lexicon_entry
                        WHERE document_id = 1
                          AND distinct_pages >= 2),
         'hash',   'ctx-page2',
         'tokens', 1840),
       'anthropic', 'claude-opus-5', 4100, 790, 0.021600, 26800, true
ON CONFLICT (id) DO NOTHING;


-- -----------------------------------------------------------------------------
-- Event history
-- -----------------------------------------------------------------------------

INSERT INTO page_event (document_id, page_id, event, actor_id, details, duration_ms) VALUES
  (1, 1,
   'transcribed', NULL, '{"costUsd": "0.0216"}'::jsonb, NULL),
  (1, 1,
   'confirm', 1, '{"editDistance": 0}'::jsonb, 7400),
  (1, 2,
   'transcribed', NULL, '{"costUsd": "0.0216"}'::jsonb, NULL);


-- -----------------------------------------------------------------------------
-- Sequences
-- -----------------------------------------------------------------------------
-- Every insert above uses an explicit id, and serial knows nothing about it.
-- Without this the very first INSERT from the application would fail on a
-- primary key conflict.

SELECT setval(pg_get_serial_sequence('preset', 'id'),
              (SELECT max(id) FROM preset));
-- family_id has a sequence of its own, and the seed passes it explicitly
SELECT setval('preset_family_seq', (SELECT max(family_id) FROM preset));
SELECT setval(pg_get_serial_sequence('document', 'id'),
              (SELECT max(id) FROM document));
SELECT setval(pg_get_serial_sequence('page', 'id'),
              (SELECT max(id) FROM page));
SELECT setval(pg_get_serial_sequence('transcription', 'id'),
              (SELECT max(id) FROM transcription));
