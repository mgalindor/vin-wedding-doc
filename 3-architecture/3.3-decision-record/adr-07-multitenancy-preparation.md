---
title: "ADR-07 — Multi-tenancy preparation: tenant_id column, no RLS"
id: adr-07
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 1.0.0
updated: 2026-08-10
---

# ADR-07 — Multi-tenancy preparation: tenant_id column, no RLS

## Context

Wendy Planner will be operated by a single organization (Vineyards) in MVP, but the kickoff (TC-4) and project brief explicitly require the **schema to be prepared for multi-tenancy** from day one:

> "A `tenant_id` column is added to all relevant tables from day one, but row-level isolation is not enforced in the MVP."

The future state is one of:

- Multiple WPs in the same organization sharing the same deployment but isolated by tenant (e.g. different Vineyards sub-brands, or future acquisitions).
- Different Vineyards franchises operating in different countries.
- A SaaS offering to other wedding-planning organizations.

## Options Considered

### Option A — Single-tenant schema (no `tenant_id`)

- **Pros**
  - Simplest.
- **Cons**
  - Every later migration to multi-tenancy is a backfill of `tenant_id` plus a refactor of every query. High risk and high cost.

### Option B — `tenant_id` column from day one, no RLS — **Selected**

- **Pros**
  - **Cheap preparation**: the column is added to every relevant table; every insert and every query includes `tenant_id`.
  - No immediate complexity (no RLS policies, no schema-per-tenant).
  - The future migration to RLS or schema-per-tenant is a single, well-defined step.
- **Cons**
  - Developers must remember to filter by `tenant_id` in every query. We mitigate with code review and a guard at the repository layer.
  - A single-tenant deployment still carries the column, which is a small overhead.

### Option C — Schema-per-tenant

- **Pros**
  - Strong isolation.
  - Easy per-tenant backup/restore.
- **Cons**
  - Schema migrations must be applied to every tenant schema.
  - Application code is more complex (dynamic schema switching or a connection pool per tenant).
  - Overkill for MVP.

### Option D — Database-per-tenant

- **Pros**
  - Strongest isolation.
- **Cons**
  - Operational cost is too high for ~10 WPs and uncertain future demand.

## Decision

**Adopt Option B. Every relevant table includes a `tenant_id` column (`UUID NOT NULL`). Every repository method takes `tenantId` as an explicit argument. Every Prisma query is generated with a `where: { tenantId, ... }` clause. No row-level security policies are configured in MVP.**

For MVP, the seed creates a single tenant `vineyards` (UUID) used everywhere. The application's `currentTenant()` helper returns this constant.

**Tables that include `tenant_id`:**

- `users`
- `weddings`
- `guest_groups`
- `guests`
- `invitation_tokens`
- `rsvps`
- `photos`
- `audit_events`

**Tables that do NOT include `tenant_id`:**

- Reference / lookup tables that are inherently cross-tenant (none exist in MVP; if added later, they are explicitly excluded).
- S3 objects — isolation is by prefix `s3://wp-photos-prod/{tenantId}/`.

**Repository convention (illustrative):**

```ts
class WeddingRepository {
  findById(tenantId: string, id: string): Promise<Wedding | null>
  // No method accepts a weddingId without also accepting a tenantId.
}
```

## Consequences

### Positive

- The future multi-tenancy rollout is a **configuration change**, not a code change: enable RLS policies, add a Prisma middleware that injects `tenantId` from the JWT.
- The application code is already correctly scoped, so a misconfigured environment cannot accidentally leak data across tenants in MVP either.

### Negative / Trade-offs

- A small amount of code overhead in the repository layer.
- We rely on code review to enforce the pattern; we mitigate with a small integration test suite that asserts "WP A cannot read WP B's data" (in MVP, with a single tenant, the test simulates two tenants).

### Follow-up actions

- [ ] Document the `tenant_id` convention in the backend blueprint [owner:: backend] [priority:: high]
- [ ] Add a Prisma middleware that injects `tenantId` on every query (defense in depth) [owner:: backend] [priority:: medium]
- [ ] Add an integration test that simulates two tenants and asserts isolation [owner:: backend] [priority:: high]

### Revisit when

- A second tenant is actually onboarded.
- Regulatory pressure (data residency) requires per-tenant databases.
