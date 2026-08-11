---
title: "ADR-13 — ID generation strategy: NanoId (10 chars, URL-safe)"
id: adr-13
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 1.0.0
updated: 2026-08-10
---

# ADR-13 — ID generation strategy: NanoId (10 chars, URL-safe)

## Context

Wendy Planner needs stable, unique identifiers for every entity the system manages (users, weddings, guests, RSVPs, photos, audit events, invitation tokens, photo-album tokens). These IDs are:

- Used as **primary keys** in the database.
- Embedded in **URLs** (e.g. `/i/{token}`, `/c/{token}`, `/admin/weddings/{id}`).
- Logged in audit trails, error reports, and CloudWatch.
- Shared **out-of-band** with guests (the WP copies invitation links into WhatsApp, SMS, email).

Requirements:

- **URL-safe** (no escaping required).
- **Short** enough to be human-friendly when pasted into a chat (~10 characters is comfortable).
- **Sufficiently collision-resistant** at Wendy Planner's volume (current target: ~10 WPs × ~7 weddings/year × ~200 entities/wedding ≈ 14K entities/year; cap at ~100K entities/year for the next 5 years).
- **Hardware-random** so IDs are unpredictable (not strictly required for non-secret IDs, but a free win for token-like IDs).
- **Ecosystem-friendly**: works in both the NestJS API (Node 22) and the Vite + React Web App (browser); ideally the same library on both sides so an ID minted in the FE matches what the BE expects.

## Decision

