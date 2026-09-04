# Transcripta QA Test Plan

# 1\. Purpose and Scope

This plan describes how the QA team will validate the Transcripta MVP. The goal is to check that a desktop user can move safely from sign-in to a usable export, and that failures are visible and recoverable.

Coverage includes authentication and session handling; document management; upload of PDF, image archives, and standalone images; ingestion and page preparation; transcription; document and page lifecycle; verification and corrections; pause, resume and reprocess flows; presets, context and lexicon behaviour; exports; deletion; and failure recovery. Mobile layout is outside the MVP. UI checks will focus on the supported laptop/desktop layout, starting at 1280 px wide. Test cases and short checklists will be maintained in Qase as features become ready.

# 2\. What We Test

## 2.1 UI / Frontend

- Validate the main user journeys: sign-up/sign-in/sign-out and session restoration; document setup, including preset creation, edit, and selection; PDF, archive and standalone image upload; processing and budget control, verification through confirmation, correction or skip, context and lexicon use, structured-output updates, export, pause/resume/reprocess and deletion.
- Check field and file validation, loading states, upload progress, empty states, status labels, and actionable error messages.
- Check that refresh, reopening, reconnects, and stale or failed requests preserve or correctly recover the current verification position, completed corrections/actions, and queued or offline actions where supported.
- Verify that the UI uses backend data consistently, including page and document status, progress, budget, current page, and the latest corrected content.
- Review the verification experience manually: scan and text presentation, keyboard actions, editing, undo, navigation, highlighted context words, and rollback when an optimistic action fails.
- Check the desktop layout at supported widths, especially the two-pane verification screen. Mobile layout is outside the MVP acceptance scope.

## 2.2 Backend / API

- Validate API request and response contracts, shared validation rules, status codes, stable error responses, and Swagger documentation for implemented routes.
- Check authentication and authorization, including protected endpoints, expired or invalid sessions, and ownership isolation so one user cannot access another user’s documents, pages, exports, lexicon, or debug data.
- Verify document and page lifecycle transitions across upload, ingestion, processing, pause, resume, verification, completion, failure and reprocessing. Data in PostgreSQL, storage and queue-driven processing must remain consistent.
- Cover direct-to-storage upload integration, page creation, retries, idempotent verification, corrected and regenerated structured data, cache use, export generation across supported formats and document states, and cleanup during deletion or abandoned-upload recovery.
- Exercise negative and recovery paths such as invalid or corrupt files, interrupted uploads, unavailable processing services, exhausted budgets, stale transcriptions, failed pages, wrongly detected blank pages, and retry/reprocess behaviour.

## 2.3 AI / Transcription System

AI testing will separate deterministic system behaviour from output-quality evaluation.

- Deterministic checks will verify that supported files become pages, blank pages are handled without unnecessary model calls, jobs complete or fail with the correct state, retries and reprocessing work, model responses follow the required schema where applicable, and text remains available when structured output cannot be produced.
- We will verify that preset instructions, seed glossary, neighbouring verified pages and the document lexicon are applied as designed; skipped or unverified text must not become trusted context. Human-corrected content must be treated as authoritative for later processing and exports.
- Quality review will use representative historical material across handwriting styles, document types and scan quality, including difficult layouts, printed text, faded scans and unusual pages.
- Ground-truth samples and CER-based comparison will be used when the prepared dataset supports them. Results will be reviewed per page as well as in summary so one bad page is not hidden by an average.
- AI-quality testing will combine measurable thresholds where available with semantic, comparative and relationship-based evaluation. Representative inputs will be repeated to assess stability, with controlled changes such as rotation, skew, noise, context, glossary or preset changes. PO/Tech Lead’s review will be used when QA or automation cannot provide a reliable test oracle.
- Test attempts to influence model behaviour through document content, preset instructions, glossary or lexicon values, and other user-controlled context, including prompt injection, rule bypass and unintended context disclosure.
- Automated AI checks will not expect exact generated wording. They will prefer measurable results: successful processing, valid response structure, required fields, recorded context, correct pipeline state, useful errors, and dataset quality trends. Prompt, context, model, raw response and cost/latency debug information will be used when implemented to investigate poor output.

# 3\. Test Approach

## Manual Testing

Manual testing is the main approach for new or changing functionality, exploratory testing, visual/UI review, real-world document behaviour, AI transcription quality, unusual files, and user-facing error handling. It is also preferred where requirements or model behaviour are still evolving. QA will test stories end to end, not only separate frontend or backend tasks.

## Automation

Automation will focus on stable, repeatable and deterministic behaviour: critical API flows, authentication and ownership checks, validation, lifecycle rules, retry/error handling, and a small set of stable frontend smoke/regression journeys. AI-related automation will assert processing and schema/state behaviour rather than exact transcription text. Dataset-based quality checks may be added when reliable ground truth and agreed evaluation thresholds are available.

Alisa is responsible for coordinating and maintaining test automation. Other QA engineers may review automated-test code and pull requests, suggest improvements, and contribute where agreed by the team.

## Test Cycles

Functional, integration, API, exploratory and negative testing will run during development as stories become testable. A short smoke check will be run after important main-environment deployments. Focused regression will follow fixes and changes to shared flows, broader regression will be run before project demos or MVP release points.

# 4\. Test Data and Resources

Test data uses real or representative historical/scanned documents: parish and school registers, letters and diaries, lecture or lab notes, ledgers/contracts, meeting minutes, and medical records/case histories where handling is appropriate. The set includes different handwriting, languages or spelling patterns present in the chosen material, clear and poor scans, faded pages, blank pages, printed content, and documents suitable for preset, context, lexicon and structured-output checks.

Upload data will cover PDFs, ZIP/image archives and standalone images, plus invalid, mixed, corrupt, oversized or interrupted examples. Heavy scan files will be kept outside the repository in the shared Google Drive test-data location. The repository keeps a short dataset description, handling notes, Drive link and small ground-truth text files.

Required resources are the deployed main environment, frontend and backend/API access, Swagger, test accounts for ownership checks, Qase, GitHub, shared test datasets, the model comparison sandbox, and per-page AI debug information when available. A local environment may be used to reproduce or investigate issues that cannot be diagnosed from the deployed build and browsing through different branches.

Main frontend: [http://98.90.162.1/](http://98.90.162.1/)

Swagger: [http://98.90.162.1/v1/documentation](http://98.90.162.1/v1/documentation)

# 5\. Tools

- Qase: test cases/checklists and execution results where appropriate.
- GitHub and the project board: requirements, acceptance criteria, pull requests, defects and technical proposals.
- Swagger/API documentation and an API testing client or automated HTTP checks: contract, validation, authorization and integration coverage.
- Browser DevTools: UI, network, storage, console and upload investigation.
- Google Drive: shared scan and test-data repository.
- Project CI and the team-selected automation framework: repeatable smoke and regression execution once automated tests are added.

# 6\. QA Workflow and Responsibilities

QA reviews story acceptance criteria, prepares or updates Qase coverage, tests the integrated result in the available environment, and records execution results. Findings are retested after fixes, followed by focused regression of affected flows.

Bugs and technical propositions are recorded as GitHub tickets so they remain visible on the board. A bug should state clear steps, observed behaviour, expected behaviour, environment, and useful evidence such as screenshots, request/response details or logs. Technical improvements are tracked as enhancement tickets instead of being left only in chat.

Automation changes follow the normal pull-request flow. QA team members can review each other’s automated-test code and pull requests before merge.
