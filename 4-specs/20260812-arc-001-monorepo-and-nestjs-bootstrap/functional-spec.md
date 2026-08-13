---
title: "Specification: Bootstrap monorepo, ESLint boundaries, and NestJS API skeleton"
date: 2026-08-12
type: specification
scope: internal
story-id: "ARC-001+ARC-002+ARC-003"
status: draft
version: 1.0.0
updated: 2026-08-12
---

# Bootstrap monorepo, ESLint boundaries, and NestJS API skeleton

> **Status: Draft**

## User Stories

`ARC-001` **Bootstrap monorepo with pnpm workspaces** — Initialize the `wendy-planner` monorepo with `apps/api`, `apps/web`, and `packages/contracts` workspaces, shared `tsconfig.base.json`, ESLint, and Prettier configs. Per ADR-12. [groupBy:: arq] [priority:: 3]

`ARC-002` **Enforce ESLint boundary rules** — Configure ESLint to prevent cross-app imports (`apps/api` ⇄ `apps/web`) and ensure `packages/*` never imports from `apps/*`. CI fails on violation. Per ADR-12. [groupBy:: arq] [priority:: 2]

`ARC-003` **Bootstrap NestJS API skeleton with module layout** — Generate `apps/api` with the bounded-context folder structure (identity, weddings, guests, invitation, photos, audit, infra, common) per ADR-09. Include `app.module.ts`, `main.ts`, config loader, and health-check module. [groupBy:: arq] [priority:: 3]

## Context

The `wendy-planner` monorepo today is an empty git submodule (`code/`) containing only a `README.md`. Before any user-facing story can be implemented, the delivery team needs a runnable foundation: a single repository that hosts the NestJS API, the Vite + React Web App, and the shared TypeScript contract package, with code-quality tooling applied uniformly and a NestJS skeleton that mirrors the bounded contexts documented in §5.1 of the architecture document.

Three backlog items collectively deliver that foundation. They are delivered as a single coordinated work unit because each one depends on the previous one: ARC-001 establishes the monorepo and the shared configs; ARC-002 layers boundary enforcement on top of those configs; ARC-003 generates the NestJS application inside the `apps/api` workspace ARC-001 just created. Splitting them across three specs would force the team to re-bootstrap the workspace and re-validate the boundary rules three times.

These are infrastructure / architecture tasks, not user-facing features. The "users" of this work are the 2-person delivery team who will be opening PRs against the repository starting the day this work lands. The acceptance criteria below are written so a developer can clone the repo, run a single command, and get a working development environment.

## Dependencies

| Story | Type | Description |
|---|---|---|
| None | Requires | This is the first implementation work; nothing precedes it. |
| `ARC-004` Bootstrap Vite + React Web skeleton | Required by | ARC-004 generates `apps/web/` inside the same monorepo that ARC-001 creates; without the monorepo, ARC-004 has no home. |
| `ARC-005` Bootstrap `@wendy/contracts` package | Required by | ARC-005 fills in `packages/contracts/` with the DTOs and ID types that the API skeleton imports from. |
| `ARC-006` Configure shared typed-config classes | Required by | ARC-006 wires the `config/` folder that ARC-003 generates. |
| `ARC-008` Initialize Prisma schema and first migration | Required by | The first `prisma migrate dev` runs against the `apps/api/prisma/` directory ARC-003 sets up. |
| `ARC-035` Implement Validation Pipe with shared DTOs | Required by | ARC-035 wires the global `ValidationPipe` against the DTOs in `packages/contracts` once both ARC-003 and ARC-005 land. |
| `ARC-036` Implement health checks (Terminus) | Required by | ARC-036 implements the `/health/live` and `/health/ready` endpoints that ARC-003 only stubs. |
| `OPS-019` Author CI workflow (`ci.yml`) | Required by | OPS-019 runs `pnpm lint`, `pnpm typecheck`, and `pnpm test` — these scripts need to exist in the root `package.json` that ARC-001 creates. |

## Rules & Constraints

- **Rule 1 — Monorepo structure (ARC-001)**: A single git repository at the workspace root contains exactly three pnpm workspaces: `apps/api`, `apps/web`, and `packages/contracts`, with `packages/*` and `apps/*` declared in `pnpm-workspace.yaml`.
  - *Example:* Running `pnpm -r ls` from the repository root lists all three workspaces and nothing else.
