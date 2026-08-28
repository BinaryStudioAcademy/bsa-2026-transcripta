---
name: feature-assistant
description: >-
  Keeps living scratch notes for the feature currently in progress: decisions,
  endpoints and components touched, open questions. Use when starting or
  resuming a ticket, after a design decision, before compacting context, or
  when the user asks to capture feature context. Runs inline in the main
  session so notes survive compaction and new chats.
argument-hint: "[TSA-<n> | ticket id]"
allowed-tools: Read Write Edit Glob Grep
---

# Feature assistant

Maintain a per-ticket scratch file so feature context is not lost when the
conversation is compacted or a new session starts. This skill runs **inline**
in the main session (do not fork a subagent).

## Scratch location

```
.claude/feature-scratch/<ticket-id>.md
```

Ticket id examples: `TSA-15`, `TSA-6`. Prefer the GitHub / board id from the
branch name (`feat/TSA-15-…`) or from `$ARGUMENTS` when the user invokes
`/feature-assistant TSA-15`.

That directory is gitignored — local only, never commit scratch files.

## When invoked

1. Resolve the ticket id from `$ARGUMENTS`, the current branch, or ask once.
2. Read `.claude/feature-scratch/<ticket-id>.md` if it exists; otherwise create
   it from the template below.
3. Update the scratch with new facts from this turn (decisions, files,
   endpoints, open questions). Keep entries short and dated.
4. At the start of substantive work on the ticket, re-read the scratch and
   treat it as source of truth for prior decisions.

## Template

```markdown
# <ticket-id>: <short title>

## Goal

## Decisions

- YYYY-MM-DD — …

## Touched

### API / backend

-

### Frontend

-

### Shared / other

-

## Open questions

-

## Notes

-
```

## Rules

- Write durable facts only (what was decided, what was built, what is still
  unclear). Skip chat fluff.
- Prefer amending the existing scratch over starting a new file for the same
  ticket.
- Align naming with `readme.md` §7 (branch / commit / PR) when suggesting
  git names.
- Do not put secrets, tokens, or `.env` values in the scratch.
