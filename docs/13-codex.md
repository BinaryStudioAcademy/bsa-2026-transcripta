# Codex helpers

Shared Codex configuration lives in [`.codex/`](../.codex/) and is committed
so the whole team gets the same code-review agent after `git pull`. The
feature-assistant skill lives in [`.agents/`](../.agents/) because Codex
discovers skills there.

Codex loads project configuration only after the repository is marked
**trusted**. This one-time choice is local to each developer; it is not
committed in this repository.

> **Important:** On the first launch, accept Codex's **Trust this project**
> prompt.

Official references:

- [Codex CLI](https://developers.openai.com/codex/cli)
- [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Skills](https://learn.chatgpt.com/docs/build-skills)

## Layout

```
.codex/
  config.toml                   # shared project configuration
  agents/
    code-review.toml            # isolated PR / diff review
.agents/
  skills/
    feature-assistant/
      SKILL.md                  # inline feature scratch notes
.claude/
  feature-scratch/              # shared local notes, gitignored
```

Scratch files are shared by Codex and Claude Code on the same checkout. This decision made specifically to allow developer switch between tools and keep shared notes. They
are local working notes, not team documentation, and must not be committed.

## code-review agent

**File:** [`.codex/agents/code-review.toml`](../.codex/agents/code-review.toml)

A [subagent](https://learn.chatgpt.com/docs/agent-configuration/subagents):
fresh context, no view of the parent chat. Give it a diff or PR; it returns
findings and does not edit the tree.

It checks:

- correctness bugs
- reuse and simplification
- conventions from [`readme.md`](../readme.md) §7 (branch, commit, PR title)
  and §5 (folder layout)
- secrets accidentally included in the diff

### How to run

In a trusted Codex session, name the agent explicitly:

```text
Use the `code-review` agent to review my current diff.
```

Use `/agent` in the interactive CLI to inspect the spawned agent thread.

## feature-assistant skill

**File:**
[`.agents/skills/feature-assistant/SKILL.md`](../.agents/skills/feature-assistant/SKILL.md)

A [skill](https://learn.chatgpt.com/docs/build-skills) that runs **inline** in
the main session. It keeps a scratch file per ticket so decisions, touched
endpoints/components, and open questions survive compaction and new sessions.

Scratch path: `.claude/feature-scratch/<ticket-id>.md` (for example
`TSA-15.md`). This is the same local file used by Claude Code.

### How to run

Ask in natural language when starting or resuming a ticket:

```text
Resume TSA-15 — load the feature-assistant scratch and continue.
```

Codex may also load the skill when the task matches its description, such as
capturing a decision or preparing for compaction.

## After pull

1. In a terminal, change to the repository root and start Codex:

   ```bash
   cd /path/to/bsa-2026-transcripta
   codex
   ```

2. On the first launch, accept Codex's **Trust this project** prompt.

3. Restart an already-open session once if it does not pick up the new agent
   or skill. If no trust prompt appears, start a new Codex session from the
   repository root and check that the matching project entry is present in
   your local config.
