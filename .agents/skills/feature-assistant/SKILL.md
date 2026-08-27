---
name: feature-assistant
description: >-
  Keeps living scratch notes for the feature currently in progress: decisions,
  endpoints and components touched, open questions. Use when starting or
  resuming a ticket, after a design decision, before compacting context, or
  when the user asks to capture feature context. Runs inline in the main
  session so notes survive compaction and new chats.
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
branch name (`feat/TSA-15-…`) or from what the user typed when invoking this
skill.

The scratch directory is shared with the Claude Code feature-assistant
([`.claude/skills/feature-assistant/SKILL.md`](../../../.claude/skills/feature-assistant/SKILL.md))
so notes on a ticket stay in one place no matter which tool picks it up next.
That directory is gitignored — local only, never commit scratch files.

## When invoked

1. Resolve the ticket id from what the user typed, the current branch, or ask
   once.
2. Read `.claude/feature-scratch/<ticket-id>.md` if it exists; otherwise
   create it from the template below.
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
