---
title: "Technical Specification — ARC-013+ARC-015+ARC-036: JWT auth (RS256+JWKS), passport-jwt RBAC, and Terminus health checks"
date: 2026-08-13
type: specification
scope: internal
story-id: "ARC-013+ARC-015+ARC-036"
status: approved
version: 1.0.0
updated: 2026-08-13
layers:
  backend: true
  frontend: false
  mobile: false
  tooling: false
---

# Technical Specification — ARC-013+ARC-015+ARC-036: JWT auth (RS256+JWKS), passport-jwt RBAC, and Terminus health checks

**Status: ✅ Approved (yolo mode — auto-approved to unblock Sprint 1 closure)**

---

## Scope

| Layer           | Affected | Justification | foldername |
| --------------- | -------- | -------------------------------------- | --- |
| Backend         | Yes      | ARC-013 wires JWT issuance (RS256, JWKS), refresh-token rotation, password hashing, and discovery endpoints under `apps/api/src/modules/identity/` and `apps/api/src/shared/jwt|s3|passwords/`. ARC-015 adds the Passport JWT strategy, RolesGuard, JwtAuthGuard, and the `@Roles` / `@CurrentUser` decorators under `apps/api/src/shared/guards/` and `apps/api/src/shared/decorators/`. ARC-036 replaces the health-check stubs with `@nestjs/terminus` indicators (Prisma, S3, memory, disk) under `apps/api/src/modules/health/indicators/`. | `apps/api/` |
| Frontend Web    | No       | The frontend integration is a Sprint 2 concern (login screen, token refresh). The `(dashboard)` route group from ARC-004 stays unchanged in this spec. | — |
| Frontend Mobile | No       | Out of scope per architecture §2.1 (TC-8: PC + tablet only). | — |
| Tooling         | No       | No new monorepo workspaces. The `@wendy/contracts` package from ARC-005 gets one new DTO namespace (`auth/`) consumed by ARC-014. | — |

The monorepo root (`code/` git submodule) hosts the API tier; the existing ESLint boundary rules from ARC-002 already enforce that `apps/api/` does not cross into `apps/web/` or `packages/contracts/` internals.

---

## Architecture References

| Documents | Description |
|---|---|
| `3-architecture/3.1-architecture/architecture.md` §6 Identity & Access | Defines the canonical `/oauth/*` URL namespace, the JWT shape, the RBAC model, and the discovery doc. |
| `3-architecture/3.2-blueprints/backend-blueprint.md` §2-3 | Authoritative for the `config + service` pattern, the `shared/` subfolders, and the bounded-context folder layout. |
| `3-architecture/3.2-blueprints/backend-blueprint.md` §6 (Cross-cutting — AuthN, AuthZ, Health) | Defines the wiring rules for guards, the global `ValidationPipe`, and the health endpoint contract. |
| `3-architecture/3.3-decision-record/adr-05-auth-jwt-bcrypt.md` | RS256, JWKS, OIDC-style URLs, refresh rotation, bcrypt cost 12, no forced rotation. |
| `3-architecture/3.3-decision-record/adr-15-auth-framework-passport.md` | `@nestjs/passport` + `passport-jwt`, canonical NestJS recipe, `JwtStrategy` + `JwtAuthGuard` shape. |
| `3-architecture/3.3-decision-record/adr-17-health-checks-terminus.md` | `@nestjs/terminus`, custom Prisma + S3 indicators, two endpoints, ALB target-group wiring. |
| `3-architecture/3.3-decision-record/adr-16-configuration-typed-classes.md` | `class-validator` + `class-transformer` + `static fromEnv()` pattern for config classes. |
| `3-architecture/3.3-decision-record/adr-09-modular-monolith-organization.md` | Bounded-context folder layout, `public/` surface, EventEmitter communication. |
| `4-specs/20260812-arc-001-monorepo-and-nestjs-bootstrap/tech-spec.md` | The ARC-001/002/003 scaffolding that the auth layer plugs into. |
| `4-specs/20260813-arc-004-005-008-web-contracts-prisma-users/tech-spec.md` | The shared `users` table that the auth layer reads. |

