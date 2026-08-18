---
title: "Specification: Bootstrap Web skeleton, @wendy/contracts package, and Prisma users migration"
date: 2026-08-13
type: specification
scope: internal
story-id: "ARC-004+ARC-005+ARC-008"
status: approved
version: 1.0.0
updated: 2026-08-13
---

# Bootstrap Web skeleton, @wendy/contracts package, and Prisma users migration

> **Status: Approved (yolo mode — auto-approved by delivery team to unblock Sprint 1 completion)**

## User Stories

`ARC-004` **Bootstrap Vite + React Web skeleton** — As the delivery team, we need the `apps/web/` Vite + React SPA scaffolded with the two route groups `(dashboard)` and `(public)`, the i18n directory, and a placeholder layout, so that the frontend developer can begin building Sprint 1 dashboard screens against a working routing, styling, and i18n foundation. Per ADR-02 v2. No Node.js runtime — static build only. [groupBy:: arq] [priority:: 3]

`ARC-005` **Bootstrap `@wendy/contracts` package** — As the delivery team, we need the `packages/contracts/` shared package configured with `experimentalDecorators` and `emitDecoratorMetadata` in its tsconfig and the branded NanoId type module in place, so that Sprint 2+ DTOs can be authored once and consumed safely by both the API and the Web App. Per ADR-13 and ADR-14. The `fe-adapter` (React Hook Form `classValidatorResolver`) is **deferred to Sprint 3** — Sprint 1 only needs the base types and the decorator-capable tsconfig. [groupBy:: arq] [priority:: 3]

`ARC-008` **Initialize Prisma `users` migration** — As the delivery team, we need the `apps/api/prisma/` directory initialized with a `schema.prisma` containing only the `users` model (every model carries `tenant_id` per ADR-07) and the corresponding first migration applied, so that JWT auth (ARC-013) and WP onboarding (ARC-017) have a real database to write to. The schema grows incrementally in later sprints — no pre-designed models for `weddings`, `guests`, etc. Per ADR-07 and ADR-11. [groupBy:: arq] [priority:: 3]

## Context

After ARC-001+ARC-002+ARC-003 landed on 2026-08-12, the team has a runnable monorepo, ESLint boundary enforcement, and a NestJS API skeleton with seven empty `@Module()` declarations. The three remaining Sprint 1 foundations cannot start without these next three pieces:

1. **`apps/web/` is empty.** The frontend developer cannot run `pnpm dev` and see anything on screen; there is no router, no styling baseline, no i18n wiring. Sprint 1's user stories (US-001 through US-006) all need a dashboard that renders.
2. **`packages/contracts/` is an empty barrel.** Branded ID types (ADR-13) and the decorator-capable tsconfig (ADR-14) must be in place before Sprint 2 DTOs are written, otherwise DTOs drift between apps.
3. **`apps/api/prisma/` does not exist.** The NestJS API cannot persist anything. ARC-013 (JWT) and ARC-017 (WP onboarding endpoint) need a `users` table with `tenant_id` from day one (ADR-07).

These three pieces are coordinated as one specification because they all unblock the same Sprint 1 closure: by the end of the sprint, the team needs a dashboard that authenticates against a real database. Splitting them across three specs would force three context switches and three separate verifications for closely-related scaffolding work.

This is infrastructure work, not a user-facing feature. The "users" of this work are the two-person delivery team (1 BE + 1 FE) who will be opening PRs against the repository starting the day this work lands. Acceptance criteria are written so a developer can clone the repo, run `pnpm install` and `pnpm db:migrate`, and get a working frontend and a database with a `users` table ready to receive WP onboarding rows.

## Dependencies

