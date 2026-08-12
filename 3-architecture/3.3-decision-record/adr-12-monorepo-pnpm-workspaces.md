---
title: "ADR-12 — Repository strategy: monorepo with pnpm workspaces"
id: adr-12
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 1.0.1
updated: 2026-08-11
---

# ADR-12 — Repository strategy: monorepo with pnpm workspaces

> **Revision history**
> - **v1.0.1 (2026-08-11):** Removed stale references to the discarded Next.js frontend and Zod, and corrected the Web App's build/deploy story — static `vite build` → S3 + CloudFront, no container image and no ECR push for the web app (ADR-02 v2). This aligns the ADR with §8.8 of the architecture document (audit `20260811-architecture-audit.md`, finding M-2).
> - v1.0.0 (2026-08-10): Original decision.

## Context

Wendy Planner's MVP includes two deployable applications (a NestJS API and a Vite + React Web App) plus shared code (`class-validator` DTOs and TypeScript types — see ADR-14). We need to decide:

- Should the API and Web App live in the same repository or separate ones?
- If separate, how do we share the contract types?
- How does the CI/CD pipeline detect which app changed and rebuild only that one?

This decision affects developer experience, deployment velocity, onboarding, and how tightly the FE and BE can move together.

## Options Considered

### Option A — Polyrepo: `wendy-api`, `wendy-web`, `wendy-contracts` (npm package)

- **Pros**
  - Clear ownership boundaries; each repo has one purpose.
  - Independent deploy cadence.
  - Smaller, focused repos.
  - Easier to grant granular access.
- **Cons**
  - **Sharing types is painful**: any change to `wendy-contracts` requires publishing a new version, bumping the dependency in both apps, and coordinating the FE update.
  - **Cross-cutting changes require multiple PRs**: an API change that breaks the FE needs at least two PRs (one to `wendy-contracts` + `wendy-api`, one to `wendy-web`) and a release order.
  - **Onboarding = clone 3 repos**.
  - **Version drift risk**: the FE may be running against an older contract while the BE has moved on.
  - Overkill for a 2-person team where the same developer often touches both ends.

### Option B — Monorepo with `pnpm workspaces` — **Selected**

- **Pros**
  - **One repo, three workspaces**: `apps/api`, `apps/web`, `packages/contracts`. (Plus optional `packages/ui` for shared React components.)
  - **Atomic cross-cutting changes**: a single PR can update the shared DTO, the API consumer, and the FE form in lockstep.
  - **Shared types via TypeScript path aliases** (`@wendy/contracts`), no npm publish step.
  - **Single CI config** with per-app change detection (the CI matrix is built from the list of changed workspaces).
  - **Single source of truth** for the project's tsconfig, ESLint config, Prettier config, and Renovate config.
  - **Onboarding = clone one repo** and run `pnpm install`.
  - **Refactoring is trivial**: a function can be moved from `apps/api/src/util` to `packages/contracts/src/util` in one PR.
- **Cons**
  - **CI runtime grows** with the repo size; mitigated by per-app caching and Turborepo (optional, see below).
  - **Permissions are coarser** — every developer with repo access can change every app. Acceptable for a 2-person team where both developers are full-stack by necessity.
  - **Coupling risk** if boundaries aren't enforced. Mitigated by ESLint rules that prevent cross-app imports (`apps/api` cannot import from `apps/web` and vice versa).

### Option C — Monorepo with Nx

- **Pros**
  - Powerful task runner; built-in affected-detection; project graph.
- **Cons**
  - **Heavy for a 2-person team**: significant learning curve, opinionated tooling.
  - Most of Nx's value comes when the monorepo is large and has many apps/libs. At our scale, it is overkill.

### Option D — Monorepo with Turborepo

- **Pros**
  - Lightweight task runner with hash-based caching; very fast incremental CI.
  - Plays well with pnpm workspaces.
- **Cons**
  - Yet another tool to learn.
  - The benefit of hash-based caching is small when the repo is small.

## Decision

**Adopt a monorepo with `pnpm workspaces` as the repository strategy for the MVP. Add Turborepo later if CI runtime becomes a problem.**

**Concrete structure (the source of truth, replacing the illustrative one in ADR-09):**

