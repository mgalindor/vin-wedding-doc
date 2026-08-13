---
title: "Technical Specification — ARC-004+ARC-005+ARC-008: Bootstrap Web skeleton, @wendy/contracts package, and Prisma users migration"
date: 2026-08-13
type: specification
scope: internal
story-id: "ARC-004+ARC-005+ARC-008"
status: approved
version: 1.0.0
updated: 2026-08-13
layers:
  backend: true
  frontend: true
  mobile: false
  tooling: true
---

# Technical Specification — ARC-004+ARC-005+ARC-008: Bootstrap Web skeleton, @wendy/contracts package, and Prisma users migration

**Status: ✅ Approved (yolo mode — auto-approved to unblock Sprint 1 closure)**

> **Deviation note**: The standard `dev-implement-story` workflow does not include separate `create-task-list` and `approve-task-list` steps — those are folded into `implement-tasks`. Per explicit product-team instructions for this delivery run, a dedicated task-list approval gate is added between `approve-tech-spec` and `implement-tasks`. The workflow shape (functional → tech → task list → implement → verify) matches the Gene2 spec-driven development practice.

---

## Scope

| Layer           | Affected | Justification | foldername |
| --------------- | -------- | -------------------------------------- | --- |
| Backend         | Yes      | ARC-008 creates `apps/api/prisma/`, writes `schema.prisma` with the `users` model, runs `prisma migrate dev`, and adds `src/shared/prisma/prisma.service.ts` + `src/shared/prisma/prisma.module.ts` + `src/config/database.config.ts`. ARC-001/003 already created the rest of the API skeleton. | `apps/api/` |
| Frontend Web    | Yes      | ARC-004 fills the `apps/web/` workspace with the Vite 5 + React 19 + TS scaffolding (route groups, i18n, Tailwind, shadcn baseline, build output). | `apps/web/` |
| Frontend Mobile | No       | Out of scope per architecture §2.1 (TC-8: PC + tablet only). | — |
| Tooling         | Yes      | ARC-005 configures the `packages/contracts/` package (`tsconfig`, `package.json`, barrel, branded IDs module). ARC-001 created the workspace placeholder; ARC-005 makes it usable. | `packages/contracts/` |

The monorepo root (`code/` git submodule) hosts all three layers; ARC-001's ESLint boundary rules already enforce that `apps/*` and `packages/*` do not cross import each other.

---

## Architecture References

| Documents | Description |
|---|---|
| `3-architecture/3.1-architecture/architecture.md` §5.2 (Container View) | Defines the Web App and API containers; lists the route-group and shared-contract expectations. |
| `3-architecture/3.1-architecture/architecture.md` §5.1 (Bounded Contexts) | Identifies Identity & Access as the first bounded context — this spec provides its `users` table. |
| `3-architecture/3.2-blueprints/web-frontend-blueprint.md` §1-3 | Authoritative for the Web scaffolding — folder structure, tech stack versions, two route groups, `experimentalDecorators`. |
| `3-architecture/3.2-blueprints/backend-blueprint.md` §2-3 | Authoritative for `apps/api/prisma/`, `src/shared/prisma/`, `src/config/database.config.ts`. |
| `3-architecture/3.3-decision-record/adr-02-frontend-stack-vite-react.md` | ADR-02 v2.0.0 — Vite + React SPA, no Node.js runtime, lazy route groups. |
| `3-architecture/3.3-decision-record/adr-11-database-versioning-prisma-migrate.md` | ADR-11 — `schema.prisma` source of truth, versioned SQL migrations, `prisma migrate dev` workflow. |
| `3-architecture/3.3-decision-record/adr-13-id-strategy-nanoid.md` | ADR-13 — NanoId 10 chars, branded types in `packages/contracts/src/ids.ts`. |
| `3-architecture/3.3-decision-record/adr-14-validation-class-validator.md` | ADR-14 — DTOs in `@wendy/contracts`, `experimentalDecorators: true`, `emitDecoratorMetadata: true`. |
| `3-architecture/3.3-decision-record/adr-16-configuration-typed-classes.md` | ADR-16 — typed config classes with `class-validator`. Used for `DatabaseConfig`. |
| `3-architecture/3.3-decision-record/adr-12-monorepo-pnpm-workspaces.md` | ADR-12 — workspace structure (`apps/*`, `packages/*`), `@wendy/contracts: workspace:*` protocol. |
| `4-specs/20260812-arc-001-monorepo-and-nestjs-bootstrap/tech-spec.md` | The ARC-001+002+003 tech spec that created the workspace placeholders this spec fills in. |

---

## Backend

### API Endpoints