---

## Backend

### API Endpoints

> **Authoritative source for the new endpoints** — the in-line YAML below is the contract ARC-014 will implement on top of the services delivered here. ARC-013/015/036 only ship the wiring (issuance, verification, RBAC, health checks). ARC-014 layers the controllers.

#### Endpoints shipped in this spec

**CREATE — `GET /.well-known/jwks.json`**

```yaml
# GET /.well-known/jwks.json
security:
  type: public
response:
  keys: list[object]    # list, required, RFC 7517 JWKS shape
    kty: str            # str, required, "RSA"
    kid: str            # str, required, the JWT_KEY_ID
    use: str            # str, required, "sig"
    alg: str            # str, required, "RS256"
    n: str              # str, required, base64url-encoded modulus
    e: str              # str, required, base64url-encoded exponent (default "AQAB")
```

**CREATE — `GET /.well-known/wendy-configuration`**

```yaml
# GET /.well-known/wendy-configuration
security:
  type: public
response:
  issuer: str                       # str, required, "wendy-planner"
  token_endpoint: str               # str, required, absolute URL
  userinfo_endpoint: str            # str, required, absolute URL
  jwks_uri: str                     # str, required, absolute URL
  revocation_endpoint: str          # str, required, absolute URL
  end_session_endpoint: str         # str, required, absolute URL
  change_password_endpoint: str     # str, required, absolute URL
  refresh_endpoint: str             # str, required, absolute URL
```

**MODIFY — `GET /health/live`** (replaces ARC-003 stub)

```yaml
# GET /health/live
security:
  type: public
response:
  status: str                       # str, required, enum: ["up", "error"]
  info: object                      # object, required, indicator name → status map
  error: object                     # object, required, empty on success
  details: object                   # object, required, full indicator name → status map
```

**MODIFY — `GET /health/ready`** (replaces ARC-003 stub)

```yaml
# GET /health/ready
security:
  type: public
response:
  status: str                       # str, required, enum: ["up", "error"]
  info: object                      # object, required; on success: { database: { status: "up" }, photo_bucket: { status: "up" }, memory_heap: { status: "up" }, disk: { status: "up" } }
  error: object                     # object, required; on failure: { <failing-indicator>: { status: "down", message: "..." } }
  details: object                   # object, required, full indicator name → status map
```

**Notes on the contract:**

- `/{health,live,ready}` and `/.well-known/*` are not part of the `/api/v1/*` namespace. They are infrastructure endpoints.
- The `Cache-Control: public, max-age=300` header on `/.well-known/jwks.json` and `/.well-known/wendy-configuration` is set by the controller. The ALB does not cache these responses (the header is a hint for downstream caches and the JWKS document is small enough).
- The `/.well-known/wendy-configuration` URLs are computed using the request's host (so they work in dev `localhost:3000` and prod `api.wendy.app`). The spec values are template strings containing `{host}` and a URL builder substitutes at request time.

#### Endpoints contractually deferred to ARC-014

These are listed here for traceability only — ARC-014 owns their implementation. ARC-013/015 ships the services (`JwtService`, `LocalAuthService`, `PasswordHasherService`) that ARC-014's controllers call.

| Endpoint | Method | Auth (in ARC-014) | Owner |
|---|---|---|---|
| `/oauth/token` | POST | public | ARC-014 |
| `/oauth/refresh` | POST | refresh-token cookie | ARC-014 |
| `/oauth/revoke` | POST | public + refresh-token cookie | ARC-014 |
| `/oauth/userinfo` | GET | jwt | ARC-014 |
| `/oauth/user/password` | PUT | jwt | ARC-014 |
| `/oauth/logout` | POST | jwt + refresh-token cookie | ARC-014 |

---

### Database Changes

No database changes in this spec. The `users` table from ARC-008 is the only table touched (read-only) by the auth layer:

