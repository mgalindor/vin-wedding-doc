---
title: "ADR-01 — Backend stack: NestJS (Node.js + TypeScript)"
id: adr-01
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 1.0.1
updated: 2026-08-11
---

# ADR-01 — Backend stack: NestJS (Node.js + TypeScript)

> **Revision history**
> - **v1.0.1 (2026-08-11):** Removed stale references to the discarded Next.js frontend and Zod (audit `20260811-architecture-audit.md`, finding M-2). The frontend is Vite + React (ADR-02 v2) and validation is `class-validator` (ADR-14).
> - v1.0.0 (2026-08-10): Original decision.

## Context

Wendy Planner's MVP needs a backend that supports:

- 6 bounded contexts (Identity, Weddings, Guests, Invitations, Photos, Audit) in a single deployable unit.
- REST/JSON API for the Admin/WP dashboard (Web App) and a small set of public endpoints for guests and couples.
- JWT-based auth, RBAC, presigned S3 URLs, scheduled jobs (photo lifecycle).
- Rapid delivery by a single backend developer within 6 sprints.
- Future evolution toward multi-tenancy enforcement, additional modules (budget, vendors), and additional languages.

The kickoff (`1-management/1.1-kickoff/kickoff.md` §Restricciones técnicas) restricts the backend stack to **Java (Spring Boot 4 + GraalVM)** or **Node.js (NestJS 11.1.29)**. The team's existing familiarity with both is acknowledged.

## Options Considered

### Option A — Spring Boot 4 + GraalVM (Java)

- **Pros**
  - Mature, battle-tested ecosystem; excellent observability (Micrometer, Actuator).
  - GraalVM native compilation offers fast cold starts and low memory footprint.
  - Strong typing; large talent pool.
  - Good fit for complex transactional logic (Spring's transaction management).
- **Cons**
  - Steeper learning curve for the assigned developer if not deeply familiar.
  - More boilerplate (DTOs, configs, dependency wiring).
  - Slower iteration speed for small, evolving features.
  - Native image build pipeline is more complex.
  - Adds a second language to the stack (Java in BE, TypeScript in FE) — duplication of type definitions and validation logic.

### Option B — NestJS (Node.js + TypeScript) — **Selected**

- **Pros**
  - **Single language (TypeScript) end-to-end** with the Vite + React frontend (ADR-02). Shared types and shared validation DTOs (`class-validator` — see ADR-14) via `@wendy/contracts`; shared IDE experience.
  - Decorator-based, opinionated structure maps well to bounded contexts (`@Module` per context).
  - Built-in support for guards (RBAC), interceptors (audit logging), pipes (validation), and OpenAPI generation.
  - Fast iteration cycle (`tsc --watch`, hot reload).
  - Mature ecosystem: Prisma, Passport, BullMQ (if needed later), `@nestjs/swagger`.
  - Low operational overhead: small Docker image, fast start.
- **Cons**
  - Single-threaded Node.js runtime; CPU-bound work is not ideal (not relevant for this workload).
  - The team is smaller and less specialized in Node than in Java — but the assigned developer is familiar with NestJS 11.
  - Some advanced patterns (background workers, complex schedulers) are easier in Spring.

### Option C — Keep options open / spike-driven

- Run a 2-day spike in sprint 1 with both stacks and pick the one that delivers a thin vertical slice first.
- **Rejected for MVP**: the kickoff already requires a decision at the start of the project; deferring would cost a sprint of velocity. A short follow-up validation spike is still recommended (see §Consequences).

## Decision

**Adopt NestJS (Node.js 22 LTS + TypeScript 5.x) as the backend stack for the MVP.**

Key sub-decisions bundled with this ADR:

- **ORM:** Prisma 5 with PostgreSQL.
- **Validation:** `class-validator` + `class-transformer` + NestJS `ValidationPipe` — see [ADR-14](adr-14-validation-class-validator.md). DTO classes live in a shared `@wendy/contracts` package consumed by the Web App.
- **Auth framework:** `@nestjs/passport` + `passport-jwt` (see [ADR-15](adr-15-auth-framework-passport.md)); passwords hashed with `bcrypt` (cost 12). RS256 signing, JWKS published at `/.well-known/jwks.json`; full URL contract and password semantics in [ADR-05](adr-05-auth-jwt-bcrypt.md).
- **API docs:** `@nestjs/swagger` generating OpenAPI 3 (using the same DTO classes).
- **Logging:** `nestjs-pino` with structured JSON to stdout.
- **Health checks:** `@nestjs/terminus` with custom Prisma and S3 indicators (see [ADR-17](adr-17-health-checks-terminus.md)).

## Consequences

### Positive

- One language across FE and BE → faster onboarding, fewer integration bugs.
- Smaller context-switch cost for the single backend developer who is also reviewing frontend PRs.
- First vertical slice (auth + wedding CRUD) can be ready by end of sprint 1.

### Negative / Trade-offs

- We accept slower performance for CPU-bound work in exchange for development speed. Acceptable for ~10 WPs and ~100 weddings/year.
- The team commits to the Node ecosystem for the foreseeable future. Migrating to Spring later is feasible but non-trivial.

### Follow-up actions

- [ ] Run a 2-day spike in sprint 1 to validate NestJS + Prisma against the photo upload flow (the most I/O-heavy part of the system) [owner:: backend] [priority:: high]
- [ ] Confirm stack decision in writing with Vineyards before sprint 2 starts [owner:: tech-lead]
- [ ] Set up the shared `@wendy/contracts` package skeleton in monorepo [owner:: backend] [priority:: high]

### Revisit when

- The team grows past 3 backend developers (cohesion benefits of one language diminish).
- A CPU-bound workload (e.g. on-the-fly video transcoding) becomes a requirement.
- A new client engagement requires a different language baseline.
