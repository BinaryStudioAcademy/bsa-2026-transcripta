# Transcripta — how we work

A short guide to the board, the releases, and who moves what. If something here
contradicts [`readme.md`](../readme.md) or `docs/`, those win — tell the lead and we will fix
this page.

**Board:** https://github.com/orgs/BinaryStudioAcademy/projects/39
**Repo:** https://github.com/BinaryStudioAcademy/bsa-2026-transcripta
**Docs:** [README.md](README.md)
**Design:** http://98.90.162.1/design/view.html
**Model sandbox:** http://98.90.162.1/test

---

## 1. What the words mean

**Milestone** — a demo date, not a bucket of work. Every Saturday we show the
product owner a working application, so each release has to end with something
that can be shown live. That means a release is assembled _vertically_: some
backend, some frontend, some QA.

**Epic** — an area of the product, alive for weeks: `Epic: Documents`,
`Epic: Verification`. One epic spans several releases; one release pulls work
from several epics. Epics and releases **overlap, they do not nest** — this is
the part that is usually misread.

**Story** — one complete piece of value for the user:

> As an Authenticated User, I want to upload a PDF so that the system can start
> reading it.

This is the unit we demo and the unit QA tests. A story cannot be half-done: if
the backend is ready and the frontend is not, the user got nothing.

**Task** — one person's work, one to three days: `[BE] Sign-in flow`,
`[FE] Sign-in flow`. This is what actually gets written.

```
Epic: Authentication & Access Control          the area
   └── As a Visitor, I want to sign in…        the value
          ├── [BE] Sign-in flow                the work
          └── [FE] Sign-in flow
```

We do not use the word "feature" — the middle level is a story.

**When a story is worth having.** A story earns its place when it groups two or
more tasks that make no sense apart — typically a backend half and a frontend
half — and reads as one sentence at the demo. If it would hold a single task,
skip it and hang the task straight off the epic: an empty layer is one more
click between the epic and the work, and the `As a …, I want …` sentence starts
sounding forced. A useful smell test: if the "I want" half is something the user
never actually thinks about — "I want my document split into pages" — it is a
step inside someone else's story, not a story.

Prefixes: `[BE]` backend, `[FE]` frontend, `[QA]` testing, `[Setup]` tooling
and access.

---

## 2. The releases

| Release   | Demo  | What it delivers                             |
| --------- | ----- | -------------------------------------------- |
| release-0 | 22.08 | access, CI/CD, infrastructure                |
| release-1 | 28.08 | sign-in and sign-up, application shell       |
| release-2 | 04.09 | documents: upload a PDF → see its pages      |
| release-3 | 11.09 | pipeline: pages get transcribed on their own |
| release-4 | 18.09 | verification screen + context learning       |
| release-5 | 25.09 | presets, export, polish                      |

The order is not arbitrary — it follows [`README.md`](README.md) → "Implementation
order", whose rule is: **get one file through the whole path first, then
everything else**. Explicitly not: don't start with the queue, don't start with
a beautiful UI, don't start with a twenty-table database.

---

## 3. Picking up work

1. Look at the **To Do** column. Everything in it is ready to be worked on.
2. Take a **task** with your prefix.
3. Put yourself in **Assignees**, drag the card to **In Progress**.
4. Branch `feat/TSA-<issue>-short-desc`, e.g. `feat/TSA-12-add-header`.
5. Open a PR titled `TSA-<issue>: <text>`, e.g. `TSA-12: Add header component`.
6. Card goes to **PR Review** → merged → **Done**.

**Do not take anything from Backlog.** That column is filled by the coaches and
the lead. If To Do runs empty, that is a signal to the lead, not an invitation
to dig deeper.

**Developers never move stories** — only their own tasks. A story moves to
`Ready for Testing` when all of its tasks are closed, and the lead does that.

### The columns

| Column            | Who moves the card there | What it means                          |
| ----------------- | ------------------------ | -------------------------------------- |
| Backlog           | lead, coaches            | not ready to be picked up              |
| To Do             | lead                     | ready — take it                        |
| In Progress       | the developer            | someone is writing this now            |
| Blocked           | the developer            | stuck on a dependency or a question    |
| PR Review         | the developer            | PR is open, waiting for review         |
| Ready for Testing | lead                     | all tasks of the story are done        |
| In Testing        | QA                       | QA is checking the end-to-end scenario |
| Done              | QA / the developer       | finished                               |

Tasks travel the whole path. Stories skip the middle: `To Do` → `Ready for
Testing` → `In Testing` → `Done`.

---

## 4. Pull requests

`dangerfile.ts` fails a PR that is missing any of these, so check before you
open one:

- title matches `TSA-<issue>: <text>`
- branch matches `<type>/TSA-<issue>-<short-desc>`
- an **assignee**
- at least one **label**
- a **milestone**

Commits follow `TSA-<issue>: <modifier> <description>`, where the modifier is
`+` add, `*` change, `-` remove. Example: `TSA-12: + header component`.
`commitlint` enforces this on every commit.

Note that a PR title and its issue title are deliberately different: the issue
reads `[FE] Sign-in flow`, the PR reads `TSA-1: Add sign-in flow to the
frontend`. Danger checks the PR, never the issue.

---

## 5. Daily

17:00 Kyiv (11:00 Buenos Aires), Monday to Friday.
https://meet.google.com/bsd-wkyi-mjb

Three questions each:

- what moved since yesterday
- what you are taking today
- what is blocking you

**Update your cards before the call, not during it** — otherwise the standup
turns into board maintenance and takes half an hour.

---

## 6. Why release-2 and later have no tasks yet

Those releases hold twenty stories and zero tasks, on purpose.

A story is stable — "the user wants to upload a PDF" will not change. A task is
not: by the time we get there, the code and the schema will have moved. We saw
this on the first batch already — out of sixteen tasks, half the checklist items
had to be dropped because the template already implemented them, and two
acceptance criteria were impossible until shared code was fixed (`Input` had no
`password` type; `HTTPCode` had no 401 or 409).

So tasks are cut **at the start of each sprint**, against the code as it
actually is, for the handful of stories taken into that sprint. Writing them a
month early means rewriting them a month later.

---

## 7. Where to look things up

| Question                                        | Where                                                                        |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| What are we building and why                    | [`00-overview.md`](00-overview.md)                                           |
| How the whole app works, in plain words         | [`07-how-it-works.md`](07-how-it-works.md)                                   |
| What order to build in                          | [`README.md`](README.md) → Implementation order                              |
| What the template already has vs what is a stub | [`08-template-gaps.md`](08-template-gaps.md)                                 |
| What is still undecided                         | [`09-open-questions.md`](09-open-questions.md)                               |
| Branch / commit / PR / issue conventions        | [`readme.md`](../readme.md) → §7                                             |
| The 19 API routes                               | [`05-api.md`](05-api.md)                                                     |
| Database schema                                 | [`04-database.md`](04-database.md), [`schema/schema.sql`](schema/schema.sql) |

---

## 8. What is blocking the project right now

**We have no real scans of handwritten pages.** Until we do, we cannot measure
CER — the number that decides whether the product makes sense at all
([`09-open-questions.md`](09-open-questions.md); above 30% it does not). The model sandbox at
http://98.90.162.1/test is ready and three models are wired up; it needs
material.

Everything else can proceed in parallel, but this one needs an owner.