| Story | Type | Description |
|---|---|---|
| `ARC-001` Bootstrap monorepo with pnpm workspaces | Requires | The `apps/web` and `packages/contracts` workspaces were created (as placeholders) by ARC-001. ARC-004 and ARC-005 fill them in. |
| `ARC-003` Bootstrap NestJS API skeleton with module layout | Requires | The `apps/api/src/` folder structure (modules, shared, config) was created by ARC-003. ARC-008 adds the `prisma/` directory and integrates the `PrismaService` into the existing skeleton. |
| `ARC-002` Enforce ESLint boundary rules | Requires | The boundary rules will start firing real errors if ARC-004 introduces an `apps/web` import from `apps/api`. ARC-004 must respect the existing rules. |
| `ARC-006` Configure shared typed-config classes | Required by | ARC-006 will wire `DatabaseConfig` from `@prisma/client`-driven env vars (DATABASE_URL, etc.). ARC-008 only needs a minimal working `DATABASE_URL` for local dev; ARC-006 formalizes it. |
| `ARC-013` Implement JWT auth (RS256) + JWKS | Required by | ARC-013 reads `users.password_hash` and `users.id` to mint JWTs. ARC-008 must have the `users` table and migration in place before ARC-013 can write its adapter tests. |
| `ARC-017` Implement WP onboarding endpoint | Required by | ARC-017's `POST /api/v1/wedding-planners` writes to the `users` table. Without ARC-008 the endpoint has nothing to write to. |
| `ARC-019` Implement Wedding bounded context | Required by | ARC-019 adds the `weddings` table — a separate migration owned by that task. ARC-008 ships **only** the `users` table per the evolutionary design rule. |
| `ARC-037` Implement Audit module | Required by | ARC-037 adds the `audit_events` table — separate migration. ARC-008 does not pre-create it. |
| `US-006` Confirm my identity to access the platform | Required by | US-006 (Sprint 1) requires the dashboard to render an authenticated layout that ARC-004 scaffolds. |
| `US-001` Onboard a new Wedding Planner | Required by | US-001 (Sprint 1) requires the `users` table from ARC-008 to persist the WP. |
| `OPS-023` Author `docker-compose.yml` for local dev | Required by | OPS-023 provides the Postgres 15 container that ARC-008's migration runs against in local dev. |

> ⚠️ Assumption — `OPS-023` may not land before ARC-008; if the docker-compose is not yet available when ARC-008 starts, the developer can run migrations against a temporary local Postgres (`docker run postgres:15` ad-hoc) or against a `DATABASE_URL` provided by the team's existing local setup. The acceptance test only requires the migration to succeed against a real Postgres 15 instance.

## Rules & Constraints

### Web App (ARC-004)

- **Rule 1 — Vite 5 + React 19 + TypeScript 5.x stack**: `apps/web/` is a single-page application using Vite 5 as the build tool, React 19 as the UI framework, and TypeScript 5.x with `experimentalDecorators: true` (per ADR-14). No SSR, no Next.js, no server-side runtime — `pnpm dev` starts the Vite dev server on port `5173` and `pnpm build` produces a static `dist/` folder.
- **Rule 2 — Two lazy route groups**: The router is wired with two top-level route groups: `(dashboard)` (authenticated, lazy chunk) and `(public)` (guest invitation at `/i/:token`, lazy chunk). Guests do not download the dashboard chunk and vice versa (ADR-02 §Option A). A `(public)` placeholder page exists so the route resolves; a `(dashboard)` placeholder page exists so the authenticated route resolves. Both render minimal content (a heading and a paragraph in `en`).
- **Rule 3 — i18n directory present and wired**: `apps/web/src/i18n/locales/en/common.json` and `apps/web/src/i18n/locales/es/common.json` exist with the same keys (English and Spanish). `i18next` + `react-i18next` + `i18next-browser-languagedetector` are wired in `apps/web/src/i18n/config.ts`. Default locale is `en`; detector reads `Accept-Language` first visit and a cookie on subsequent visits.
- **Rule 4 — Tailwind CSS + shadcn/ui baseline**: Tailwind CSS is configured with the project design tokens (default Tailwind theme — no custom palette in this iteration). A single shadcn/ui primitive (`Button`) is installed and renders successfully on the dashboard placeholder so the styling pipeline is proven end-to-end.
- **Rule 5 — Static build output, no Node.js runtime**: `pnpm --filter @wendy/web build` produces a `dist/` folder with `index.html`, a JS bundle, a CSS bundle, and asset files. There is no `server.ts`, no `vite.config.ts` `server` block beyond dev defaults, and no Fargate task definition for the Web. The deploy model is `aws s3 sync dist/ s3://wp-web-static-prod/` (delivered by OPS-014 in Sprint 3).
- **Rule 6 — ESLint boundary rules respected**: `apps/web/src/**` does not import from `apps/api/src/**` and does not import from any future file outside the standard web stack. `pnpm lint` from the repo root exits 0 on a fresh checkout.
- **Rule 7 — Browser compatibility**: The placeholder dashboard renders correctly on the latest two versions of Chrome, Edge, Firefox, and Safari (TC implied by architecture §10.1). PC and tablet viewports render correctly; mobile is acceptable but not optimized (TC-8).
- **Rule 8 — Web blueprint compliance**: The folder structure matches `3-architecture/3.2-blueprints/web-frontend-blueprint.md` §3 (Scaffolding): `src/routes/(dashboard)`, `src/routes/(public)`, `src/features/`, `src/shared/`, `src/i18n/`, and `src/main.tsx`.

### `@wendy/contracts` Package (ARC-005)

