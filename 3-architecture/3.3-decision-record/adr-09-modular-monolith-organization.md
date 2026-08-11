---
title: "ADR-09 — Modular monolith organization: NestJS modules per bounded context"
id: adr-09
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 1.0.0
updated: 2026-08-10
---

# ADR-09 — Modular monolith organization: NestJS modules per bounded context

## Context

Wendy Planner's backend is a single deployable unit (TC-1: modular monolith). To avoid the "big ball of mud" anti-pattern, we must organize the code so that:

- Each bounded context has a clear, isolated module with its own controllers, services, repositories, and DTOs.
- Cross-context dependencies are explicit and one-directional.
- Adding a new bounded context (e.g. budget, vendors) in a later iteration does not require restructuring existing modules.
- A new developer can locate a feature by bounded context name in ≤ 5 minutes.

## Options Considered

### Option A — Flat structure (controllers, services, models folders)

- **Pros**
  - Easy to start.
- **Cons**
  - As the codebase grows, the lack of clear boundaries makes refactoring risky.
  - No enforced isolation between concerns.

### Option B — Vertical slices (feature folders)

- **Pros**
  - Each feature is a self-contained folder.
- **Cons**
  - In NestJS, this clashes with the framework's `@Module` convention.
  - Cross-cutting infrastructure (e.g. a `PhotoStorageService` used by multiple features) does not have a clear home.

### Option C — NestJS modules per bounded context — **Selected**

- **Pros**
  - **Native to NestJS** — each bounded context is a `@Module()` with its own controllers, providers, and exports.
  - The framework enforces the dependency graph.
  - Easy to test in isolation.
  - Clear path to future extraction: if a context outgrows the monolith, it can be lifted into its own service without changing the public API contract.
  - Mirrors the glossary and the bounded contexts identified in §5.1.
- **Cons**
  - Slight overhead of declaring modules.
  - Cross-context communication goes through published APIs (services or events), which adds a thin layer of indirection.

### Option D — DDD tactical patterns (aggregate, repository, domain event) inside each module

- **Pros**
  - Strong domain modeling.
- **Cons**
  - Overkill for the MVP's domain size; the team would spend cycles on patterns instead of features.

## Decision

**Adopt NestJS modules per bounded context as the top-level organization of the backend. The bounded contexts are: Identity & Access, Wedding Management, Guest Management, Invitation, Photo Storage, and Audit.**

**Concrete folder structure (illustrative; the authoritative monorepo layout lives in ADR-12):**

```
apps/
  api/                          # NestJS application
    src/
      app.module.ts
      main.ts
      common/                   # cross-cutting: guards, pipes, interceptors
      modules/
        identity/               # Identity & Access bounded context
          identity.module.ts
          auth/
          users/
          tokens/
        weddings/               # Wedding Management
        guests/                 # Guest Management
        invitation/             # Invitation (public endpoints, RSVP)
        photos/                 # Photo Storage (presigned URLs, lifecycle)
        audit/                  # Audit (event log)
      infra/                    # adapters: prisma, s3, secrets, mail
packages/
  contracts/                    # shared Zod schemas + TS types (consumed by Web)
```

> The monorepo strategy (one repo vs many) is decided separately in [ADR-12](adr-12-monorepo-pnpm-workspaces.md). This ADR focuses on the **logical** organization of the backend; ADR-12 focuses on the **physical** repository layout.

**Cross-context communication:**

- **Synchronous** (rare): a context exposes a service; the consumer depends on the service via a module import.
- **Asynchronous** (preferred for cross-cutting events): a context publishes domain events to a thin in-process event bus (NestJS EventEmitter). The Audit module subscribes to all relevant events.

**Future extraction path:**

- Each module exposes its API as a controller (HTTP) and a service (TypeScript).
- If a context is later extracted into its own service, the HTTP controller moves with it; the rest of the monolith switches from importing the TypeScript service to calling the HTTP endpoint.

## Consequences

### Positive

- A new developer can navigate the codebase by bounded context.
- The module graph is the de-facto dependency graph, which is auditable.
- Future evolution (multi-tenancy, new modules) is additive.

### Negative / Trade-offs

- Slight framework overhead.
- Cross-context events use an in-process bus; if a context is later extracted, those events must be moved to an external broker.

### Follow-up actions

- [ ] Generate the NestJS skeleton with the module structure above [owner:: backend] [priority:: high]
- [ ] Set up the `@wendy/contracts` package skeleton [owner:: backend] [priority:: high]
- [ ] Document the cross-context communication rules in the backend blueprint [owner:: backend] [priority:: high]

### Revisit when

- A context is actually extracted into its own service.
- The team grows past 3 backend developers.
