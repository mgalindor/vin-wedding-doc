---
title: "Technical Specification — ARC-013+ARC-015+ARC-036: JWT auth (RS256+JWKS), passport-jwt RBAC, and Terminus health checks"
date: 2026-08-13
type: specification
scope: internal
story-id: "ARC-013+ARC-015+ARC-036"
status: approved
version: 2.0.0
updated: 2026-08-13
revision-history:
  - v2.0.0 (2026-08-13): pragmatic re-scope. Removed src paths, class names, and method names from the v1 doc (per the dev-create-tech-spec skill boundaries). Removed the in-memory revocation set, the discovery doc, the password hasher indirection, and the S3 readiness check — those belong to ARC-014/017/030. Kept three endpoints and the high-level wiring decisions.
  - v1.0.0 (2026-08-13): original draft.
layers:
  backend: true
  frontend: false
  mobile: false
---

# Technical Specification — ARC-013+ARC-015+ARC-036: JWT auth (RS256+JWKS), passport-jwt RBAC, and Terminus health checks

**Status: ✅ Approved (yolo mode — auto-approved to unblock Sprint 1 closure)**

---

## Scope

| Layer | Affected | Justification |
|---|---|---|
| Backend | Yes | All three stories operate on the API tier. The frontend consumes the auth layer via Sprint 2 stories (ARC-014, ARC-017, US-001–US-006); the Web blueprint is unaffected in this spec. |
| Frontend | No | The `(dashboard)` route group from ARC-004 stays unchanged. The token-refresh interceptor lands with ARC-014. |
| Mobile | No | Out of scope per architecture §2.1 (PC + tablet only). |

---

## Architecture References

| Document | Description |
|---|---|
| `3-architecture/3.3-decision-record/adr-05-auth-jwt-bcrypt.md` | RS256, JWKS, OIDC-style URLs, refresh-token cookie, bcrypt cost 12. |
| `3-architecture/3.3-decision-record/adr-15-auth-framework-passport.md` | `@nestjs/passport` + `passport-jwt`, canonical NestJS recipe, JWT strategy + guard pattern. |
| `3-architecture/3.3-decision-record/adr-17-health-checks-terminus.md` | `@nestjs/terminus`, two endpoints, Prisma + memory + disk indicators. |
| `3-architecture/3.3-decision-record/adr-16-configuration-typed-classes.md` | Typed config classes with `class-validator` + `static fromEnv()`. |
| `3-architecture/3.2-blueprints/backend-blueprint.md` §2-3 | Tech stack versions, scaffolding folders, `config + service` pattern. |
| `4-specs/20260813-arc-004-005-008-web-contracts-prisma-users/tech-spec.md` | The `users` table that the JWT issuer signs on behalf of. |

---

## Backend

### API Endpoints

#### Endpoint 1 — JWKS for public key discovery

```yaml
# GET /.well-known/jwks.json
security:
  type: public
response:
  keys: list[object]    # list, required, min items: 1
    kty: str            # str, required, enum: ["RSA"]
    kid: str            # str, required, UUID v4
    use: str            # str, required, enum: ["sig"]
    alg: str            # str, required, enum: ["RS256"]
    n: str              # str, required, base64url-encoded modulus
    e: str              # str, required, base64url-encoded exponent, default "AQAB"
```

Notes:

- The endpoint is unauthenticated. Anyone may fetch the public key to verify tokens.
- The response sets `Cache-Control: public, max-age=300`.
- The `kid` is the JWT key ID stored in Secrets Manager alongside the private key. Rotated keys get a new `kid` and the JWKS advertises both during the rotation grace period.

#### Endpoint 2 — Liveness probe

```yaml
# GET /health/live
security:
  type: public
response:
  status: str                       # str, required, enum: ["up", "error"]
  info: object                      # object, required, on success: { memory_heap: { status: "up" }, memory_rss: { status: "up" } }
  error: object                     # object, required, empty on success
  details: object                   # object, required, all indicator results
```

Notes:

- Terminus envelope. Status code is `200` on success, `503` on indicator failure.
- Indicators: memory heap (≤ 200 MB) and memory RSS (≤ 300 MB) only.

#### Endpoint 3 — Readiness probe

```yaml
# GET /health/ready
security:
  type: public
response:
  status: str                       # str, required, enum: ["up", "error"]
  info: object                      # object, required; on success: { database: { status: "up" }, memory_heap: { status: "up" }, memory_rss: { status: "up" }, disk: { status: "up" } }
  error: object                     # object, required; on failure: { <failing-indicator>: { status: "down", message: "<reason>" } }
  details: object                   # object, required, all indicator results
```

Notes:

- Terminus envelope. Status code is `200` on success, `503` on any indicator failure.
- Indicators: Prisma (`SELECT 1`, 1-second timeout), memory heap (≤ 200 MB), memory RSS (≤ 300 MB), disk storage (≤ 90% on `/`).
- **S3 readiness is deferred** to ARC-030 (photo storage) which owns the S3Config and the `S3HealthIndicator`. The Sprint 1 readiness probe does not check S3.