- `JwtService.signAccessToken` reads nothing from the DB — it only signs.
- `LocalAuthService.authenticate` reads `users.{ id, tenant_id, password_hash, role, is_disabled }` via `prisma.user.findUnique({ where: { email } })` and writes nothing. The bcrypt comparison is done in `PasswordHasherService.verify`.
- `JwtService.revoke(jti)` writes to an in-memory `Set<string>` (Rule 8) — no DB.

The `revoked_refresh_tokens` table (or shared Redis set) is a follow-up ARC, not in this spec.

---

### Events

No events are published or consumed in this spec. `user.created`, `user.disabled`, `password.reset` are owned by ARC-017 / ARC-018 / ARC-037 and arrive in later sprints.

---

### Third-party Integrations (Backend)

| Action | Service | Purpose | Authentication |
|---|---|---|---|
| USE | AWS Secrets Manager | RS256 private key (`jwt/signing-keys` secret, surfaced as `JWT_PRIVATE_KEY_PEM`) | IAM task role (ECS) |
| USE | AWS S3 (`wp-photos-prod`) | `HeadBucket` for readiness probe | `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` (or IAM task role — same effect) |
| USE | PostgreSQL 15 (RDS or local) | `prisma.user.findUnique` inside `LocalAuthService` | `DATABASE_URL` (ADR-16) |
| USE | `@nestjs/passport` + `passport-jwt` + `@nestjs/jwt` | JWT validation | local config |
| USE | `@nestjs/terminus` + built-in indicators | `/health/*` | local config |
| USE | `@aws-sdk/client-s3` | `HeadBucketCommand` | `S3Config` |

---

## Cross-cutting Concerns

### Monorepo and Tooling

