---
title: "Specification: JWT auth (RS256+JWKS), passport-jwt RBAC, and Terminus health checks"
date: 2026-08-13
type: specification
scope: internal
story-id: "ARC-013+ARC-015+ARC-036"
status: approved
version: 2.0.0
updated: 2026-08-13
revision-history:
  - v2.0.0 (2026-08-13): pragmatic re-scope. Removed in-memory refresh-token rotation, password hasher, LocalAuthService, discovery doc, and S3Config — those belong to ARC-014 (OAuth endpoints), ARC-017 (WP onboarding), and ARC-030 (S3 readiness). Kept the JWKS endpoint and the type of cookie contract that ARC-014 will set.
  - v1.0.0 (2026-08-13): original draft.
---

# JWT auth (RS256+JWKS), passport-jwt RBAC, and Terminus health checks

> **Status: Approved (yolo mode — auto-approved by delivery team to unblock Sprint 1 closure)**

## User Stories

`ARC-013` **Implement JWT auth (RS256) + JWKS** — As the delivery team, we need the API to issue and verify JWTs signed with RS256 (private key in Secrets Manager, public key served at `/.well-known/jwks.json`), with 15-minute access tokens and 7-day refresh tokens set as `HttpOnly; Secure; SameSite=Lax` cookies. Per ADR-05 and audit H-1. [groupBy:: arq] [priority:: 3]

`ARC-015` **Implement passport-jwt strategy with RBAC guards** — As the delivery team, we need `@nestjs/passport` + `passport-jwt` wired with `JwtAuthGuard` and `RolesGuard` (`Administrator`, `WeddingPlanner`) reading the role from the JWT payload, so that protected controllers can declare guards and roles declaratively. Per ADR-15. [groupBy:: arq] [priority:: 3]

`ARC-036` **Implement health checks (Terminus)** — As the platform operations layer, we need `/health/live` (process is up) and `/health/ready` (Prisma reachable, memory and disk OK) exposed via `@nestjs/terminus`, so the ALB can drain unhealthy tasks and ops can tell DB outages from app crashes. Per ADR-17. [groupBy:: arq] [priority:: 3]

## Context

After ARC-001/002/003 (monorepo, ESLint, NestJS skeleton) and ARC-004/005/008 (Web App, `@wendy/contracts`, Prisma `users` migration) shipped, the API has a runnable shell with a `users` table but no authentication and no real health checks. Sprint 1 user stories US-001 (onboard a new WP) and US-006 (confirm my identity) cannot land without an auth layer, and the API cannot be deployed to ECS with confidence because the ALB has only stubs to probe.

This spec groups three closely-related infrastructure stories because they share the same deployability concern: **the API must be secure and observable as a single unit at the end of Sprint 1**. The deliverables are real JWT issuance + verification, real Passport-backed RBAC, and real Terminus-backed health checks.

## Out of scope (deferred to their owning stories)

| Deferred to | Story | What is deferred |
|---|---|---|
| ARC-014 | Implement OIDC-style auth endpoints | `/oauth/token`, `/oauth/refresh`, `/oauth/revoke`, `/oauth/userinfo`, `/oauth/logout`, `/oauth/user/password`, `/.well-known/wendy-configuration`. ARC-014 will consume the JWT primitives this spec ships. |
| ARC-017 | Implement WP onboarding | bcrypt cost-12 password hashing, `LocalAuthService`, `POST /api/v1/wedding-planners`. |
| ARC-030 | Implement Photo Storage bounded context | S3 readiness check, S3Config. The Sprint 1 readiness probe checks Prisma + memory + disk only. |
| ARC-037 | Implement Audit module | Audit event persistence on credential operations. |
| Future | Multi-tenancy | Tenant-scoped repository enforcement (application-layer filtering by `req.user.tenantId`). The `tenantId` rides in the JWT, but no queries exist yet to enforce it. |

> **Pragmatic boundary:** ARC-013/015/036 ship the **plumbing** that ARC-014/017/030 will consume. We are not implementing the full OIDC/OAuth standard — we are positioning the platform for a future IdP swap (per ADR-05 §Why the OIDC-style URLs) and giving the application layer a clean auth context.

## Dependencies