```
wendy-planner/                              # monorepo root
├── package.json                            # workspace root, pnpm scripts
├── pnpm-workspace.yaml                     # workspace declarations
├── pnpm-lock.yaml                          # checked in
├── tsconfig.base.json                      # shared compiler options (experimentalDecorators: true)
├── .eslintrc.cjs                           # base ESLint config
├── .prettierrc                             # shared Prettier config
├── .github/
│   └── workflows/                          # CI/CD pipelines
├── apps/
│   ├── api/                                # NestJS API (ADR-01, ADR-14)
│   │   ├── Dockerfile
│   │   ├── prisma/
│   │   │   ├── schema.prisma               # DB schema (ADR-03, ADR-11)
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   └── modules/
│   │   └── package.json
│   └── web/                                # Vite + React SPA (ADR-02) — static deploy to S3, no container image
│       ├── vite.config.ts
│       ├── src/
│       │   ├── routes/                     # TanStack Router route groups (dashboard, public)
│       │   ├── i18n/                       # i18next catalogs (ADR-08)
│       │   └── components/
│       └── package.json
└── packages/
    └── contracts/                          # shared DTOs + ID types (ADR-14, ADR-13)
        ├── src/
        │   ├── dtos/                       # class-validator decorated classes
        │   │   ├── auth/
        │   │   ├── weddings/
        │   │   ├── guests/
        │   │   └── photos/
        │   ├── ids.ts                      # branded NanoId types (ADR-13)
        │   └── fe-adapter/                 # classValidatorResolver for React Hook Form
        ├── tsconfig.json                   # experimentalDecorators + emitDecoratorMetadata
        └── package.json
```

**Workspace declarations (`pnpm-workspace.yaml`):**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Cross-workspace dependency example:**

```jsonc
// apps/api/package.json
{
  "dependencies": {
    "@wendy/contracts": "workspace:*"
  }
}
```

**ESLint boundary enforcement:**

- ESLint rule: `apps/api` cannot import from `apps/web` and vice versa.
- ESLint rule: `apps/*` can import from `packages/*`, but `packages/*` cannot import from `apps/*`.
- ESLint rule: `packages/contracts` cannot depend on NestJS, Prisma client, or any runtime framework. It contains **DTO classes with class-validator decorators** (see ADR-14) and **branded ID types** (see ADR-13). The DTOs are pure TypeScript at runtime — the decorators are erased — so this rule is easy to enforce.

**CI/CD strategy:**

- The CI pipeline detects which workspaces changed (via `pnpm changed` or a simple diff) and runs the relevant jobs:
  - `apps/api` changed → build API image, run API tests, push to ECR.
  - `apps/web` changed → run Web tests, `vite build`, deploy the static bundle (S3 sync + CloudFront invalidation).
  - `packages/contracts` changed → rebuild and redeploy both dependents.
- The deploy stage promotes the API's ECR image to ECS via the standard rolling deploy; the Web App deploys as static assets (no image, no ECS service — see ADR-02 v2).

**Docker images:**

- Only the API has a `Dockerfile` (`apps/api/Dockerfile`) — a multi-stage build with `pnpm fetch` and `pnpm install --offline` for fast, reproducible builds. The production image contains only the built app — not the source code, not the `packages/contracts` source.
- The Web App has no container image: `vite build` produces static assets deployed to S3 and served via CloudFront (see ADR-02 v2).

## Consequences

### Positive

- **Velocity**: a single PR changes the contract, the API, and the FE consumer in one shot. No coordination overhead.
- **Type safety end-to-end**: changing a DTO in `packages/contracts` immediately surfaces TS errors in every consumer (controller, form, API client).
- **Onboarding**: `git clone` and `pnpm install` — done.
- **Tooling consistency**: one tsconfig, one ESLint config, one Prettier config.

### Negative / Trade-offs

- **Permissions are coarser**: both developers can change any app. Acceptable for 2 people.
- **CI runtime scales with the repo**: mitigated by per-app change detection and (later) Turborepo caching.
- **Coupling risk if boundaries slip**: mitigated by ESLint boundary rules.

### Follow-up actions

- [ ] Bootstrap the monorepo with pnpm workspaces, the structure above, and the shared configs [owner:: tech-lead] [priority:: high] [due:: end of sprint 1]
- [ ] Add ESLint boundary rules and a CI check that fails the build on cross-app imports [owner:: backend] [priority:: high]
- [ ] Wire the CI pipeline to detect changed workspaces and run the relevant jobs [owner:: tech-lead] [priority:: high]
- [ ] Document the local dev setup (one paragraph in the README) [owner:: tech-lead] [priority:: high]

### Revisit when

- The team grows past 4 developers and ownership boundaries start to blur.
- The repo's CI runtime exceeds 10 minutes for a typical PR (consider Turborepo or splitting into separate repos).
- A different client engagement requires a different technology baseline and reusing the monorepo becomes awkward.