**Adopt [NanoId](https://github.com/ai/nanoid) (`nanoid` npm package) for all entity IDs.**

**Concrete configuration:**

- **Default ID size:** **10 characters**.
- **Default alphabet:** NanoId's built-in URL-safe alphabet `A-Za-z0-9_-` (64 symbols).
- **API for entities:** `nanoid(10)` everywhere — on the BE for primary keys, on the FE when minting temporary IDs for optimistic UI.
- **Branded TypeScript types** for compile-time safety:
  ```ts
  type WeddingId = string & { readonly __brand: 'WeddingId' }
  // minted as: nanoid<WeddingId>() or cast at the boundary
  ```
- **Library version:** `nanoid@^5` (current major as of 2026).
- **Usage on both sides:** the same `nanoid` package is used in `apps/api/` and `apps/web/`. The browser bundle is 118 bytes (minified + brotlied) — negligible.

**Randomness:** NanoId uses the platform's hardware random generator (`crypto` in Node, `Web Crypto API` in browsers) by default. We do not opt into `nanoid/non-secure` anywhere.

**Collision math (for the record):**

| Property | Value |
|----------|-------|
| Alphabet size | 64 symbols (`A-Za-z0-9_-`) |
| ID length | 10 |
| Total keyspace | 64^10 = 1.15 × 10^18 ≈ 2^60 |
| Wendy Planner 5-year peak volume | ~500K entities |
| 1% collision probability | at ~1.1 trillion IDs (per the [Nano ID collision calculator](https://zelark.github.io/nano-id-cc/)) |
| 50% collision probability | at ~10 trillion IDs |

We are **8 orders of magnitude** below the 1% collision threshold at our 5-year peak. The probability of a collision in Wendy Planner's lifetime is, for practical purposes, zero.

**Sorting (acknowledging the trade-off):**

NanoIds are **not sortable by themselves** — the random bits give no monotonicity. We sort by `created_at` in all queries that need chronological ordering. We will:

- Include a `created_at timestamptz NOT NULL DEFAULT now()` column on every entity table.
- Index `created_at` for every entity (descending for "most recent first" listings).
- Always `ORDER BY created_at DESC, id ASC` for deterministic ordering with stable tie-breaking.

This pattern is also better than sortable IDs in one subtle way: it reflects **business time**, not generation time. If a record is back-dated (e.g. a guest added before the wedding but entered later), `created_at` still reflects when the row was created — which is what we usually want.

**Where IDs appear in URLs:**

| URL pattern | ID type | Length |
|-------------|---------|--------|
| `/i/{token}` (guest invitation) | JWT (signed, not NanoId) — see ADR-05/ADR-10 | ~150 chars |
| `/c/{token}` (couple photo album) | JWT | ~150 chars |
| `/admin/weddings/{id}` | WeddingId (NanoId) | 10 chars |
| `/admin/guests/{id}` | GuestId (NanoId) | 10 chars |

Invitation and photo-album "tokens" stay as signed JWTs (they need an expiry and claims). Internal entity IDs are NanoIds.

## Options Considered

### Option A — UUID v4 (e.g. `crypto.randomUUID()`) — **Rejected**

- **Pros**
  - Standard, built into Node 22 and modern browsers.
  - 122 random bits → 36 chars including dashes (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
  - No external dependency.
- **Cons**
  - **36 chars is unfriendly** in URLs, in chat messages, and in logs.
  - About 50% slower than NanoId in benchmarks.
  - The 36-char overhead is unnecessary for our collision target.

### Option B — UUID v7 (time-ordered) — **Rejected**

- **Pros**
  - **Sortable by ID alone** (first 48 bits are a millisecond timestamp).
  - 36 chars (same as v4).
  - Becoming the recommended UUID for new systems.
- **Cons**
  - Still 36 chars; same URL-friendliness problem.
  - Reveals creation time in the ID, which is a minor information leak (we don't strictly care, but it's a code smell).
  - Slightly less random bits than v4 (74 random bits vs 122) for the same total length.

### Option C — ULID — **Rejected**

- **Pros**
  - **Sortable** (first 48 bits are timestamp).
  - 26 chars (vs 36 for UUID).
  - URL-safe (Crockford base32).
- **Cons**
  - **26 chars is still 2.6× longer than 10 chars** for our needs.
  - Smaller community than NanoId; less tooling.
  - Less random bits than NanoId at the same length.

### Option D — NanoId (10 chars, URL-safe) — **Selected**

- **Pros**
  - **Shortest practical ID** (10 chars) for our collision target.
  - **URL-safe alphabet** (`A-Za-z0-9_-`) — no escaping needed anywhere.
  - **Fastest** of all options in independent benchmarks (~50% faster than `crypto.randomUUID`).
  - **Hardware random** by default (secure).
  - **Tiny footprint**: 118 bytes minified + brotlied; no dependencies.
  - **Same library on FE and BE** → IDs minted in the browser look the same as IDs minted on the server.
  - **Brand-able** with TypeScript (`nanoid<WeddingId>()`).
  - Mature, 27k+ stars, 20+ language ports.
- **Cons**
  - **Not sortable by ID** — mitigated by sorting on `created_at` (we already need this column anyway).
  - Smaller keyspace than UUID (60 bits vs 122) — still astronomical for our volume.

### Option E — Auto-incrementing integers — **Rejected**

- **Pros:** sortable, very compact, simple.
- **Cons:** leaks business metrics (count of records), makes sharding impossible, not URL-friendly when combined with multi-tenancy, terrible for distributed generation. **Hard pass.**

## Consequences

### Positive

- URLs are short and readable: `/admin/weddings/aB3xY9_zQ2`.
- WhatsApp previews of invitation links fit comfortably.
- Logs are easier to scan.
- ID generation is fast and uniform.
- The same library is used on FE and BE; IDs minted in the browser are valid server IDs.
- We never have to think about UUID formatting, dashes, or case sensitivity.

### Negative / Trade-offs

- We carry a `created_at` column on every entity (we would anyway for audit and sorting).
- Every query that lists entities orders by `created_at` (or `created_at DESC, id ASC` for stability). This is one extra column to index per table.
- Cannot rely on ID ordering for any business logic (must always use `created_at`).

### Follow-up actions

- [ ] Add `nanoid` to `apps/api/` and `apps/web/` `package.json` [owner:: backend] [priority:: high]
- [ ] Define branded ID types in `packages/contracts/src/ids.ts` (e.g. `WeddingId`, `GuestId`, `PhotoId`, `UserId`) [owner:: backend] [priority:: high]
- [ ] Add `created_at timestamptz NOT NULL DEFAULT now()` and a descending index to every entity table in `prisma/schema.prisma` [owner:: backend] [priority:: high]
- [ ] Standardize the order clause: `ORDER BY created_at DESC, id ASC` (documented in the backend blueprint) [owner:: backend] [priority:: high]
- [ ] Write a quick property-based test that confirms 100K generated NanoIds are unique within the test run [owner:: backend] [priority:: medium]

### Revisit when

- A new client engagement has different collision requirements (consider UUID v7).
- Multi-tenancy becomes per-tenant database (NanoId still works; no change needed).
- The volume grows by 6+ orders of magnitude (then move to longer IDs).
