# Transcripta

A web app for transcribing scanned handwritten documents. The user uploads a
PDF, the system reads every page with a multimodal model, and a human verifies
the result quickly — then verified pages are fed back into the prompt as hints
for the pages that follow.

**All project documentation lives in [`docs/`](docs/README.md).**

## 1. Introduction

### 1.1 Useful Links

| Where                                                                    | What for                                                                |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [Project board](https://github.com/orgs/BinaryStudioAcademy/projects/39) | Epics, user stories and tasks                                           |
| [docs/README.md](docs/README.md)                                         | Documentation entry point, implementation order                         |
| [docs/07-how-it-works.md](docs/07-how-it-works.md)                       | How the app works, in plain words                                       |
| [docs/08-template-gaps.md](docs/08-template-gaps.md)                     | **What the template already has, what is a stub, what is missing**      |
| [docs/09-open-questions.md](docs/09-open-questions.md)                   | **What is still undecided before implementation starts**                |
| [docs/12-claude-code.md](docs/12-claude-code.md)                         | Shared Claude Code agent and skill (after `git pull`)                   |
| [docs/13-codex.md](docs/13-codex.md)                                     | Shared Codex CLI agent and skill (after `git pull` + trusting the repo) |
| [diagrams/README.md](docs/diagrams/README.md)                            | Seven diagrams with walkthroughs                                        |

## 2. Domain

Handwritten archives: parish registers, medical records, diaries, ledgers.
Ordinary OCR cannot read them at all, and specialised HTR requires dozens of
hours of labelling first. The key idea is context learning: pages confirmed by
a human are fed back into the model's prompt, so accuracy grows as the work
goes on.

Details: [docs/00-overview.md](docs/00-overview.md),
[docs/03-core-logic.md](docs/03-core-logic.md).

## 3. Requirements

- [NodeJS](https://nodejs.org/en) (22.x.x);
- [npm](https://www.npmjs.com/) (11.x.x);
- [PostgreSQL](https://www.postgresql.org/) (17.5)

## 4. Database Schema

9 tables, 3 views, 4 enums. The source of truth is
[schema/schema.sql](docs/schema/schema.sql); it is applied through Knex
migrations in `apps/backend/src/db/migrations/`.

- Diagram: [diagrams/06-database.mmd](docs/diagrams/06-database.mmd)
- Rationale behind the decisions: [docs/04-database.md](docs/04-database.md)
- Seed data: [schema/seed.sql](docs/schema/seed.sql)

## 5. Architecture

A monolith: the API and the queue worker live in one process and can be split
apart with a single `APP_MODE` environment variable.

- Components and stack: [docs/01-architecture.md](docs/01-architecture.md)
- Data path: [docs/02-data-pipeline.md](docs/02-data-pipeline.md)
- System overview: [diagrams/01-overview.mmd](docs/diagrams/01-overview.mmd)
- API, 19 routes: [docs/05-api.md](docs/05-api.md)

### 5.1 Global

#### 5.1.1 Technologies

1. [Typescript](https://www.typescriptlang.org/)
2. [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces)

### 5.2 Frontend

#### 5.2.1 Technologies

1. [React](https://react.dev/) — a frontend library
2. [Redux](https://redux.js.org/) + [Redux Toolkit](https://redux-toolkit.js.org/) — a state manager

#### 5.2.2 Folder Structure

1. assets - static assets (images, global styles)
2. libs - shared libraries and utilities

   2.1 components - plain react components

   2.2 enums

   2.3 helpers

   2.4 hooks

   2.5 modules - separate features or functionalities

   2.6 types

3. modules - separate app features or functionalities
4. pages - app pages

### 5.3 Backend

#### 5.3.1 Technologies

1. [Fastify](https://fastify.dev/) — a backend framework
2. [Knex](https://knexjs.org/) — a query builder
3. [Objection](https://vincit.github.io/objection.js/) — an ORM

#### 5.3.2 Folder Structure

1. db - database data (migrations, seeds)
2. libs - shared libraries and utilities

   2.1 enums

   2.2 exceptions

   2.3 helpers

   2.4 modules - separate features or functionalities

   2.5 types

3. modules - separate app features or functionalities

### 5.4 Shared Package

#### 5.4.1 Reason

As we are already using js on both frontend and backend it would be useful to share some contracts and code between them.

#### 5.4.2 Technologies

1. [Zod](https://github.com/colinhacks/zod) — a schema validator

## 6. How to Run

### 6.1 Manually

1. Create and fill all .env files. These files are:

- apps/frontend/.env
- apps/backend/.env

You should use .env.example files as a reference.

1. Install dependencies: `npm install`.

2. Install pre-commit hooks: `npx simple-git-hooks`. This hook is used to verify code style on commit.

3. Run database. You can run it by installing postgres on your computer.

4. Apply migrations: `npm run migrate:dev -w apps/backend`

5. Run backend: `npm run start:dev -w apps/backend`

6. Run frontend: `npm run start:dev -w apps/frontend`

## 7. Development Flow

### 7.1 Pull Request Flow

```
<project-prefix>-<issue-number>: <ticket-title>
```

Examples:

- `TSA-6: Add header component`
- `TSA-12: Update header styles`
- `TSA-16: Remove header component`

### 7.2 Branch Flow

```
<type>/<project-prefix>-<issue-number>-<short-desc>
```

Examples:

- `feat/TSA-6-add-header`
- `fix/TSA-12-header-styles`
- `chore/TSA-16-remove-header`

### 7.3 Commit Flow

```
<project-prefix>-<issue-number>: <modifier> <description>
```

**Modifiers**

- `+` (add)
- `*` (edit)
- `-` (remove)

Examples:

- `TSA-6: + header component`
- `TSA-12: * header styles`
- `TSA-16: - header component`

### 7.4 Issue Flow

The backlog has three levels, linked through GitHub sub-issues:

```
Epic: <Area>                              an umbrella for one product area
   As <Role>, I want <X> so that <Y>      a user story, what the user gets
      [BE] / [FE] <what we build>         the implementation tasks
```

Examples:

- `Epic: Authentication & Access Control`
- `As a Visitor, I want to sign in with my email and password so that I can reach my documents`
- `[BE] Sign-in flow`
- `[FE] Sign-in flow`

Prefixes for tasks: `[BE]` backend, `[FE]` frontend, `[Setup]` project setup,
`[QA]` quality assurance.

Note that an issue title and its pull request title are **not** the same: the
issue reads `[FE] Sign-in flow`, while the pull request must follow 7.1 —
`TSA-1: Add sign-in flow to the frontend`. Danger checks the pull request title,
never the issue title.

### 7.5 Claude Code

Shared helpers live in [`.claude/`](.claude/) and are available after `git
pull` — no extra setup. Usage of the `code-review` agent and the
`feature-assistant` skill:
[docs/12-claude-code.md](docs/12-claude-code.md).

### 7.6 AI Intended Usage

AI is meant to support research and reference, not to write your code for you. Contributors should stay in control of what actually lands in the codebase, use AI to investigate and propose, then review and apply changes yourself.

When you use AI to help with a task, expect its output in three parts:

- Research — what it found in the codebase relevant to your request: files, modules, existing patterns, and any constraints that affect the approach.
- References — links to the relevant files and lines in this repo (path:line), plus any external docs (library APIs, RFCs) that back up the suggested approach.
- Code snippets — illustrative, non-applied examples of the proposed change (diff-style or fenced code blocks). These should not be written into the working tree — they're presented in the response only, for a human to review and apply.

### 7.7 Codex

Shared helpers live in [`.codex/`](.codex/) (agent config) and
[`.agents/skills/feature-assistant/`](.agents/skills/feature-assistant/)
(skill). Available after `git pull`, but Codex additionally requires marking
the repo trusted once per machine before it loads them. Usage of the
`code-review` agent and the `feature-assistant` skill:
[docs/13-codex.md](docs/13-codex.md).

## 8. Deployment

### 8.1 Continuous Integration

`.github/workflows/ci.yml` runs on every pull request and on every push to
`main`, with two jobs:

- **lint** — `npm run lint`, which fans out to `editorconfig-checker`,
  `ls-lint`, `tsc --noEmit`, `eslint`, `prettier --check`, `knip`, and each
  workspace's own lint script
- **build** — `npm run build` for `shared`, `backend` and `frontend`

A new push to the same pull request cancels the previous run.

### 8.2 Continuous Delivery

`.github/workflows/deploy.yml` runs on every push to `main` and ships the
backend to AWS:

1. assumes an IAM role through GitHub OIDC — no AWS keys are stored in the
   repository or in secrets
2. builds the backend image for `linux/arm64`, because the instance is Graviton
3. pushes it to ECR under both `latest` and the commit SHA
4. triggers a redeploy on the instance through SSM, targeting the
   `Project=transcripta` tag

The project runs a **single environment** — there is no dev/staging split, so a
push to `main` goes straight to it.