| Change | Folder | Reason |
|---|---|---|
| `apps/api/package.json` updated | `apps/api/` | Add `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/jwt`, `@nestjs/terminus`, `@aws-sdk/client-s3`, `bcrypt`, `jsonwebtoken`. Add `@types/passport-jwt`, `@types/bcrypt` to devDependencies. |
| `apps/api/src/config/jwt.config.ts` created | `apps/api/` | `JwtConfig` typed class with `JWT_PRIVATE_KEY_PEM`, `JWT_KEY_ID`, `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_ACCESS_TOKEN_TTL_SECONDS`, `JWT_REFRESH_TOKEN_TTL_SECONDS`. |
| `apps/api/src/config/s3.config.ts` created | `apps/api/` | `S3Config` typed class with `S3_BUCKET`, `AWS_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`. |
| `apps/api/src/config/app-config.module.ts` updated | `apps/api/` | Register `JwtConfig` and `S3Config` as providers; export them. |
| `apps/api/src/main.ts` updated | `apps/api/` | Set the global `useGlobalGuards` to `JwtAuthGuard` (via `APP_GUARD`) and the global `useGlobalPipes` to `ValidationPipe` (already in ARC-003 — verify). |
| `apps/api/src/shared/jwt/jwt.service.ts` created | `apps/api/src/shared/jwt/` | `signAccessToken`, `signRefreshToken`, `verifyAccessToken`, `verifyRefreshToken`, `getJwks`, `revoke`. |
| `apps/api/src/shared/jwt/jwt.module.ts` created | `apps/api/src/shared/jwt/` | `@Global()` module exporting `JwtService`. |
| `apps/api/src/shared/passwords/password-hasher.service.ts` created | `apps/api/src/shared/passwords/` | `hash(plain)`, `verify(plain, hash)` using `bcrypt` cost 12. |
| `apps/api/src/shared/passwords/password-hasher.module.ts` created | `apps/api/src/shared/passwords/` | `@Global()` module exporting `PasswordHasherService`. |
| `apps/api/src/shared/guards/jwt-auth.guard.ts` created | `apps/api/src/shared/guards/` | `JwtAuthGuard` extending `AuthGuard('jwt')`. Honors `@Public()` decorator. |
| `apps/api/src/shared/guards/roles.guard.ts` created | `apps/api/src/shared/guards/` | `RolesGuard` reading `req.user.role` against `@Roles(...)` metadata. |
| `apps/api/src/shared/guards/public.decorator.ts` created | `apps/api/src/shared/guards/` | `Public()` decorator setting `IS_PUBLIC_KEY = true`. |
| `apps/api/src/shared/decorators/roles.decorator.ts` created | `apps/api/src/shared/decorators/` | `Roles(...roles)` decorator. |
| `apps/api/src/shared/decorators/current-user.decorator.ts` created | `apps/api/src/shared/decorators/` | `CurrentUser()` parameter decorator. |
| `apps/api/src/modules/identity/strategies/jwt.strategy.ts` created | `apps/api/src/modules/identity/strategies/` | `JwtStrategy` extending `PassportStrategy(Strategy)`. |
| `apps/api/src/modules/identity/application/local-auth.service.ts` created | `apps/api/src/modules/identity/application/` | `LocalAuthService.authenticate(email, password)`. |
| `apps/api/src/modules/identity/inbound-adapters/discovery.controller.ts` created | `apps/api/src/modules/identity/inbound-adapters/` | `GET /.well-known/wendy-configuration`. |
| `apps/api/src/modules/identity/inbound-adapters/jwks.controller.ts` created | `apps/api/src/modules/identity/inbound-adapters/` | `GET /.well-known/jwks.json`. |
| `apps/api/src/modules/identity/identity.module.ts` updated | `apps/api/src/modules/identity/` | Add `JwtStrategy`, `LocalAuthService`, `DiscoveryController`, `JwksController`. Import `JwtModule.registerAsync`, `PassportModule`. |
| `apps/api/src/modules/health/indicators/prisma.health.ts` created | `apps/api/src/modules/health/indicators/` | `PrismaHealthIndicator` with a 1-second `SELECT 1`. |
| `apps/api/src/modules/health/indicators/s3.health.ts` created | `apps/api/src/modules/health/indicators/` | `S3HealthIndicator` with a 2-second `HeadBucket`. |
| `apps/api/src/modules/health/health.constants.ts` created | `apps/api/src/modules/health/` | `HEALTH_MEMORY_HEAP_LIMIT_BYTES`, `HEALTH_MEMORY_RSS_LIMIT_BYTES`, `HEALTH_DISK_THRESHOLD_PERCENT`. |
| `apps/api/src/modules/health/inbound-adapters/health.controller.ts` MODIFIED | `apps/api/src/modules/health/` | Replace the stub with `HealthCheckService` and the four indicators. |
| `apps/api/src/modules/health/health.module.ts` updated | `apps/api/src/modules/health/` | Import `TerminusModule`, register indicators. |
| `apps/api/test/health.e2e-spec.ts` created | `apps/api/test/` | E2E test for `/health/live` and `/health/ready`. |
| `apps/api/src/modules/identity/strategies/jwt.strategy.spec.ts` created | `apps/api/src/modules/identity/strategies/` | Adapter test for `JwtStrategy.validate` and `JwtService` round-trip. |
| `apps/api/src/shared/guards/roles.guard.spec.ts` created | `apps/api/src/shared/guards/` | Adapter test for `RolesGuard` (allowed / denied). |

### Security and Authorization

| Endpoint / Feature | Allowed roles | Notes |
|---|---|---|
| `GET /health/live`, `GET /health/ready` | Public | `@Public()` decorator. The global `JwtAuthGuard` skips these. |
| `GET /.well-known/jwks.json`, `GET /.well-known/wendy-configuration` | Public | `@Public()`. |
| `/oauth/*` (deferred to ARC-014) | Public token exchange; refresh uses cookie | Out of scope here, but the `JwtService` and `LocalAuthService` they consume are guarded and exercised via tests. |
| `S3_*, JWT_*` env vars | API boot only | Never logged, never returned in responses. The `validateSync` error messages redacted to `<env-var-name>: <constraint>` (no value). |
| `JWT_PRIVATE_KEY_PEM` | API boot only | Held in memory only. The `kid` is the only token-related identifier returned by the API (`/.well-known/jwks.json`). |

### Error Handling