| Story | Type | Description |
|---|---|---|
| `ARC-003` Bootstrap NestJS skeleton | Requires | The `modules/identity/` empty bounded context, `shared/guards/` empty folder, `shared/prisma/` with `PrismaService`, and `config/` with `EnvConfig` / `DatabaseConfig`. |
| `ARC-008` Initialize Prisma `users` migration | Requires | The `users` table exists with `id`, `tenant_id`, `email`, `password_hash`, `role`, `is_disabled`. The JWT carries `sub` (user id), `tenantId`, and `role` from this row. |
| `ARC-014` Implement OIDC-style auth endpoints | Required by | Consumes the JWT issuance/verification primitives from ARC-013. |
| `ARC-017` Implement WP onboarding | Required by | Uses bcrypt for the password hash field; ARC-013 does not own password hashing. |
| `ARC-030` Implement Photo Storage | Required by | Will add the S3 readiness indicator to `/health/ready`. |
| `OPS-004` Provision Secrets Manager | Requires | The RS256 key pair (`jwt/signing-keys`) must exist so the API can boot. |

## Rules & Constraints

### ARC-013 — JWT issuance & JWKS

- **Rule 1 — RS256 with asymmetric key pair**: The API signs tokens with **RS256** (pinned, not configurable). The private key is loaded at boot from `JWT_PRIVATE_KEY_PEM` (env var, sourced from Secrets Manager). The public key is derived from the same PEM and cached for the JWKS endpoint. The algorithm is documented in the typed config and **never** read from env vars at runtime.

- **Rule 2 — JWKS at `/.well-known/jwks.json`**: `GET /.well-known/jwks.json` returns a JWKS document with the public key in RFC 7517 shape: `{"keys": [{ "kty": "RSA", "kid": "<stable-key-id>", "use": "sig", "alg": "RS256", "n": "<base64url-modulus>", "e": "AQAB" }]}`. The endpoint is unauthenticated and sets `Cache-Control: public, max-age=300`. The `kid` is a stable UUID stored with the private key in Secrets Manager, so rotated keys get a new `kid` and the JWKS advertises both.

- **Rule 3 — Access token shape and lifetime**: Access tokens carry `{ sub: <UserId>, role: 'Administrator' | 'WeddingPlanner', tenantId: <TenantId>, iat, exp, jti, iss: 'wendy-planner', aud: 'wendy' }`. Lifetime is **15 minutes**. Tokens are signed with a `kid` header that matches the in-memory public key.

- **Rule 4 — Refresh token shape and cookie contract**: Refresh tokens carry the same claims but with `aud: 'refresh'` and `exp: now + 7d`. They are **set as an `HttpOnly; Secure; SameSite=Lax` cookie named `wendy_refresh`** by ARC-014's `/oauth/token` endpoint. This spec documents the contract; ARC-014 implements the cookie-setting logic. The cookie lifetime is 7 days, matching the token's `exp`.

- **Rule 5 — Typed config**: A JWT typed config class validates the env vars at boot (`JWT_PRIVATE_KEY_PEM`, `JWT_KEY_ID`, `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_ACCESS_TOKEN_TTL_SECONDS`, `JWT_REFRESH_TOKEN_TTL_SECONDS`). Missing or invalid values throw a clear error before the API can serve traffic. Defaults: issuer `wendy-planner`, audience `wendy`, access TTL 900, refresh TTL 604800.

- **Rule 6 — Verification rules**: Tokens are verified with the public key, checking signature, expiration, issuer, and audience. The signing algorithm is restricted to `RS256` (defense against algorithm confusion attacks). Verification failures return `401 Unauthorized` with the platform's standard error envelope.

- **Rule 7 — No JWT secret in environment defaults**: The repo's `.env.example` documents the env vars but never ships a real key. Local dev uses `openssl genrsa -out jwt-private.pem 2048` to generate a keypair. CI never contains a real key. The dev runbook (delivered by OPS-024) documents the local key generation.

### ARC-015 — Passport JWT strategy + RBAC guards

- **Rule 8 — Passport JWT strategy**: A JWT strategy using `@nestjs/passport` + `passport-jwt` extracts the JWT from the `Authorization: Bearer ...` header, verifies it using the public key, and populates `req.user` with `{ id, role, tenantId }`. The strategy is the canonical NestJS recipe (per ADR-15).

- **Rule 9 — `JwtAuthGuard`**: A thin wrapper around `AuthGuard('jwt')` is provided. Routes declared with `@UseGuards(JwtAuthGuard)` require a valid JWT. Missing/invalid tokens return `401 Unauthorized`.