#### Endpoints deferred to ARC-014

The following endpoints are documented here for traceability but are not implemented in this spec:

| Endpoint | Method | Owner |
|---|---|---|
| `/oauth/token` | POST | ARC-014 |
| `/oauth/refresh` | POST | ARC-014 |
| `/oauth/revoke` | POST | ARC-014 |
| `/oauth/userinfo` | GET | ARC-014 |
| `/oauth/user/password` | PUT | ARC-014 |
| `/oauth/logout` | POST | ARC-014 |
| `/.well-known/wendy-configuration` | GET | ARC-014 |

ARC-014 will consume the JWT issuance/verification primitives this spec ships.

---

### Database Changes

No database changes in this spec. The `users` table from ARC-008 is the only table that the JWT issuer reads (offline at boot — the issuer does not read the DB to sign a token; it only knows the `sub`/`role`/`tenantId` from the request that triggered the issuance). ARC-014 will read the `users` table to authenticate credentials before calling the issuer.

---

### Events

No events are published or consumed in this spec. ARC-037 (Audit module) emits credential-related events in a later sprint.

---

### Third-party Integrations (Backend)

| Action | Service | Purpose | Authentication |
|---|---|---|---|
| USE | AWS Secrets Manager | RS256 private key, surfaced as `JWT_PRIVATE_KEY_PEM` env var | IAM task role (ECS) |
| USE | PostgreSQL 15 | Target of the Prisma readiness check (`SELECT 1`) | `DATABASE_URL` (ADR-16) |
| USE | `@nestjs/passport` + `passport-jwt` + `@nestjs/jwt` | JWT issuance and verification | local config |
| USE | `@nestjs/terminus` | Health checks | local config |

---

## Cross-cutting Concerns

### Security and Authorization

| Concern | Decision |
|---|---|
| Signing algorithm | RS256, pinned in code (not configurable via env) |
| Token storage (refresh) | `HttpOnly; Secure; SameSite=Lax` cookie named `wendy_refresh` (set by ARC-014) |
| Token storage (access) | Bearer token in `Authorization` header (canonical), single source of truth via Passport |
| Role model | `Administrator`, `WeddingPlanner`. Read from the JWT, never from the request body |
| Tenant scoping | `tenantId` rides in the JWT; repository-level enforcement is a follow-up (ARC-011 / Sprint 2) |
| Public endpoints | `/health/*` and `/.well-known/*` are bypassed by the global `JwtAuthGuard` via `@Public()` |
| Secret protection | `JWT_PRIVATE_KEY_PEM` is held in memory only; never logged in any form; never returned in any response |
| Algorithm confusion | The strategy restricts `algorithms: ['RS256']` to defend against `alg: none` and HMAC attacks |

### Configuration

Env vars read at boot via the typed-config pattern (ADR-16). The API refuses to boot if any required value is missing or invalid.

| Var | Required | Default | Notes |
|---|---|---|---|
| `JWT_PRIVATE_KEY_PEM` | Yes | — | Multi-line PEM. The dev runbook documents `openssl genrsa -out jwt-private.pem 2048` for local generation. |
| `JWT_KEY_ID` | Yes | — | UUID v4. Stable across rotations within the same key. |
| `JWT_ISSUER` | No | `wendy-planner` | `iss` claim. |
| `JWT_AUDIENCE` | No | `wendy` | `aud` claim. |
| `JWT_ACCESS_TOKEN_TTL_SECONDS` | No | `900` | Clamped to `[60, 3600]`. |
| `JWT_REFRESH_TOKEN_TTL_SECONDS` | No | `604800` | Clamped to `[3600, 2592000]`. |
| `DATABASE_URL` | Yes | — | Already wired by ARC-008. |
| `NODE_ENV`, `PORT`, `LOG_LEVEL` | Yes | — | Already wired by ARC-003. |

`.env.example` documents each new var with a placeholder. **No real keys are ever committed.**

### Error Handling

| Scenario | Expected behavior |
|---|---|
| `JWT_PRIVATE_KEY_PEM` missing or malformed | The typed config throws at boot with a clear `Invalid environment configuration: - JWT_PRIVATE_KEY_PEM: must be a string` message. Process exits. |
| `JsonWebTokenError` from verification (bad signature, wrong issuer, wrong audience) | `401 Unauthorized` with `{ code: "unauthorized", message: "Invalid or expired token", traceId: "<id>" }`. |
| `TokenExpiredError` | Same 401 envelope as above. |
| `RolesGuard` denial | `403 Forbidden` with `{ code: "forbidden", message: "Insufficient role", traceId: "<id>" }`. |
| Prisma readiness timeout | `503 Service Unavailable` with Terminus envelope; the failing indicator (`database`) is named in the body. |
| Memory or disk threshold exceeded | `503` with the failing indicator in the body. |
| Health endpoint hit during a deployment drain | `200` if the process is still healthy (the ALB drains before termination). |