- **Rule 9 — Package identity and tsconfig**: `packages/contracts/package.json` declares `name: "@wendy/contracts"`, `private: true`, `type: "module"`, `main: "./src/index.ts"`, and `scripts` for `lint`, `typecheck`, and `build`. `packages/contracts/tsconfig.json` extends the root `tsconfig.base.json` and explicitly sets `experimentalDecorators: true`, `emitDecoratorMetadata: true`, `strict: true`, and `moduleResolution: "bundler"`.
- **Rule 10 — Branded NanoId types module**: `packages/contracts/src/ids.ts` exports branded TypeScript types for every entity the team will mint IDs for: `UserId`, `TenantId`, `WeddingId`, `GuestGroupId`, `GuestId`, `RsvpId`, `PhotoId`, `GuestPhotoId`, `AuditEventId`, `InvitationTokenId`, and `PhotoAlbumTokenId`. Each is `string & { readonly __brand: '<TypeName>'Id }`. The file also exports the `nanoid()` helper from the `nanoid` package and a barrel that re-exports the types and helper.
- **Rule 11 — Empty DTO directory, future-proof**: `packages/contracts/src/dtos/` exists as an empty folder with a `.gitkeep` file. Sprint 2+ stories populate this directory one bounded context at a time (per the evolutionary design rule). The `fe-adapter` directory does **not** exist in this iteration (Sprint 3 deliverable).
- **Rule 12 — Re-export from root barrel**: `packages/contracts/src/index.ts` re-exports everything from `./ids.js` (or `.ts`, depending on resolution) so `import { WeddingId } from '@wendy/contracts'` works from both apps. Future DTO modules will be re-exported from the same barrel.
- **Rule 13 — Workspace protocol in API and Web**: `apps/api/package.json` and `apps/web/package.json` declare `"@wendy/contracts": "workspace:*"` in `dependencies` (not `devDependencies`, since types are imported at runtime by the form adapter). The lockfile resolves `@wendy/contracts` to the local workspace, not npm.
- **Rule 14 — `nanoid` is the single source of IDs**: Both apps use the `nanoid` npm package (v5.x) to mint IDs. The browser bundle is ~118 bytes — no aliasing, no shimming, the same library on both sides so an ID minted in the FE is a valid server ID (ADR-13 §Decision).
- **Rule 15 — `experimentalDecorators` test in CI**: A unit test confirms that a minimal class with `@IsString()` from `class-validator` (installed transitively for the test, not for runtime use yet) compiles under the package's `tsconfig.json`. This proves the decorator pipeline works end-to-end before Sprint 2 DTOs land.

### Prisma `users` Migration (ARC-008)

