---
title: "ADR-03 — Database: PostgreSQL 15 on AWS RDS"
id: adr-03
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 1.0.1
updated: 2026-08-11
---

# ADR-03 — Database: PostgreSQL 15 on AWS RDS

> **Revision history**
> - **v1.0.1 (2026-08-11):** Removed a stale reference to the discarded Next.js frontend (audit `20260811-architecture-audit.md`, finding M-2).
> - v1.0.0 (2026-08-10): Original decision.

## Context

Wendy Planner needs a single OLTP database that:

- Stores users, weddings, guests, RSVPs, audit events, and template data.
- Supports flexible per-template data (the 14 invitation modules produce varying shapes).
- Can carry a `tenant_id` column on every relevant table to prepare for future multi-tenancy.
- Runs as a managed service to fit a 2-person team's operational capacity.
- Has predictable cost for ~10 WPs and ~100 weddings/year.

## Options Considered

### Option A — PostgreSQL on AWS RDS — **Selected**

- **Pros**
  - Mature, well-supported in the TypeScript/NestJS ecosystem (Prisma, TypeORM) and in every major backend stack.
  - JSONB columns for flexible template data without sacrificing relational integrity.
  - Native `gen_random_uuid()`, partial indexes, and rich query planner.
  - AWS RDS handles backups, patching, and failover (Multi-AZ when needed).
  - Predictable cost at the `db.t4g.micro` size for MVP.
  - Easy migration path to row-level security (RLS) for multi-tenancy later.
- **Cons**
  - Slightly more expensive than self-hosted on EC2 at the same size, but operational cost is dramatically lower.

### Option B — MySQL on AWS RDS

- **Pros**
  - Similar managed-service story.
  - Some teams are more familiar.
- **Cons**
  - Weaker JSON story (no JSONB equivalent).
  - Slightly less idiomatic TypeScript ORM support (Prisma's MySQL feature set lags PostgreSQL).

### Option C — MongoDB (Atlas)

- **Pros**
  - Native JSON storage; flexible schemas.
  - Good fit if the data were truly document-shaped.
- **Cons**
  - Relational data (users ↔ weddings ↔ guests ↔ RSVPs ↔ audit) is the dominant shape; document modeling adds friction.
  - Transactions across documents are weaker and more expensive.
  - Multi-tenancy preparation is messier.

### Option D — DynamoDB

- **Pros**
  - Auto-scaling; very low operational overhead.
- **Cons**
  - Access patterns must be designed in advance; queries beyond the primary key are awkward.
  - Cost predictability is harder.
  - Relational joins (the bulk of our queries) require multiple round-trips.

## Decision

**Adopt PostgreSQL 15 on AWS RDS (db.t4g.micro, 20 GB gp3) for the MVP.**

- **Encoding:** UTF-8.
- **Collation:** default `en_US.UTF-8` for MVP.
- **Backups:** automated, 7-day retention; final backup kept 90 days.
- **Encryption at rest:** AWS-managed KMS key.
- **TLS in transit:** required (enforced by the connection string).
- **Connection pooling:** RDS Proxy when multi-AZ is enabled (deferred to a later iteration).

## Consequences

### Positive

- The data model fits the relational shape; JSONB columns handle the variability of per-template data.
- Prisma generates type-safe clients for NestJS and (via the shared `@wendy/contracts` package) types in the Web App.
- Multi-tenancy preparation is a one-column-per-table change, documented in AD-07.

### Negative / Trade-offs

- We accept the cost of a managed Postgres over a cheaper self-hosted option in exchange for operational simplicity.
- Vertical scaling has hard limits (storage is auto-growing up to a configurable cap, but compute does not scale beyond a single instance until we enable Multi-AZ + read replicas).

### Follow-up actions

- [ ] Provision a `db.t4g.micro` instance per environment (dev via local docker, staging + prod on RDS) [owner:: backend] [priority:: high]
- [ ] Set up automated daily logical backups to S3 (`pg_dump`) for long-term retention [owner:: backend] [priority:: medium]
- [ ] Document the restore runbook (RTO ≤ 4h, RPO ≤ 1h) [owner:: backend] [priority:: high]

### Revisit when

- The workload grows to require read replicas or write sharding.
- Multi-tenancy enforcement moves from "schema prep" to "policy enforcement" (consider RLS or schema-per-tenant).