No application endpoints are introduced by this story. ARC-008 only writes a `users` table and wires `PrismaService`. The endpoint surface remains the two health-check stubs from ARC-003 (`GET /health/live`, `GET /health/ready`).

---

### Database Changes

> **Authoritative source for the migration** — the `apps/api/prisma/schema.prisma` file is the source of truth. The DBML below mirrors the Prisma model for documentation; the migration SQL is generated from the Prisma DSL.

**CREATE — `users`**

```dbml
// New table — initial migration, owned by ARC-008 (Sprint 1)
// Sprint 2+ bounded contexts own their own migrations (ARC-019 = weddings, etc.)

Enum user_role {
  Administrator
  WeddingPlanner
}

Table users {
  id                    varchar(10)   [pk]                  // NanoId, minted in app code (ADR-13)
  tenant_id             varchar(10)   [not null]            // ADR-07 — column from day 1; no FK yet (no tenants table in MVP)
  email                 varchar(255)  [not null, unique]    // login + audit
  full_name             varchar(255)  [not null]            // shown in dashboard / audit
  phone                 varchar(50)   [null]                // optional contact channel
  password_hash         varchar(72)   [not null]            // bcrypt cost 12; never returned in API responses (ADR-05)
  role                  user_role     [not null]            // ADR-05 §Roles
  onboarded_by_admin_id varchar(10)   [null]                // ARC-011 will convert to a proper FK in Sprint 2
  is_disabled           boolean       [not null, default: false]
  created_at            timestamptz   [not null, default: `now()`]
  updated_at            timestamptz   [not null, default: `now()`]

  indexes {
    tenant_id [name: 'idx_users_tenant_id']
    email [name: 'idx_users_email', unique]
  }
}
```

**Migration metadata:**

| Attribute | Value |
|---|---|
| Migration name | `identity_users_initial` |
| Path | `apps/api/prisma/migrations/<timestamp>_identity_users_initial/migration.sql` |
| Generated by | `pnpm --filter @wendy/api prisma migrate dev --name identity_users_initial` |
| Forward-only | Yes (per ADR-11 §Decision) |
| Reversible | No automatic revert; rely on RDS snapshots per ADR-11 §Backup-before-destructive |

**What's NOT in this migration** (deferred to their owning stories — evolutionary design rule):

| Table / Type | Owning Story | Sprint |
|---|---|---|
| `weddings`, `wedding_data` | ARC-019 | Sprint 2 |
| `guest_groups`, `guests` | ARC-022 | Sprint 2 |
| `rsvps` | ARC-025 | Sprint 3 |
| `photos`, `guest_photos` | ARC-030 | Sprint 4 |
| `audit_events` | ARC-037 | Sprint 4 |
| `tenants` (FK for `tenant_id`) | TBD — likely ARC-011 or a follow-up ADR | Sprint 2 |
| `OAuthRefreshTokens` | ARC-013 | Sprint 1 (next) |

---

### Events

No events are published or consumed in this story. `@nestjs/event-emitter` is not installed in Sprint 1; ARC-037 wires the in-process bus in Sprint 4.

---

### Third-party Integrations (Backend)

| Action | Service | Purpose | Authentication |
|---|---|---|---|
| USE | PostgreSQL 15 (local: `docker run postgres:15` or via `OPS-023` docker-compose) | Target database for the initial migration and `PrismaService` connection | `DATABASE_URL` env var (per ADR-16) |
| USE | `@prisma/client` 5.x | Type-safe ORM client (per ADR-11) | Generated client from `schema.prisma` |

---

## Frontend (Web)

> **The web blueprint §3 is the authoritative source for folder structure and routing.** This section restates the blueprint at the level of decisions only — no markup, no component names, no styling.

### Structure

#### Screens / Views

| Action | Screen | Description |
|---|---|---|
| CREATE | `DashboardPlaceholderScreen` | A placeholder view inside the `(dashboard)` route group. Renders a heading "Welcome to Wendy Planner — Sprint 1 foundations ready" and a short paragraph in the active locale. No navigation, no data fetching. |
| CREATE | `PublicInvitationPlaceholderScreen` | A placeholder view inside the `(public)` route group at the path `/i/:token`. Renders a heading and a paragraph in the active locale. Does not yet call the API for the invitation payload — that arrives with ARC-025 (Sprint 3). |

#### Navigation and Routing

| Action | Route / Screen | Navigates from | Trigger | Stack type |
|---|---|---|---|---|
| CREATE | `DashboardPlaceholderScreen` | App root (`/`) | Initial render when the user has no token | replace |
| CREATE | `PublicInvitationPlaceholderScreen` | App root (`/i/:token`) | Direct URL hit by a guest | replace |