- **Rule 10 — `RolesGuard` and `@Roles` decorator**: A `RolesGuard` reads a `@Roles(...)` decorator from the route metadata and checks that `req.user.role` is in the allowed list. Roles are `Administrator` and `WeddingPlanner`. Role mismatches return `403 Forbidden`. The role is never read from the request body — only from the JWT.

- **Rule 11 — `@CurrentUser` decorator**: A parameter decorator exposes `req.user` to controller handlers as `{ id, role, tenantId }`.

- **Rule 12 — `@Public` opt-out**: A `@Public()` decorator on a handler or controller marks the endpoint as unauthenticated. The global `JwtAuthGuard` honors this metadata. The auth/health endpoints (`/health/*`, `/.well-known/*`) MUST be marked `@Public()` so the ALB and orchestrators can probe them without credentials.

- **Rule 13 — Global guard enabled by default**: The `JwtAuthGuard` is registered globally so every endpoint requires a JWT by default; routes opt out with `@Public()`. The alternative (opt-in by routes) was rejected because it is too easy to forget on a new endpoint and security regressions are silent.

### ARC-036 — Health checks (Terminus)

- **Rule 14 — Two endpoints, two purposes**: `GET /health/live` always returns 200 as long as the Node process is responsive. The handler runs a memory check (`heap ≤ 200 MB`, `rss ≤ 300 MB`). `GET /health/ready` checks Prisma, memory, and disk; on any failure it returns 503.

- **Rule 15 — Prisma indicator**: A custom `PrismaHealthIndicator` runs `SELECT 1` against the Prisma client with a 1-second timeout. On success, the indicator is healthy; on failure or timeout, it returns unhealthy.

- **Rule 16 — Memory and disk indicators**: Memory heap (≤ 200 MB) and RSS (≤ 300 MB) are checked on both endpoints. Disk storage (≤ 90% used, on `/`) is checked on `/health/ready`.

- **Rule 17 — Unauthenticated endpoints**: `/health/*` endpoints are public (no JWT, no API key). The ALB security group is the only network-level restriction. The response body reveals only `status: 'up' | 'down'` and indicator names (`memory_heap`, `database`, `disk`); no secrets are leaked.

- **Rule 18 — ALB target group probe**: The ALB target group health check is `GET /health/ready` with interval 30 s, timeout 5 s, healthy threshold 2, unhealthy threshold 3. `/health/live` is used by the container's liveness probe (not the ALB).

### Cross-cutting

- **Rule 19 — One verification per spec**: The three stories share one functional spec and one implementation pass. The verification step at the end reviews all three. A reviewer opening the repo can find the auth layer working end-to-end (`/.well-known/jwks.json` returns a key, the JWT verifies against the public key, `/health/ready` returns 200) and the Sprint 1 backlog is ready to consume the auth layer.

> ⚠️ Assumption — Refresh-token rotation / revocation is **not** implemented in this spec. The refresh-token cookie contract is documented in Rule 4 but rotation policy is owned by ARC-014. If the team needs rotation before ARC-014, that is a separate spec.

> ⚠️ Assumption — Tenant scoping is **not** enforced in this spec. The `tenantId` rides in the JWT (Rule 3) and is exposed via `@CurrentUser` (Rule 11), but no repository filtering exists yet because the bounded-context queries haven't been written. This is a follow-up tracked under ARC-011 / Sprint 2.

## User Experience Notes

Not applicable in the user-facing sense — these are infrastructure stories. The "user experience" is the developer experience:

- A developer generating a local RS256 key pair with `openssl genrsa -out jwt-private.pem 2048` and exporting `JWT_PRIVATE_KEY_PEM` and `JWT_KEY_ID` can boot the API in < 30 s.
- `curl http://localhost:3000/health/live` returns 200 with the Terminus envelope.
- `curl http://localhost:3000/health/ready` returns 200 when Postgres is up; returns 503 with the failing indicator in the body when it is not.
- `curl http://localhost:3000/.well-known/jwks.json` returns a JWKS document with one entry (the local `kid`).
- A unit test that signs a JWT with the API's private key and verifies it via the API's public key returns the original payload.
- A unit test that signs a JWT with the wrong audience/issuer fails verification with the standard 401 envelope.
- A unit test that calls `RolesGuard` with `req.user.role = 'WeddingPlanner'` and the route's `@Roles('Administrator')` returns 403.

No user-facing UI, no form validation, no i18n user-facing catalogs are in scope here. The login screen and the WP onboarding form arrive in Sprint 2 (ARC-017, US-001, US-006).
