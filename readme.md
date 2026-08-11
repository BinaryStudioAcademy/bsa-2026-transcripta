# Transcripta

A web app for transcribing scanned handwritten documents. The user uploads a
PDF, the system reads every page with a multimodal model, and a human verifies
the result quickly — then verified pages are fed back into the prompt as hints
for the pages that follow.

**All project documentation lives in [`docs/`](docs/README.md).**

## 1. Introduction

### 1.1 Useful Links

| Where                                                  | What for                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| [docs/README.md](docs/README.md)                       | Documentation entry point, implementation order                    |
| [docs/07-how-it-works.md](docs/07-how-it-works.md)     | How the app works, in plain words                                  |
| [docs/08-template-gaps.md](docs/08-template-gaps.md)   | **What the template already has, what is a stub, what is missing** |
| [docs/09-open-questions.md](docs/09-open-questions.md) | **What is still undecided before implementation starts**           |
| [diagrams/README.md](docs/diagrams/README.md)          | Seven diagrams with walkthroughs                                   |

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

## 8. Deployment

TODO: CI/CD is not set up yet — there is no `.github/` directory in the repository.