Two route groups are wired with **lazy loading** so guests do not download the dashboard chunk and authenticated users do not download the public chunk (ADR-02 §Option A). The router is TanStack Router (per the backlog's ARC-004 description and the web blueprint §2).

### Interaction

#### UI Components

| Action | Component | Description |
|---|---|---|
| CREATE | `LocaleSwitcher` | A small control in the dashboard header that toggles between `en` and `es`. Stores the override in a cookie. Persists across reloads. |

No forms, no tables, no modals in this story. Forms arrive with Sprint 2 (Wedding create form).

#### UI Behavior Rules

| Element | Rule | Trigger |
|---|---|---|
| Dashboard placeholder heading | Renders in the active locale (`en` default) | On page load and on locale change |
| Public invitation placeholder | Renders without an auth check | On `/i/:token` direct hit |
| Locale switcher | Persists the choice in a cookie named `wendy_locale` | On toggle |

### Data

#### API Consumption (Frontend → Backend)

| Endpoint | Triggered by | Outcome in UI |
|---|---|---|
| `GET /health/ready` | Manual smoke check (`curl http://localhost:3000/health/ready`) | Returns 200 — used by the developer to confirm the API is up. Not called by the UI in this story. |

No authenticated API calls happen from the Web in this story — the dashboard and invitation placeholders are static. ARC-013 (JWT) lands the auth flow, and Sprint 2 wires the first real API call.

#### Data State Design

| Data | Scope | Lifecycle |
|---|---|---|
| Active locale | shared across the whole app | Read from cookie on load; updated by `LocaleSwitcher` |
| Nothing else | — | — |

No feature state, no auth tokens, no API cache in this story. The `shared/auth/` folder is created (per the web blueprint §3) but left empty — ARC-013 fills it.

#### Third-party Integrations (Frontend)

| Action | Service / SDK | Purpose | Notes |
|---|---|---|---|
| USE | `i18next` + `react-i18next` + `i18next-browser-languagedetector` | Bilingual UI per ADR-08 | Detection priority: cookie → `Accept-Language` → `en` |
| USE | Tailwind CSS 4.x | Utility-first styling baseline | Default theme tokens for Sprint 1 |
| USE | shadcn/ui (`Button` primitive only in this iteration) | Accessible component baseline | Installed via shadcn CLI; one primitive proves the pipeline |

---

## Cross-cutting Concerns

### Monorepo and Tooling

| Change | Folder | Reason |
|---|---|---|
| `packages/contracts/package.json` updated | `packages/contracts/` | Declare `@wendy/contracts` package identity; add `build`, `lint`, `typecheck` scripts; pin `nanoid@^5` |
| `packages/contracts/tsconfig.json` updated | `packages/contracts/` | Set `experimentalDecorators`, `emitDecoratorMetadata`, `strict`, `moduleResolution: bundler` (per ADR-14) |
| `packages/contracts/src/ids.ts` created | `packages/contracts/` | Branded NanoId types + `nanoid` re-export (per ADR-13) |
| `packages/contracts/src/index.ts` updated | `packages/contracts/` | Barrel re-export from `./ids.ts` |
| `packages/contracts/src/dtos/.gitkeep` created | `packages/contracts/` | Empty DTO dir marker for future bounded contexts |
| `apps/api/package.json` updated | `apps/api/` | Add `@prisma/client`, `prisma`, `@wendy/contracts` (workspace:*); add `prisma` script |
| `apps/api/prisma/schema.prisma` created | `apps/api/prisma/` | Single `users` model (per ARC-008 Rule 17) |
| `apps/api/prisma/migrations/<ts>_identity_users_initial/migration.sql` generated | `apps/api/prisma/migrations/` | Initial migration |
| `apps/api/src/shared/prisma/prisma.service.ts` created | `apps/api/src/shared/prisma/` | `@Injectable()` PrismaClient wrapper with `OnModuleInit`/`OnModuleDestroy` |
| `apps/api/src/shared/prisma/prisma.module.ts` created | `apps/api/src/shared/prisma/` | `@Global()` module exporting `PrismaService` |
| `apps/api/src/config/database.config.ts` created | `apps/api/src/config/` | `DatabaseConfig` typed class with `@IsUrl()` `DATABASE_URL` |
| `apps/api/src/app.module.ts` updated | `apps/api/` | Import `PrismaModule` |
| `apps/web/package.json` updated | `apps/web/` | Add `react`, `react-dom`, `react-router-dom` (or `@tanstack/react-router`), `vite`, `tailwindcss`, `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `nanoid`, `clsx`, shadcn deps, `@wendy/contracts` (workspace:*); add `dev`, `build`, `preview`, `lint`, `typecheck` scripts |
| `apps/web/tsconfig.json` updated | `apps/web/` | Set `experimentalDecorators: true` for shared DTOs; extend root `tsconfig.base.json` |
| `apps/web/vite.config.ts` created | `apps/web/` | Vite config: React plugin, `@` alias to `src/`, default dev port 5173 |
| `apps/web/tailwind.config.js` + `postcss.config.js` created | `apps/web/` | Tailwind 4 baseline |
| `apps/web/index.html` created | `apps/web/` | Single root with `#root` div; mount script for `src/main.tsx` |
| `apps/web/src/main.tsx` created | `apps/web/` | React bootstrap with providers (i18n, router) |
| `apps/web/src/router.tsx` created | `apps/web/` | Router with two lazy route groups: `(dashboard)` and `(public)` |
| `apps/web/src/routes/(dashboard)/index.tsx` created | `apps/web/` | Dashboard placeholder |
| `apps/web/src/routes/(public)/invitation.$token.tsx` created | `apps/web/` | Public invitation placeholder |
| `apps/web/src/features/.gitkeep` created | `apps/web/src/features/` | Empty marker for future features |
| `apps/web/src/shared/.gitkeep` created | `apps/web/src/shared/` | Empty marker (auth/api-client/ui/lib sub-folders are scaffolded in Sprint 2+) |
| `apps/web/src/shared/ui/button.tsx` created | `apps/web/src/shared/ui/` | One shadcn `Button` primitive — proves the styling pipeline |
| `apps/web/src/i18n/config.ts` created | `apps/web/src/i18n/` | i18next + detector + react-i18next wiring |
| `apps/web/src/i18n/locales/en/common.json` created | `apps/web/src/i18n/locales/en/` | `{ "app.title": "...", "app.dashboard.greeting": "...", "app.invitation.placeholder": "..." }` |
| `apps/web/src/i18n/locales/es/common.json` created | `apps/web/src/i18n/locales/es/` | Spanish translations of the same keys |
| `apps/web/README.md` updated | `apps/web/` | Quick start: clone → `pnpm install` → `pnpm dev` → open `http://localhost:5173` |

### ESLint boundary rules

All changes must respect the rules installed by ARC-002:

- `apps/web/src/**` cannot import from `apps/api/src/**`
- `apps/api/src/**` cannot import from `apps/web/src/**`
- `packages/*/src/**` cannot import from `apps/*/src/**`

The shared contracts package is the only cross-workspace surface.

### Security and Authorization

| Endpoint / Feature | Allowed roles | Notes |
|---|---|---|
| `GET /health/live`, `GET /health/ready` | Public | Unchanged from ARC-003. |
| Dashboard placeholder route | Public in this iteration | No auth gate yet — ARC-013 adds `_auth-guard.tsx` to the `(dashboard)` group. |
| Public invitation placeholder route | Public in this iteration | No token validation yet — ARC-016 wires the `PublicTokenGuard`. |
| `DatabaseConfig` `DATABASE_URL` | API boot only | The value never leaves the server. |
| `password_hash` column | API only | Never exposed in any API response (enforced when ARC-017 ships the `UserResponseDto`). |

### Error Handling

| Scenario | Expected behavior |
|---|---|
| `DATABASE_URL` missing on boot | `DatabaseConfig.fromEnv()` throws a `class-validator` validation error in `main.ts` before `NestFactory.create()` returns. The process exits with a clear `[DatabaseConfig] validation failed: - DATABASE_URL: must be a URL` message. |
| Prisma migration fails against local Postgres | The `prisma migrate dev` command exits non-zero with the standard Prisma error envelope; the developer sees the diff that failed. The migration is rolled back (Prisma wraps each migration in a transaction by default for SQL it can). |
| i18n locale file is missing a key | At dev time, the key renders as the key string (i18next default). A Sprint 2 CI step (per ADR-08 follow-up) fails the build on missing keys; Sprint 1 does not block on this. |
| Web `pnpm dev` runs without backend | Dashboard placeholder renders normally — it does not call the API. |

### Configuration

| Env var | Source | Purpose |
|---|---|---|
| `DATABASE_URL` | local `.env` (dev) / ECS task definition (prod) | Postgres connection string for `PrismaService` |
| `NODE_ENV`, `PORT`, `LOG_LEVEL` | Same as ARC-003 | Already wired by `EnvConfig` |

The `DatabaseConfig` typed class (ADR-16) is the minimal version that ARC-006 will extend with pool size, TLS options, and environment-specific behavior. For Sprint 1, `@IsUrl()` is sufficient.

---

## Technical Risks and Constraints

| Risk / Constraint | Impact | Mitigation |
|---|---|---|
| **OPS-023 (docker-compose for local dev) may not be ready when ARC-008 runs.** The migration needs a Postgres 15 instance. | Medium | Fallback: developer runs `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:15` ad-hoc and points `DATABASE_URL` at it. The acceptance test only requires the migration to succeed against any Postgres 15, not specifically against `docker-compose`. |
| **Prisma migration `@@map` and enum handling.** The `users` table is mapped via `@@map("users")`; the `role` column uses a Postgres ENUM type. If the team prefers a `text` + `CHECK` constraint for portability, that's a separate decision. | Low | Use Postgres ENUM in this iteration (lower ceremony, type-safe at the DB layer). If portability becomes a need, a follow-up migration can convert the column. |
| **`onboarded_by_admin_id` as a String without a FK.** The column references `users.id` but no FK constraint exists (no circular FK possible without `DEFERRABLE INITIALLY DEFERRED`). | Low | ARC-011 (Sprint 2) replaces the column with a proper FK once the team confirms the dual-role model. Until then, application code enforces referential integrity. |
| **Router choice (TanStack Router vs React Router v7).** The backlog says TanStack Router; the web blueprint leaves it open. | Low | Adopt TanStack Router per the backlog. ADR-02 lists TanStack Router as the primary option. If the FE developer prefers React Router v7, the swap is local to `apps/web/src/router.tsx`. |
| **shadcn/ui installation requires a CLI that may prompt.** shadcn CLI is interactive — automated installs need `--yes` flags. | Low | Install only the `Button` primitive with the non-interactive flag; later iterations add primitives one at a time as features need them. |
| **i18n locale files grow incrementally.** Sprint 1 only has the `common` namespace; Sprint 2+ adds `weddings`, `guests`, etc. | Low | Convention is one JSON file per namespace; CI lint in Sprint 2 fails on missing keys (per ADR-08 follow-up). |
| **Prisma 5.x + Node 22 LTS compatibility.** Prisma's engine binary is large; first-time `prisma generate` downloads it. | Low | Standard `pnpm install` handles the download; first run may take 30–60 s. |
| **`@prisma/client` is a dev-time dep in `apps/web`?** No — `@prisma/client` is a backend-only dep. The Web only consumes the generated types indirectly via DTOs, not the runtime client. | Low | `@prisma/client` is in `apps/api/package.json` dependencies only. `apps/web/package.json` does not list it. |

---

## Open Questions

> All questions must be answered before this document moves to `approved` status. (Yolo mode: all answers are inferred and recorded below — reviewer should confirm or correct.)

- [x] **Q1.** Which router library — TanStack Router or React Router v7? **Resolution:** TanStack Router per the backlog's ARC-004 description. ADR-02 lists it as the primary option. File-based routing, type-safe by default, lazy boundaries are first-class.
- [x] **Q2.** Where does the `onboarded_by_admin_id` FK go? **Resolution:** Nullable String with no FK constraint in this migration. ARC-011 (Sprint 2) replaces with a proper FK once the dual-role model is confirmed.
- [x] **Q3.** How is `role` stored — Postgres ENUM or text + CHECK? **Resolution:** Postgres ENUM (`user_role`) for type safety at the DB layer. Adding a new role later is a single `ALTER TYPE ... ADD VALUE` migration.
- [x] **Q4.** Is the `PrismaService` global? **Resolution:** Yes — `@Global()` so any bounded context module can inject `PrismaService` without re-importing `PrismaModule`. ADR-09 mentions that bounded contexts should not depend on each other's internals; the `PrismaService` is shared infrastructure, not a bounded-context detail.
- [x] **Q5.** Should `apps/web` install shadcn primitives as part of this story? **Resolution:** Yes — install only `Button` to prove the styling pipeline. Other primitives are added in later stories when features need them.
- [x] **Q6.** Do we run `prisma migrate dev` or `prisma migrate deploy` for the initial migration? **Resolution:** `prisma migrate dev` — this is local dev only; production migrations go through `prisma migrate deploy` (owned by OPS-007 in Sprint 5). The dev command creates the migration SQL and applies it.
- [x] **Q7.** Is the `fe-adapter` (`classValidatorResolver`) part of this story? **Resolution:** No — explicitly deferred to Sprint 3 per the backlog v1.5.0 note for ARC-005. Sprint 1 only needs the base types and the decorator-capable tsconfig.
