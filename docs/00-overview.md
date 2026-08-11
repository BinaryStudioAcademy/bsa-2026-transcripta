# 00 - What this is

## In one paragraph

**Transcripta** is a web app for transcribing scanned handwritten documents.
The user uploads a PDF, the system reads every page with a multimodal model,
and a human verifies the result quickly. The trick is that **verified pages are
fed back into the prompt as hints for the next ones** — and the further you go,
the more accurately the system reads surnames, terms and set phrases.

---

## Why it is needed

There are millions of pages of handwritten archives that nobody has digitised,
because:

| Approach        | Problem                                                              |
| --------------- | -------------------------------------------------------------------- |
| Typing by hand  | 3-5 minutes per page. 500 pages = a week of work                     |
| Ordinary OCR    | Cannot read handwriting at all                                       |
| Specialised HTR | You must label dozens of hours of material first, to train the model |

Transcripta offers a third way: **zero preparation, and accuracy that grows
while you work**.

---

## What it looks like for the user

```
1. Uploads a PDF of a 300-page parish register
2. Picks the preset "19th-century parish register" (or creates their own)
3. A minute later sees the first transcribed pages
4. Goes through the pages: [Enter] — correct, or edit the text and [Enter]
5. Notices that from page 50 onwards corrections are far rarer
6. Exports the result to CSV
```

Step 5 is exactly what the project exists for.

---

## How this differs from training a model

|                               | Training an HTR model        | Transcripta                 |
| ----------------------------- | ---------------------------- | --------------------------- |
| Time to the first result      | Dozens of hours of labelling | Immediately                 |
| What accumulates              | Model weights                | A textual lexicon           |
| Can you look inside           | No, a black box              | Yes, it is just a word list |
| Can you fix it                | Only by retraining           | Delete a lexicon row        |
| Carrying it to a new document | Poorly                       | Through a preset, instantly |

---

## Document types

The system is not tied to a genre. The user picks or creates a preset for their
own material.

| Type                               | What supplies the context                           |
| ---------------------------------- | --------------------------------------------------- |
| Parish registers, census revisions | Parish surnames, village names, set formulas        |
| Medical records, case histories    | Diagnoses, drug names, the doctor's abbreviations   |
| Diaries, letters                   | Names of relatives, places, forms of address        |
| Ledgers, contracts                 | Company names, legal formulas, units of measurement |
| Lab journals, lecture notes        | Terms, formulas, the author's abbreviations         |
| School registers, meeting minutes  | Surnames, job titles, department names              |

---

## Key concepts

| Term                  | What it means                                                                  |
| --------------------- | ------------------------------------------------------------------------------ |
| **Document**          | One uploaded PDF or archive                                                    |
| **Page**              | One page with an image in storage                                              |
| **Transcription**     | What the model read on a page                                                  |
| **Verification**      | The human's decision: correct / corrected / skipped                            |
| **Preset**            | Settings for a document type: prompt, output schema, seed glossary             |
| **Context**           | What is given to the model on top of the image: neighbouring pages + lexicon   |
| **Lexicon**           | List of the document's words with frequencies, built from confirmed pages      |
| **Sliding window**    | N pages prepared in advance, ahead of the user                                 |
| **CER**               | Character Error Rate — percentage of wrong characters. The main quality metric |
| **Context poisoning** | A confirmed mistake entered the lexicon and now spoils the following pages     |

---

## What is in scope

| In                                             | Out                                    |
| ---------------------------------------------- | -------------------------------------- |
| Uploading PDFs and image archives              | A public, moderated preset library     |
| Splitting into pages, normalisation            | Vector search (pgvector)               |
| Transcription through a multimodal model       | Several people working on one document |
| A fast verification interface                  | Access rights, roles, teams            |
| Context learning: neighbouring pages + lexicon | Kubernetes, autoscaling                |
| Presets (create, edit, apply)                  | Export to DOCX and TEI XML             |
| Export to JSON, CSV, TXT                       | A local model                          |
| CER measurement                                | A mobile version                       |

---

## MVP limits

| Parameter                  | Limit         | Why exactly this                                      |
| -------------------------- | ------------- | ----------------------------------------------------- |
| File size                  | 500 MB        | Beyond that the upload becomes a problem of its own   |
| Pages per document         | 500           | Above this the lexicon stops fitting into the context |
| Concurrent users           | 5             | This is a study project, not a service                |
| Verification time per page | target < 10 s | Any faster and the human cannot read                  |
| Transcription latency      | 20-40 s       | Hidden behind the sliding window                      |

---

## Two things the system breaks on

This is not a risk register but the two places that decide whether the idea
works at all.

**1. The model has to read your particular handwriting.** If the character
error rate (CER) on real scans is above 30%, typing a page from scratch is
faster than correcting it. Check this on a handful of pages before building
anything else.

**2. Context poisoning.** If a human confirms a wrong reading, it enters the
lexicon and **multiplies** across every following page. Worse still — the text
becomes more consistent, so it looks _better_. There are four guards against
this in the system, and they are part of the design, not an add-on:
[03-core-logic.md](03-core-logic.md#6-context-poisoning--the-main-danger).

---

## Next

[01-architecture.md](01-architecture.md) — what the system is made of.
