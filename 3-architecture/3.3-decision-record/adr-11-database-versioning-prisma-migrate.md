---
title: "ADR-11 — Database versioning: Prisma Migrate"
id: adr-11
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 2.0.0
updated: 2026-08-10
---

# ADR-11 — Database versioning: Prisma Migrate

> **Revision history**
> - **v2.0.0 (2026-08-10):** Removed Liquibase and Flyway from the comparison (they are JVM-ecosystem tools, irrelevant to a TypeScript backend). Added TypeORM and Drizzle as the natural TypeScript ORM comparators. Confirmed and expanded the "Prisma migrations as versioned scripts in git" answer to the user's question.
> - v1.0.0 (2026-08-10): Original decision compared against Liquibase and Flyway.

## Context

Wendy Planner's database schema will evolve continuously during the MVP and beyond (new fields for weddings, new bounded contexts like budget and vendors, schema changes for multi-tenancy enforcement). We need a database versioning mechanism that is:

- **Versioned**: every schema change is recorded in git history.
- **Reproducible**: every environment (dev, staging, prod) can be brought to the same schema state from scratch.
- **Reviewable**: schema changes go through the same PR review as code changes.
- **Recoverable**: a bad migration can be detected, forward-fixed, or rolled back via backup.
- **Automated**: applied as part of the deployment pipeline, not manually.
- **Native to the TypeScript ecosystem** we have chosen (ADR-01: NestJS).

The chosen ORM is the most important driver of this decision — the migration story is bundled with the ORM. We are not free to pick a migration tool independently.

## Answer to the recurring question

> "Can Prisma version migrations as scripts (the history of DB changes)?"

**Yes.** Prisma Migrate is exactly that. Every migration is a **versioned SQL script** stored under `apps/api/prisma/migrations/<timestamp>_<descriptive_name>/migration.sql`, checked into git. The directory IS the history. The Prisma engine also keeps a `_prisma_migrations` table in the database that records which scripts have been applied. The CLI command `prisma migrate deploy` applies pending scripts in order; `prisma migrate dev` generates a new script from schema diffs; `prisma migrate status` detects drift.

## Options Considered

### Option A — Prisma Migrate — **Selected**

- **Pros**
  - **Single source of truth**: `prisma/schema.prisma` is the application model and the migration input.
  - **Versioned SQL scripts** in git; the migrations folder is the audit log.
  - **Pipeline-native**: `prisma migrate deploy` is the command that applies pending scripts; idempotent and safe to run on container start.
  - **Drift detection**: `prisma migrate status` reports drift between the live database and the scripts folder.
  - **Type-safe clients**: regeneration of `@prisma/client` keeps the application code in sync with the schema.
  - **Native to TypeScript**; the same package is the ORM.
- **Cons**
  - **Forward-only**: no automatic rollback (we mitigate with `pg_dump` before destructive migrations and RDS snapshots).
  - Some advanced refactorings (column rename with zero downtime) require manual SQL outside the auto-generated script.
  - Drift between `schema.prisma` and ad-hoc DB changes can sneak in if developers run `prisma db push` in production (forbidden by the runbook).

### Option B — TypeORM migrations

- **Pros**
  - **Bidirectional migrations**: `migration:generate` for diff-based, `migration:create` for empty, and **built-in `migration:revert`** for rollback.
  - **TypeScript-native**: migration classes written in TS, can import runtime code (e.g. seed data factories).
  - Mature; widely used in NestJS projects.
- **Cons**
  - **Two sources of truth**: `@Entity()` decorators (in app code) and migration classes. Drift is a constant risk.
  - Migration classes can grow to hundreds of lines; the diff generator produces verbose code.
  - The rollback feature is rarely used in practice — teams rely on forward-fix + backups.
  - TypeORM's decorator-heavy entity model is more verbose than Prisma's declarative schema.
  - Smaller community than Prisma in 2026.

### Option C — Drizzle ORM + drizzle-kit migrations