| Scenario | Expected behavior |
|---|---|
| `JWT_PRIVATE_KEY_PEM` missing or malformed | `JwtConfig.fromEnv()` or `JwtService` construction throws at boot. The process exits with a clear `Invalid environment configuration: - JWT_PRIVATE_KEY_PEM: must be a string` message. |
| `S3_BUCKET` missing in dev | `S3Config.fromEnv()` throws at boot. The error message names the missing var. |
| `RolesGuard` denies | `ForbiddenException` → global exception filter maps to `{ code: "forbidden", message: "Insufficient role", traceId: "<id>" }` with HTTP 403. |
| `JwtAuthGuard` rejects (no / expired / wrong-issuer token) | `UnauthorizedException` → 401 with `{ code: "unauthorized", message: "Invalid or expired token", traceId: "<id>" }`. |
| `/health/ready` Prisma timeout (1 s) | `HealthCheckError` → 503 with `{ status: "error", error: { database: { status: "down", message: "..." } } }`. Other indicators still run. |
| `/health/ready` S3 timeout (2 s) | `HealthCheckError` → 503 with `{ status: "error", error: { photo_bucket: { status: "down", message: "..." } } }`. |
| `/health/ready` memory or disk threshold exceeded | `HealthCheckError` → 503 with the failing indicator in the body. |

### Configuration

| Env var | Source | Purpose |
|---|---|---|
| `JWT_PRIVATE_KEY_PEM` | local `.env` (dev) / Secrets Manager (prod) | RS256 private key for signing |
| `JWT_KEY_ID` | local `.env` (dev) / Secrets Manager (prod) | `kid` for `/.well-known/jwks.json` |
| `JWT_ISSUER` | local `.env` (default `wendy-planner`) | `iss` claim |
| `JWT_AUDIENCE` | local `.env` (default `wendy`) | `aud` claim |
| `JWT_ACCESS_TOKEN_TTL_SECONDS` | local `.env` (default `900`) | Access token lifetime |
| `JWT_REFRESH_TOKEN_TTL_SECONDS` | local `.env` (default `604800`) | Refresh token lifetime |
| `S3_BUCKET` | local `.env` (dev: `wp-photos-prod` or MinIO bucket) / Secrets Manager (prod) | `HeadBucket` target |
| `AWS_REGION` | ECS task metadata / local `.env` | AWS region for `S3Client` |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Secrets Manager (prod) / local `.env` (dev) | S3 credentials |
| `DATABASE_URL` | local `.env` / Secrets Manager (prod) | Postgres connection (already wired by ARC-008) |
| `NODE_ENV`, `PORT`, `LOG_LEVEL` | Same as ARC-003 | Already wired |

`.env.example` is updated to document each new var with a placeholder. **No real keys are ever committed.**

---

## Technical Risks and Constraints

| Risk / Constraint | Impact | Mitigation |
|---|---|---|
| **In-memory `revoked_jtis` set does not survive ECS task restarts.** A user whose refresh token is revoked and whose ECS task is restarted will be able to reuse the token once. | Medium (Sprint 1 acceptable) | Documented as a known limitation in the runbook. Future ARC moves the set to Redis or a `revoked_refresh_tokens` table. |
| **RS256 key rotation not yet implemented.** The `kid` is stable; a future rotation will advertise two keys in `jwks.json` for a grace period. | Medium | Documented in the runbook. Sprint 1 ships single-key mode. |
| **`bcrypt` is native and slow on cold start of Fargate tasks.** First-touch cost is ~200 ms. | Low | Acceptable for the MVP. The `/health/ready` probe does not call `bcrypt`. |
| **`@nestjs/terminus` HTTP errors leak indicator names.** | Low | The probes are unauthenticated. Indicator names (`database`, `photo_bucket`, `memory_heap`, `disk`) are not secrets. |
| **`S3Config` `AWS_REGION` is required even in dev.** Without it, the `S3Client` constructor fails. | Low | `S3Config.fromEnv()` validates `AWS_REGION` exists. Dev `.env` example sets it to `us-east-1`. |
| **First-boot `JWKS` and `discovery` controllers are wired before the `DiscoveryController` route exists.** Risk that the URL map returns stale URLs. | Low | The URL map is computed per request from `req.headers.host`, so multi-environment deploys don't need a config flag. |
| **Passport strategy name collision with other modules.** If ARC-014 also defines a `LocalStrategy`, the names collide. | Low | ARC-014 owns OIDC-style endpoints but does **not** define a `LocalStrategy` — it uses `LocalAuthService` directly. The `JwtStrategy` is the only Passport strategy in Sprint 1. |