- **Rule 2 — Single dependency installation (ARC-001)**: One `pnpm install` at the repository root installs every workspace's dependencies; workspaces consume each other via the `"@wendy/contracts": "workspace:*"` protocol, with no npm publish step.
- **Rule 3 — Shared TypeScript configuration (ARC-001)**: `tsconfig.base.json` at the root is extended by every workspace's `tsconfig.json`, with `experimentalDecorators: true` and `emitDecoratorMetadata: true` so `class-validator` DTOs work on both the API and the Web App.
- **Rule 4 — Shared linting and formatting (ARC-001)**: `.eslintrc.cjs` and `.prettierrc` at the root define the shared ESLint and Prettier rules; every workspace's `package.json` exposes `pnpm lint` and `pnpm format` scripts that delegate to the root config.
- **Rule 5 — Three repository scripts that work on day one (ARC-001)**: `pnpm install`, `pnpm lint`, and `pnpm typecheck` succeed on a clean clone with no manual setup. The root `package.json` declares each script; the workspaces participate in `pnpm -r` execution.
- **Rule 6 — `apps/api` cannot import from `apps/web` (ARC-002)**: An ESLint rule fails the build if any file under `apps/api/src/**` resolves a relative or workspace import that lands under `apps/web/src/**`. The error message names the forbidden import path.
- **Rule 7 — `apps/web` cannot import from `apps/api` (ARC-002)**: Symmetric to Rule 6 — the Web App cannot reach into the API; it can only consume the public surface of `packages/*`.
- **Rule 8 — `packages/*` cannot import from `apps/*` (ARC-002)**: The shared contracts package is the only allowed consumer of NestJS / Vite / Prisma types from the apps. An import from `packages/contracts/src/**` that resolves into `apps/*` fails the build.
- **Rule 9 — CI gate on boundary violations (ARC-002)**: The boundary rules run as part of `pnpm lint`. A PR that introduces a cross-workspace import cannot be merged — the CI check exits non-zero.
- **Rule 10 — NestJS application boots (ARC-003)**: `pnpm --filter @wendy/api start` starts a NestJS HTTP server on port `3000` (configurable via `PORT` env var) that responds 200 OK to `GET /health/live`.
- **Rule 11 — Bounded-context module layout (ARC-003)**: `apps/api/src/modules/` contains exactly seven folders — `identity`, `weddings`, `guests`, `invitation`, `photos`, `audit`, plus a placeholder module — each declaring a NestJS `@Module()` and the internal `domain`, `application`, `inbound-adapters`, `outbound-adapters`, `public` sub-folders as described in the backend blueprint.
- **Rule 12 — Config loader fails fast (ARC-003)**: The typed config classes (per ADR-16) validate the environment on boot. Starting the API with a missing required env var (`DATABASE_URL`, `JWT_SIGNING_KEY`, `S3_BUCKET`) crashes the process with a clear, human-readable error message — not a silent fallback.
- **Rule 13 — Health-check endpoints (ARC-003)**: `GET /health/live` returns 200 with `{ "status": "ok" }`; `GET /health/ready` returns 200 with the same body when all readiness indicators pass. ADR-036 will replace these stubs with real Terminus checks; ARC-003 only needs the routes registered and the controller wired.
- **Rule 14 — Backend blueprint compliance (ARC-003)**: The generated `apps/api/` folder structure matches the blueprint in `3-architecture/3.2-blueprints/backend-blueprint.md` §3 (Scaffolding). A reviewer opening the repo can find every section the blueprint promises.
- **Rule 15 — No application code in this iteration (cross-cutting)**: This work delivers scaffolding only — no business endpoints, no Prisma schema, no DTOs, no use cases. The bounded-context modules are empty `@Module()` declarations with empty sub-folders; ARC-019+ fills them in.
  - *Example:* `apps/api/src/modules/weddings/weddings.module.ts` contains `@Module({})` and nothing else.

> ⚠️ Assumption — The seven bounded contexts in Rule 11 are: `identity`, `weddings`, `guests`, `invitation`, `photos`, `audit`, plus one placeholder (e.g. `infra` or `common`) for cross-cutting wiring. The backlog calls out six contexts plus `infra`/`common`; the exact seventh folder will be confirmed during tech-spec review.

> ⚠️ Assumption — The "configurable" port in Rule 10 defaults to `3000` because that is the NestJS convention; production will read `PORT` from the Fargate task definition. Document the env-var contract in the API README.

## User Experience Notes

Not applicable. These stories have no end-user surface. The "user" of this work is the developer who runs `pnpm install` and `pnpm --filter @wendy/api start` and expects a working NestJS server on port 3000. The "user experience" is the developer experience — specifically, that:

- A clean clone + `pnpm install` works without warnings or errors.
- `pnpm lint` and `pnpm typecheck` are fast (< 30 s on a developer laptop).
- `pnpm --filter @wendy/api start` brings up the API and the developer can hit `http://localhost:3000/health/live` from curl or a browser.
- ESLint boundary rule violations produce a one-line error message that names the forbidden import path, not a generic "lint failed".

No UI components, no i18n strings, no form validation rules apply to this work.