- **Pros**
  - **SQL-leaning**: schema defined in TypeScript but maps directly to SQL types (no DSL).
  - **Smallest runtime**: no separate query engine binary (unlike Prisma's ~20 MB engine).
  - **Versioned SQL scripts** in `drizzle/<timestamp>_<name>.sql`, identical workflow to Prisma Migrate.
  - **Fast**: native SQL generation, no runtime interpretation.
  - Strong typing throughout.
- **Cons**
  - **Newer ecosystem**: smaller community, fewer Stack Overflow answers, fewer integrations.
  - **Forward-only** by design (no built-in rollback).
  - More verbose than Prisma for complex relations; the schema-as-code is closer to raw SQL.
  - Prisma's ecosystem advantage (Prisma Studio, Migrate GUI, broad support in third-party tools) is hard to match.
  - Less NestJS-specific documentation.

### Option D — Knex.js migrations (without an ORM)

- **Pros:** simple SQL query builder + migration runner; no abstraction over SQL.
- **Cons:** we'd lose ORM features (typed queries, relations). Mixing Knex (queries) + an ORM (model) is worse than picking one. **Rejected.**

### Option E — Hand-rolled SQL files + a custom runner

- **Pros:** maximum control.
- **Cons:** we'd reinvent what Prisma already gives us for free. **Rejected.**

## Comparison matrix (TypeScript-native contenders)

| Concern | Prisma | TypeORM | Drizzle |
|---------|--------|---------|---------|
| Migration format | Auto-generated SQL script | TS class (or SQL) | Auto-generated SQL script |
| Storage | `prisma/migrations/<ts>_<name>/migration.sql` | `src/migrations/<ts>-<name>.ts` | `drizzle/<ts>_<name>.sql` |
| Versioned in git | ✅ | ✅ | ✅ |
| Diff-based generation | ✅ (`migrate dev`) | ✅ (`migration:generate`) | ✅ (`drizzle-kit generate`) |
| Apply to environment | `prisma migrate deploy` | `typeorm migration:run` | `drizzle-kit migrate` |
| Drift detection | ✅ (`migrate status`) | ✅ (`schema:log`) | ⚠️ partial |
| Built-in rollback | ❌ forward-only | ✅ (`migration:revert`) | ❌ forward-only |
| Source-of-truth model | `schema.prisma` (DSL) | `@Entity()` decorators in code | TS schema mapped to SQL types |
| Runtime engine | ~20 MB binary, interpreted | Pure JS, decorators | Pure JS, no engine |
| NestJS integration | First-class (`@prisma/client`) | First-class (NestJS docs show TypeORM) | Community modules |
| Studio / GUI | Prisma Studio | None | Drizzle Studio (newer) |
| Community size (2026) | Largest in TS | Mature, large | Fast-growing, smaller |
| Best fit for | CRUD with rich types and tooling | Java/JPA-style teams who want rollback | Teams who prefer raw SQL control |

## Decision

**Adopt Prisma Migrate as the database versioning tool for the MVP.**

**Concrete conventions:**

- **Schema source of truth:** `apps/api/prisma/schema.prisma`.
- **Migration scripts:** auto-generated via `pnpm --filter @wendy/api prisma migrate dev --name <descriptive-name>`. The descriptive name must follow `<context>_<intent>_<target>` (e.g. `weddings_add_event_date_index`).
- **What goes to git:** every `prisma/migrations/<timestamp>_<name>/migration.sql` file is committed. The migrations folder is the history.
- **Review:** every migration script is reviewed in the PR. Reviewers verify the SQL is safe (no accidental data loss, correct indexes, correct cascading).
- **Deploy pipeline:** a one-shot ECS task runs `pnpm --filter @wendy/api prisma migrate deploy` **before** the API service tasks are updated. The migration task must succeed before the service tasks start.
- **Local dev:** `docker compose up` runs Postgres + the migration command.
- **Production hotfixes:** forbidden. Schema changes go through a normal PR and deploy.
- **Forward-only:** no automatic rollback. If a migration breaks prod, the team writes a new migration that fixes the issue (or restores the lost data from the latest RDS snapshot).

**Backup before destructive migrations:**

- Any migration that drops a column, drops a table, or alters a column type triggers a `pg_dump` to S3 before the migration runs (a small Lambda or a CI step).

**Drift detection:**

- A weekly scheduled job runs `prisma migrate status` against prod and posts the result to a CloudWatch metric. Drift alerts page the on-call developer.

## Consequences

### Positive

- One tool for schema definition, migration scripts, and client generation.
- Every schema change is a SQL script in git, peer-reviewed, applied automatically.
- The migration history is auditable from `git log` alone.
- Drift detection catches "I changed the DB by hand" accidents before they cause incidents.

### Negative / Trade-offs

- No automatic rollback — we accept forward-only migrations and rely on RDS snapshots + backup-before-destructive for safety.
- Some advanced refactorings require manual SQL outside the auto-generated script. Acceptable at our scale.

### Follow-up actions

- [ ] Define the `prisma/schema.prisma` file with all bounded-context models and `tenant_id` columns (see ADR-07) [owner:: backend] [priority:: high]
- [ ] Add the migration step to the CI/CD pipeline as a one-shot ECS task [owner:: backend] [priority:: high]
- [ ] Document the backup-before-destructive policy in the backend blueprint [owner:: backend] [priority:: high]
- [ ] Set up the weekly drift-detection job [owner:: backend] [priority:: medium]

### Revisit when

- The team needs built-in rollback → consider TypeORM for that migration style (not recommended; the practice is forward-fix).
- Multi-tenancy moves to schema-per-tenant → Prisma still works, but the migration strategy becomes per-schema.
- The team outgrows Prisma's binary engine (unlikely at our scale) → consider Drizzle for SQL-leaning control.
