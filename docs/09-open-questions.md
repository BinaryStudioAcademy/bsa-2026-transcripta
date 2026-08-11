# 09 - Decisions taken and what is still open

The first half of this document is a log: nine questions that used to be open
are now decided, with a pointer to where the decision lives. The second half is
what genuinely remains undecided.

Keeping the log matters because most of these decisions look arbitrary from the
outside. The reasoning sits in the topical documents; this page is the index to
it.

---

## Decided

| Question                             | Decision                                                             | Where it lives                                                             |
| ------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| How is a blank page recognised?      | `sharp().stats()` on the greyscale channel, threshold in the preset  | [02](02-data-pipeline.md#detecting-a-blank-page)                           |
| Who counts retries — BullMQ or us?   | Us. Jobs registered with `attempts: 1`, `page.attempts` is the truth | [02](02-data-pipeline.md#retries-one-counter-not-two)                      |
| Who sets `document.status = 'done'`? | The verify handler, in the same transaction as the confirmation      | [02](02-data-pipeline.md#who-sets-documentstatus--done)                    |
| Is the transcription cache cleaned?  | No, and that is deliberate. `last_hit_at` is there for a later TTL   | [04](04-database.md#51-the-cache-is-never-cleaned-and-that-is-a-decision)  |
| Does `Ctrl+Z` roll back the lexicon? | No. The page returns to `transcribed`, the words stay                | [06](06-verification-ui.md#ctrlz-does-not-roll-back-the-lexicon)           |
| How does a user create a preset?     | Built-in templates + text fields. JSON Schema is never hand-edited   | [06](06-verification-ui.md#the-preset-editor)                              |
| Where does the auth guard attach?    | A `preHandler` added together with `params`/`query` validation       | [08](08-template-gaps.md#3-only-request-bodies-are-validated)              |
| Is poppler an npm dependency?        | No, a system package. Needs a line in the Dockerfile                 | [08](08-template-gaps.md#7-there-is-no-infrastructure-for-our-pipeline)    |
| Which password hashing library?      | None. `node:crypto` `scrypt` matches the existing columns            | [08](08-template-gaps.md#1-registration-creates-a-user-without-a-password) |

Three of these were not questions but defects, and they are fixed in place:
thumbnails were never generated although the schema, the S3 layout and the API
all assumed them; `spent_usd` was checked but never charged; and the promise
that verification is idempotent had no mechanism behind it.

---

## Still open

Two items, and neither is a design question — both wait on data that does not
exist yet. The procedure for each is written down, so when the data arrives the
work is mechanical.

### The CER measurement has no material

The whole project rests on one number that has not been measured, and it cannot
be measured without real scans of the intended documents plus a model key. Both
are outside the repository.

The protocol itself is now fully specified — which pages to take, how to
disable the context, how to normalise before comparing, what to record:
[03-core-logic.md](03-core-logic.md#the-protocol-precisely). Nothing about it
is left to improvise.

[README](README.md#1-measure-cer-first-write-code-second) states the threshold:
above 30% the product does not make sense. Until this runs, everything here is
a plan whose premise is unverified.

### Model call concurrency is not calibrated

The starting value is derived rather than guessed: `C ≥ L / H` gives **C = 3**
for a 30-second transcription and a 10-second verification, capped by the
window size and the provider's rate limit
([02-data-pipeline.md](02-data-pipeline.md#the-window-alone-is-not-enough--concurrency-is-the-second-parameter)).

What is missing is the real `L` and `H`. Both come from the views that already
exist — `document_cost.avg_latency_ms` and `verification_speed.avg_ms` — after
the first full document. This is a calibration step, not an open design
decision.

---

## Next

[00-overview.md](00-overview.md) — back to the beginning: what this is and why.
