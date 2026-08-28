# Claude Code helpers

Shared Claude Code config lives in [`.claude/`](../.claude/) and is committed
so the whole team gets the same agent and skill after `git pull`. No local
install step beyond having [Claude Code](https://code.claude.com/docs/en/overview)
available.

Official references:

- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Skills](https://code.claude.com/docs/en/skills)
- [`.claude` directory](https://code.claude.com/docs/en/claude-directory)

## Layout

```
.claude/
  agents/
    code-review.md              # isolated PR / diff review
  skills/
    feature-assistant/
      SKILL.md                  # inline feature scratch notes
  settings.local.json           # per-developer, gitignored
  feature-scratch/              # per-ticket notes, gitignored
```

`settings.local.json` is written automatically by Claude Code and stays on
each machine. Scratch files under `feature-scratch/` are local working notes
and must not be committed.

## code-review agent

**File:** [`.claude/agents/code-review.md`](../.claude/agents/code-review.md)

A [subagent](https://code.claude.com/docs/en/sub-agents): fresh context, no
view of the parent chat. Give it a diff or PR; it returns findings and does
not edit the tree.

It checks:

- correctness bugs
- reuse and simplification
- conventions from [`readme.md`](../readme.md) §7 (branch, commit, PR title)
  and §5 (folder layout)
- secrets accidentally included in the diff

### How to run

In a Claude Code session, ask explicitly or `@`-mention the agent:

```text
Use the code-review agent on my current diff
```

```text
@agent-code-review review PR 42
```

Or start a session as that agent:

```bash
claude --agent code-review
```

## feature-assistant skill

**File:**
[`.claude/skills/feature-assistant/SKILL.md`](../.claude/skills/feature-assistant/SKILL.md)

A [skill](https://code.claude.com/docs/en/skills) that runs **inline** in the
main session (no `context: fork`). It keeps a scratch file per ticket so
decisions, touched endpoints/components, and open questions survive
compaction and new sessions.

Scratch path: `.claude/feature-scratch/<ticket-id>.md` (for example
`TSA-15.md`).

### How to run

```text
/feature-assistant TSA-15
```

Or ask in natural language when starting or resuming a ticket:

```text
Resume TSA-15 — load the feature-assistant scratch and continue
```

Claude may also load the skill when the task matches its description
(capturing a decision, listing touched files, preparing for compaction).

## After pull

1. Open the repo root in Claude Code.
2. Confirm the agent and skill appear (for example via `/agents` hints or
   `/feature-assistant` in the skill menu).
3. If a brand-new `.claude/agents/` directory was added while a session was
   already open, restart Claude Code once so it picks up the directory.