- **Rule 16 — `apps/api/prisma/` is created with `schema.prisma`**: The directory contains `schema.prisma` (declarative Prisma DSL) and `migrations/` (initially empty — the migration is created by running `prisma migrate dev`). The `prisma` script in `apps/api/package.json` invokes `prisma` via `pnpm exec`. The PostgreSQL `provider` is `postgresql` and the `DATABASE_URL` is read from `process.env`.
- **Rule 17 — Only the `users` model exists**: `schema.prisma` contains exactly one model: `users`. The model carries `tenant_id` (NOT NULL, indexed, FK to a future `tenants` table that ARC-019 or ARC-011 may add later — see Rule 19), `id` (String, primary key, branded `UserId` via `@default(nanoid())` through Prisma's `@default(cuid())` is rejected — see ADR-13 §Sorting; NanoId is generated in application code, not by the DB), `email` (unique, indexed), `full_name`, `phone` (nullable), `password_hash` (bcrypt-hashed), `role` (`Administrator` | `WeddingPlanner`, enum), `onboarded_by_admin_id` (nullable FK to `users.id` — see ARC-011 follow-up note in the backlog), `is_disabled` (Boolean, default false), `created_at` (timestamptz, default `now()`), and `updated_at` (timestamptz, updated via trigger or app code).
  - *Example (intended shape):*
    ```prisma
    model users {
      id                    String    @id
      tenant_id             String
      email                 String    @unique
      full_name             String
      phone                 String?
      password_hash         String
      role                  UserRole
      onboarded_by_admin_id String?
      is_disabled           Boolean   @default(false)
      created_at            DateTime  @default(now())
      updated_at            DateTime  @updatedAt

      @@index([tenant_id])
      @@index([email])
      @@map("users")
    }
    ```
- **Rule 18 — First migration is `users`-only**: `pnpm --filter @wendy/api prisma migrate dev --name identity_users_initial` creates the migration under `apps/api/prisma/migrations/<timestamp>_identity_users_initial/migration.sql`. The SQL contains exactly the `CREATE TABLE users`, the `CREATE TYPE user_role AS ENUM`, and the indexes from Rule 17 — nothing else (no future-sprint tables, no audit table, no tenants table).
- **Rule 19 — `tenant_id` is a String column, not a FK yet**: ADR-07 calls out that the `tenant_id` column exists from day one but row-level isolation is not enforced. In Sprint 1 there is no `tenants` table; `tenant_id` is a plain String column with an index, and the application code filters by it. ARC-011 (or a follow-up ADR) may later add a `tenants` table and convert the column to a FK.
  - *Example:* `tenants` is not pre-created. ARC-019 (Sprint 2) does not pre-create it either — the column stays as a String until a future ADR adds the `tenants` table.
- **Rule 20 — `PrismaService` lives in `src/shared/prisma/`**: `apps/api/src/shared/prisma/prisma.service.ts` is an `@Injectable()` class that extends `PrismaClient` and implements `OnModuleInit` / `OnModuleDestroy` (lifecycle hooks to connect / disconnect). It is exported via `PrismaModule` (`@Global()` so any bounded context can inject it without re-importing). ARC-003 generated the empty folder; ARC-008 fills it.
  - *Example:* `apps/api/src/shared/prisma/prisma.module.ts` declares `@Global() @Module({ providers: [PrismaService], exports: [PrismaService] })`. `app.module.ts` imports `PrismaModule`.
- **Rule 21 — Minimal `DatabaseConfig` for local dev**: `apps/api/src/config/database.config.ts` declares a `DatabaseConfig` class with `@IsUrl()` `DATABASE_URL` and validates it on boot (per ADR-16). ARC-006 will extend this with pool size and other production-grade options; ARC-008 only needs the minimum that makes the migration command work.
- **Rule 22 — The `@prisma/client` generated client compiles**: `pnpm --filter @wendy/api prisma generate` (run automatically by `prisma migrate dev`) produces `node_modules/.prisma/client/` with the `User` model. A smoke test confirms the API can `import { PrismaClient } from '@prisma/client'` and call `prisma.user.count()` (returns 0) without crashing.
- **Rule 23 — Backend blueprint compliance**: The Prisma layout (`apps/api/prisma/`, `src/shared/prisma/prisma.service.ts`, `src/config/database.config.ts`) matches `3-architecture/3.2-blueprints/backend-blueprint.md` §2-3 (Tech Stack and Scaffolding).

### Cross-cutting

- **Rule 24 — No application code yet**: Like ARC-003, these three stories deliver scaffolding and one migration only — no business endpoints, no DTOs beyond the IDs module, no use cases. The bounded-context modules are still empty `@Module({})` declarations; ARC-019+ fills them in.
- **Rule 25 — `pnpm` scripts on day one**: `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm --filter @wendy/web dev`, `pnpm --filter @wendy/web build`, `pnpm --filter @wendy/api prisma migrate dev`, and `pnpm --filter @wendy/api prisma generate` all succeed on a clean clone. The scripts are declared in the relevant `package.json` files; the lockfile resolves every workspace dependency.
- **Rule 26 — One verification per story**: Each of the three stories (ARC-004, ARC-005, ARC-008) has its own verification artifacts, but they are checked together at the end of this spec. A reviewer opening the repo can find the Web running on port 5173, the `@wendy/contracts` types importable from both apps, and the `users` table present in the local Postgres.

> ⚠️ Assumption — The `onboarded_by_admin_id` column is included in this migration even though the related ARC-011 ("Model WP ownership and Admin-as-WP dual role") is a Sprint 2 task. The column can be a nullable String with no FK constraint for now; ARC-011 will convert it to a proper FK. Including it avoids a follow-up migration in Sprint 2 just to add the column.

> ⚠️ Assumption — `role` is stored as a Postgres `ENUM` (`Administrator`, `WeddingPlanner`) rather than a String column. The migration creates the type. If the team later wants to add a third role, the Postgres `ALTER TYPE ... ADD VALUE` migration is straightforward.

## User Experience Notes

Not applicable in the strict sense — these are infrastructure stories. The "user experience" is the developer experience:

- A clean clone + `pnpm install` + `pnpm db:migrate` + `pnpm dev` brings up the dashboard at `http://localhost:5173` and the API at `http://localhost:3000`.
- Opening the dashboard in the browser shows a placeholder page ("Welcome to Wendy Planner — Sprint 1 foundations ready") in `en` by default; switching the browser language to `es` and refreshing renders the same page in Spanish.
- ESLint boundary rules produce one-line error messages naming the forbidden import path, not a generic "lint failed".
- `pnpm --filter @wendy/api prisma migrate dev` against a local Postgres prints a clean summary of the migration applied and the seed data available (none in this iteration).
- A TypeScript file in `apps/web/src/` that imports `import type { WeddingId } from '@wendy/contracts';` type-checks without errors.

No user-facing UI components, no form validation, no i18n user-facing message catalogs are in scope here. Sprint 1 user stories (US-001, US-006, etc.) layer onto this foundation.