### Observability

- `/health/ready` is the ALB target group probe (per OPS-011). The container's `HEALTHCHECK` directive uses `/health/live`.
- Successful JWT issuances log at `info` level with `jti` + `sub` (no token, no payload).
- Failed verifications log at `warn` level with the failure reason (`token expired`, `audience mismatch`, etc.) — no token contents.
- Sentry's `traceId` tag is propagated to the auth middleware per the cross-cutting observability rules (Sprint 5 wiring).

### Backend Blueprint Compliance

The new files follow `3-architecture/3.2-blueprints/backend-blueprint.md` §3 (Scaffolding) and §6 (Cross-cutting Concerns):

- The JWT typed config follows the `config + service` pattern in §3.
- The JWKS endpoint, the JWT strategy, and the Terminus health controller live in the bounded-context folders generated by ARC-003 (`modules/identity/`, `modules/health/`).
- The cross-cutting guards (`JwtAuthGuard`, `RolesGuard`, `@Public`, `@Roles`, `@CurrentUser`) live in `shared/`.
- ESLint boundary rules from ARC-002 are respected — no cross-app imports.

---

## Technical Risks and Constraints

| Risk / Constraint | Impact | Mitigation |
|---|---|---|
| Refresh-token rotation is not implemented in this spec. A revoked refresh token can still be used until its `exp`. | Medium (acceptable for Sprint 1) | Documented in the functional spec. ARC-014 will add rotation / revocation when it implements `/oauth/refresh`. |
| Tenant scoping is not enforced in queries. The `tenantId` rides in the JWT but no repository filtering exists yet. | Medium | Tracked under ARC-011 / Sprint 2. The `tenantId` is consistently available via `@CurrentUser` so the implementation is straightforward. |
| Memory and disk thresholds are guesses. The first production load test may reveal the right numbers. | Low | Thresholds are tunable constants in one place. The on-call runbook (OPS-029) documents how to retune. |
| The strategy restricts `algorithms: ['RS256']` to defend against algorithm confusion. Forgetting this property is a class of vulnerability. | High (security) | Verified by a unit test in the implementation. The test issues a token with `alg: 'HS256'` and asserts the strategy rejects it. |
| S3 readiness is not in Sprint 1. A working S3 outage will not flip `/health/ready` to 503. | Medium | Tracked under ARC-030. The readiness probe still catches DB outages and resource exhaustion. |
| RS256 key rotation is single-key in Sprint 1. A rotation requires a brief deployment that drops the old public key from the JWKS endpoint. | Low | Documented in the runbook. Dual-key rotation is a follow-up. |

---

## Open Questions

> All questions must be answered before this document moves to `approved` status. (Yolo mode: all answers are inferred and recorded below — reviewer should confirm or correct.)

- [x] **Q1.** Should the JWT issuer live in `shared/` or in `modules/identity/`? **Resolution:** Implementation choice — defer to the developer. The boundary rules enforce that no other module imports internals; the public exports are what matter. Either is fine.

- [x] **Q2.** Should `RolesGuard` be registered globally or per-route? **Resolution:** Globally, with `@Public()` opt-out. Per-route was rejected because forgetting the guard on a new endpoint is a silent security regression.

- [x] **Q3.** Should the S3 readiness indicator be added in Sprint 1? **Resolution:** No. ARC-030 owns the S3Config and the S3 indicator. The Sprint 1 probe checks Prisma + memory + disk.

- [x] **Q4.** Should refresh-token rotation be in this spec? **Resolution:** No. ARC-014 owns the `/oauth/refresh` endpoint and the rotation policy. This spec ships the JWT primitives (sign + verify + cookie contract); ARC-014 wires rotation on top.

- [x] **Q5.** Should the discovery doc (`/.well-known/wendy-configuration`) be in this spec? **Resolution:** No. ARC-014 owns it. The JWKS endpoint is sufficient for the auth layer; the discovery doc is for client SDK discovery.

- [x] **Q6.** Should we use `@nestjs/jwt` or `jsonwebtoken` directly? **Resolution:** Implementation choice — `passport-jwt` requires `jsonwebtoken` under the hood; `@nestjs/jwt` is a NestJS-friendly wrapper. Either is fine; the developer picks what fits the standard recipe.

- [x] **Q7.** Should the S3 `HeadBucket` indicator be skipped for Sprint 1? **Resolution:** Yes. ARC-030 owns it. Documented in the technical risks.

- [x] **Q8.** Should the readiness probe check JWT signing keys? **Resolution:** If the keys are loaded at boot (verified by the typed config), a `/health/ready` check is redundant. The boot-time validation is sufficient. The indicator is not added in this spec.