---

## Open Questions

> All questions must be answered before this document moves to `approved` status. (Yolo mode: all answers are inferred and recorded below — reviewer should confirm or correct.)

- [x] **Q1.** Where does the `PasswordHasherService` live — `shared/passwords/` or `modules/identity/application/`? **Resolution:** `shared/passwords/` because it is consumed by `LocalAuthService` (modules/identity) and by future ARC-018 (password reset). It is global infrastructure, not a bounded-context detail.
- [x] **Q2.** Is the JWT discovery document (`/.well-known/wendy-configuration`) cached? **Resolution:** Yes, `Cache-Control: public, max-age=300` (5 min). The ALB does not cache, but downstream CDNs and clients can.
- [x] **Q3.** Does the `S3HealthIndicator` timeout include the TCP connect + TLS handshake, or just the `HeadBucket` call? **Resolution:** The 2-second timeout is the SDK `requestHandler.config.requestTimeout` — the total wall-clock for the call. The `S3Client` is constructed with `requestHandler: { requestTimeout: 2000 }` in `S3Service` (or in the indicator directly).
- [x] **Q4.** Is the global `JwtAuthGuard` enforcing auth on every endpoint, or only on routes that opt in? **Resolution:** The global guard is **enabled** by default (every route requires auth), with the `@Public()` decorator as the opt-out. The alternative (only the routes that opt in use the guard) was rejected because it is too easy to forget on a new endpoint and security regressions are silent.
- [x] **Q5.** Does `LocalAuthService` need a `last_login_at` update? **Resolution:** Out of scope. ARC-018 (`disable + password reset`) and ARC-037 (audit) deal with that signal. The Sprint 1 `LocalAuthService` just verifies credentials.
- [x] **Q6.** Does the `JwtService` log the issued `jti`s? **Resolution:** Yes — at `info` level. This gives the runbook a way to confirm a token was issued. The full token is never logged; only the `jti` and the `sub` (user id).
- [x] **Q7.** What if `JWT_PRIVATE_KEY_PEM` is malformed PEM (e.g. no `BEGIN PRIVATE KEY` header)? **Resolution:** `JwtService` constructor catches the `Error` thrown by `crypto.createPrivateKey()` and re-throws with a clear `Invalid JWT private key: <reason>` message. The process exits at boot.
- [x] **Q8.** Is the `LocalAuthService` exposed via `IdentityModule.public/`? **Resolution:** Yes. `LocalAuthService` is exported through `modules/identity/public/index.ts` so ARC-014's `AuthController` can inject it. The internal `JwtStrategy` is **not** exported (sibling modules do not need to construct strategies).
- [x] **Q9.** Where do the `@Public()` decorator and the `JWT_PUBLIC_KEY_PEM` derivation live? **Resolution:** `@Public()` is a `SetMetadata('isPublic', true)` decorator in `shared/guards/public.decorator.ts`. The public key is derived in `JwtService` constructor using `crypto.createPublicKey(privateKey)` and cached as a `KeyObject`. The JWKS shape is generated lazily on the first `GET /.well-known/jwks.json` call.
- [x] **Q10.** What about the `S3HealthIndicator` running asynchronously with the `PrismaHealthIndicator`? **Resolution:** `@nestjs/terminus` runs indicators sequentially by default. For Sprint 1 this is acceptable — the total wall-clock for `/health/ready` is < 3 s (1 s Prisma + 2 s S3). A future optimization could parallelize. The acceptance test confirms `/health/ready` returns within 3 s when both checks are healthy.
