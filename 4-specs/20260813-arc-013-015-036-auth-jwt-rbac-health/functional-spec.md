---
title: "Specification: JWT auth (RS256+JWKS), passport-jwt RBAC, and Terminus health checks"
date: 2026-08-13
type: specification
scope: internal
story-id: "ARC-013+ARC-015+ARC-036"
status: approved
version: 1.0.0
updated: 2026-08-13
---

# JWT auth (RS256+JWKS), passport-jwt RBAC, and Terminus health checks

> **Status: Approved (yolo mode — auto-approved by delivery team to unblock Sprint 1 closure)**

## User Stories

`ARC-013` **Implement JWT auth (RS256) + JWKS** — As the delivery team, we need the JWT authentication layer implemented with RS256 asymmetric signing (private key in Secrets Manager, public key served at `/.well-known/jwks.json`), 15-minute access tokens and 7-day refresh tokens stored in `HttpOnly; Secure; SameSite=Lax` cookies, so that the API can issue, verify, and rotate short-lived credentials for the in-house Wedding Planners and the Administrator, and so that a future migration to a managed IdP (Cognito, Auth0, Keycloak) is a backend-internal change. Per ADR-05 and audit finding H-1. [groupBy:: arq] [priority:: 3]

`ARC-015` **Implement passport-jwt strategy with RBAC guards** — As the delivery team, we need `@nestjs/passport` + `passport-jwt` wired into the API with a `JwtAuthGuard` and a `RolesGuard` (Administrator, WeddingPlanner) reading the role from the JWT payload, and tenant scoping enforced at the repository level, so that any protected controller can declare `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('WeddingPlanner')` and rely on the auth context to populate `req.user`, and so that 401/403 are returned with the platform's standard error envelope. Per ADR-15. [groupBy:: arq] [priority:: 3]

`ARC-036` **Implement health checks (Terminus)** — As the platform operations layer (ECS / ALB / CloudWatch), we need `/health/live` (process is up) and `/health/ready` (Prisma reachable, S3 reachable, signing keys loaded, memory ≤ 200 MB, disk ≤ 90 %) exposed via `@nestjs/terminus`, so that the ALB target group can drain unhealthy tasks before the user traffic hits them, and so that ops can tell DB outages from app crashes without reading container logs. Per ADR-17. [groupBy:: arq] [priority:: 3]

## Context

With ARC-001/002/003 (monorepo, ESLint, NestJS skeleton) and ARC-004/005/008 (Web App, `@wendy/contracts`, Prisma `users` migration) shipped on 2026-08-12 and 2026-08-13 respectively, the API has a runnable shell with a `users` table but no authentication and no real health checks. The two Sprint 1 user-facing stories US-001 (onboard a new WP) and US-006 (confirm my identity to access the platform) cannot land without an auth layer, and the API cannot be deployed to ECS with confidence because the ALB has only stubs to probe.

These three infrastructure stories are coordinated as one specification because they share the same worry: **the API must be deployable, secure, and observable as a single unit at the end of Sprint 1**. The deliverables are:

- A real JWT issuance and verification path (RS256, JWKS, refresh rotation) — without it, the API is a perimeter-less shell.
- A canonical Passport strategy and RBAC guards — without it, every endpoint that needs auth would re-implement the same plumbing.
- A real `/health/*` surface — without it, the ECS task definition has no way to know when to restart a container or remove it from rotation.

The "users" of these three stories are the same as for ARC-004/005/008: the two-person delivery team (1 BE + 1 FE) opening PRs from Sprint 1 onward. Acceptance criteria are written so a developer can clone the repo, run `pnpm install`, and verify that (a) the API refuses to boot without a valid RS256 key pair, (b) a missing or expired JWT is rejected with 401, (c) a valid JWT with the wrong role is rejected with 403, and (d) `/health/ready` returns 200 only when Prisma and S3 are reachable.

This is plumbing work, not a user-facing feature. The user-facing consequences — a login screen, an onboarding flow, a returning dashboard — arrive in Sprint 2 stories (ARC-017 WP onboarding, ARC-014 OIDC-style endpoints, US-001 / US-006).

## Dependencies

| Story | Type | Description |
|---|---|---|
| `ARC-001` Bootstrap monorepo with pnpm workspaces | Requires | `apps/api/` workspace exists. |
| `ARC-003` Bootstrap NestJS API skeleton with module layout | Requires | The `modules/identity/` empty bounded context, `shared/guards/` empty folder, `shared/prisma/` containing `PrismaService`, and `config/` containing `EnvConfig` / `DatabaseConfig` are all in place. |
| `ARC-004` Bootstrap Vite + React Web skeleton | Requires | The `(dashboard)` route group exists; ARC-013/015 will be wired into it by ARC-014 (the OIDC-style `/oauth/*` endpoints) and a Sprint 2 frontend story. |
| `ARC-005` Bootstrap `@wendy/contracts` package | Requires | Branded ID types (`UserId`, `TenantId`) are available for use in DTOs and JWT payloads. |
| `ARC-008` Initialize Prisma `users` migration | Requires | The `users` table exists with `id`, `tenant_id`, `email`, `password_hash`, `role`, `is_disabled`. The JWT issuer reads `(id, role, tenantId, is_disabled)` from this table. |
| `ARC-014` Implement OIDC-style auth endpoints | Required by | ARC-014 implements `/oauth/token`, `/oauth/refresh`, `/oauth/logout`, etc. on top of the JwtService + JwtStrategy delivered by ARC-013/015. |
| `ARC-017` Implement WP onboarding endpoint | Required by | ARC-017's `POST /api/v1/wedding-planners` uses the JWT issuance / hashing utilities delivered by ARC-013. |
| `ARC-018` Implement disable + password reset endpoints | Required by | ARC-018 calls `bcrypt.hash` and `users.update`; the `LocalAuthService` from ARC-013 is the canonical password-hashing entry point. |
| `ARC-030` Implement Photo Storage bounded context | Required by | ARC-030 uses S3; ARC-036's `S3HealthIndicator` is the first consumer of the `S3Client` in the shared layer. |
| `ARC-037` Implement Audit module | Required by | ARC-037 emits `user.created`, `user.disabled`, `password.reset` audit events. ARC-013 emits the JWT `jti` enabling revocation; ARC-018 triggers the audit events. |
| `OPS-004` Provision Secrets Manager entries | Requires | The RS256 key pair (`jwt/signing-keys`) and S3 access keys (`s3/access-keys`) must exist in AWS Secrets Manager so the API task can boot. ARC-013/036 fail fast at startup if the secret is missing. |
| `OPS-008` Provision S3 buckets | Requires | `wp-photos-prod` must exist and the API task IAM role must be able to call `s3:HeadBucket` for the readiness check. |
| `OPS-011` Provision ECS Fargate cluster and API service | Required by | The ECS task definition reads `JWT_PRIVATE_KEY_PEM` and `S3_BUCKET` from environment variables injected from Secrets Manager. |

> ⚠️ Assumption — the RS256 key pair is generated by the delivery team as a one-time secret bootstrap step (documented in the backend runbook, not in this spec). The private key lives in `jwt/signing-keys` (Secrets Manager) as a single multi-line string; the public key is derived from it on startup and cached in memory. Dual-key rotation is a follow-up ADR (per ADR-15 §Follow-up).

> ⚠️ Assumption — `S3Config` (currently absent from the repo) is added in this spec as part of the ARC-036 groundwork. Without it, the health check cannot run. If the team prefers to scope S3Config out and only stub the indicator for the MVP, the readiness probe will pass with `S3` as a TODO until ARC-030 ships.

## Rules & Constraints

### ARC-013 — JWT issuance & JWKS

- **Rule 1 — RS256 with asymmetric key pair**: The API signs access tokens with RS256. The private key is read at boot from `JWT_PRIVATE_KEY_PEM` (env var, sourced from Secrets Manager). The API derives the public key from the same PEM at boot and holds it in memory. The signing algorithm is **never** configurable at runtime — it is pinned to `RS256` in the `JwtConfig` typed class.
- **Rule 2 — Public key discoverable at `/.well-known/jwks.json`**: `GET /.well-known/jwks.json` returns a JWKS document with `{"keys": [{ "kty": "RSA", "kid": "<key-id>", "use": "sig", "alg": "RS256", "n": "<base64url>", "e": "AQAB" }]}` and HTTP 200. The endpoint is unauthenticated. The `kid` is a stable UUID generated on first boot and stored alongside the private key in Secrets Manager, so rotated keys get a new `kid` and the JWKS advertises both.
- **Rule 3 — Access token shape and lifetime**: Access tokens carry `{ sub: <UserId>, role: 'Administrator' | 'WeddingPlanner', tenantId: <TenantId>, iat, exp, jti, iss: 'wendy-planner', aud: 'wendy' }`. Lifetime is **15 minutes**. Tokens are signed with a `kid` header that matches the in-memory public key.
- **Rule 4 — Refresh token cookie contract**: The refresh token is set as an `HttpOnly; Secure; SameSite=Lax` cookie named `wendy_refresh` with `Max-Age=7 days`. The cookie value is a signed JWT with the same shape but `aud: 'refresh'` and `exp: now + 7d`. The cookie is set by the API on `/oauth/token` (ARC-014) and cleared on `/oauth/logout`. In development, `Secure` is honored as documented but the cookie still works on `http://localhost:3000` because the browser treats `localhost` as a secure context.
- **Rule 5 — `JwtConfig` typed config**: `apps/api/src/config/jwt.config.ts` declares a `JwtConfig` class with `class-validator` decorators:
  - `@IsString()` `JWT_PRIVATE_KEY_PEM` (multi-line PEM, no min length — anything non-empty is accepted; cryptographic correctness is verified when the public key is derived)
  - `@IsString()` `JWT_KEY_ID` (UUID v4 string)
  - `@IsString()` `JWT_ISSUER` (default `'wendy-planner'`)
  - `@IsString()` `JWT_AUDIENCE` (default `'wendy'`)
  - `@IsInt()` `@Min(60)` `@Max(3600)` `JWT_ACCESS_TOKEN_TTL_SECONDS` (default `900`)
  - `@IsInt()` `@Min(3600)` `@Max(2592000)` `JWT_REFRESH_TOKEN_TTL_SECONDS` (default `604800`)
  - `static fromEnv(env)` performs the same `plainToInstance` + `validateSync` pattern as `EnvConfig` and `DatabaseConfig`. Missing or invalid values throw at boot with a clear `Invalid environment configuration: - JWT_PRIVATE_KEY_PEM: ...` message.
- **Rule 6 — `JwtService` is the single issuance entry point**: `apps/api/src/shared/jwt/jwt.service.ts` exposes `signAccessToken(payload)`, `signRefreshToken(payload)`, `verifyAccessToken(token)`, `verifyRefreshToken(token)`, and `getJwks()` (returns the cached public key in JWKS shape). All other modules inject this service — they do not import `@nestjs/jwt` directly. The service is `@Global()` so any bounded context can inject it.
- **Rule 7 — Refresh token rotation**: Every successful `/oauth/refresh` request (ARC-014) issues a new access token AND a new refresh token, and stores the old refresh token's `jti` in a `revoked_jtis` set (in-memory for Sprint 1; see Rule 8). The revoked `jti` blocks reuse even if the cookie is replayed before the next refresh.
- **Rule 8 — Revocation set is in-memory for Sprint 1**: The `revoked_jtis` set is a `Set<string>` in the `JwtService` instance. This is acceptable for Sprint 1 because the API runs as a single ECS service (no horizontal scale-out, no shared Redis). The acceptance test verifies that an explicitly revoked refresh token cannot be used twice. **The set is documented as a known limitation** — a future story (ARC-???) moves the set to Redis or a `revoked_refresh_tokens` table when the API scales horizontally.
- **Rule 9 — Discovery doc at `/.well-known/wendy-configuration`**: `GET /.well-known/wendy-configuration` returns a JSON document with the URL map documented in ADR-05 §Standards-aligned URLs (`token_endpoint`, `userinfo_endpoint`, `jwks_uri`, `revocation_endpoint`, `end_session_endpoint`, `change_password_endpoint`). Implemented as a simple handler in `apps/api/src/modules/identity/inbound-adapters/discovery.controller.ts`. The endpoint is unauthenticated and cached for 5 minutes with `Cache-Control: public, max-age=300`.
- **Rule 10 — Password hashing utility**: `apps/api/src/shared/passwords/password-hasher.service.ts` exposes `hash(plain: string)` and `verify(plain: string, hash: string)`. Uses `bcrypt` cost 12. The `LocalAuthService` (ARC-014) is the only caller in this iteration. The service is `@Global()`.
- **Rule 11 — No JWT secret in environment defaults**: `.env.example` documents the env vars but **never** ships a real key. The developer generates a key locally with `openssl genrsa -out jwt-private.pem 2048` and `openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem`. The developer runbook (delivered by OPS-024) documents this. CI never contains a real key.

### ARC-015 — passport-jwt strategy + RBAC guards

- **Rule 12 — `JwtStrategy` follows the canonical NestJS recipe**: `apps/api/src/modules/identity/strategies/jwt.strategy.ts` extends `PassportStrategy(Strategy)` from `passport-jwt`. The configuration is:
  - `jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()`
  - `ignoreExpiration: false`
  - `secretOrKey: config.JWT_PUBLIC_KEY_PEM` (derived from the private key at boot, held in `JwtConfig`)
  - `algorithms: ['RS256']`
  - `audience: config.JWT_AUDIENCE`
  - `issuer: config.JWT_ISSUER`
  - `passReqToCallback: false`
  - `validate(payload)` returns `{ id: payload.sub, role: payload.role, tenantId: payload.tenantId }`. The result is what populates `req.user`.
- **Rule 13 — `JwtAuthGuard` is a thin wrapper**: `apps/api/src/shared/guards/jwt-auth.guard.ts` exports `class JwtAuthGuard extends AuthGuard('jwt')`. The guard is the only one referenced by `@UseGuards()`; it lives in `shared/guards/` per the backend blueprint §3.
- **Rule 14 — `RolesGuard` reads `@Roles(...)` from the route metadata**: `apps/api/src/shared/guards/roles.guard.ts` uses `Reflector` to read the `roles` key from the handler / class. If `req.user.role` is not in the list, the guard throws `ForbiddenException` with the standard error envelope `{ "code": "forbidden", "message": "Insufficient role", "traceId": "..." }`. The guard is global (`APP_GUARD`) so every request is checked — but because it sits behind `JwtAuthGuard`, only authenticated requests reach it.
- **Rule 15 — `@Roles()` decorator**: `apps/api/src/shared/decorators/roles.decorator.ts` exports `export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles)`. Used as `@Roles('Administrator', 'WeddingPlanner')` on controllers or handlers.
- **Rule 16 — `@CurrentUser()` decorator**: `apps/api/src/shared/decorators/current-user.decorator.ts` exports `export const CurrentUser = createParamDecorator((_data, ctx) => ctx.switchToHttp().getRequest().user)`. The return type is `AuthenticatedUser = { id: UserId, role: UserRole, tenantId: TenantId }`. Controllers use `@CurrentUser() user: AuthenticatedUser` to access the auth context.
- **Rule 17 — Testing harness for the strategy**: An adapter test (`vitest`) constructs a fake JWT with the test private key, calls `JwtService.verifyAccessToken()` directly, and asserts the payload. A second test issues a JWT with the wrong audience and asserts verification fails with `TokenExpiredError` / `JsonWebTokenError`. The test private key is generated in `beforeAll` and never leaves the test file.
- **Rule 18 — `LocalAuthService` exists for `/oauth/token`**: `apps/api/src/modules/identity/application/local-auth.service.ts` exposes `authenticate(email, password): Promise<AuthenticatedUser | null>`. It does `prisma.user.findUnique({ where: { email } })`, calls `passwordHasher.verify`, returns `null` on mismatch (the controller turns this into 401), and throws `UserDisabledError` when `is_disabled === true`. The service is the **only** password-comparison site in the codebase.
- **Rule 19 — Repository-level tenant scoping is documented, not enforced in this spec**: ARC-015 makes `tenantId` available via `req.user.tenantId` and adds ESLint guidance in the backend blueprint stating that bounded-context repositories must filter by `tenantId` in every query. The actual enforcement (a `TenantScopedRepository` base class or middleware) is a follow-up ARC-011 / Sprint 2 story. The acceptance test for ARC-015 confirms the guard plumbing works; it does not test tenant-scoping in queries (the queries do not exist yet).
- **Rule 20 — `IdentityModule` is wired but exports only public contracts**: `apps/api/src/modules/identity/identity.module.ts` declares `imports: [PassportModule, JwtModule.registerAsync({ useExisting: JwtConfig })]` and `providers: [JwtStrategy, LocalAuthService]`. The `Strategies` and `LocalAuthService` are exported through `public/` so ARC-014's controller can inject them. `JwtAuthGuard` and `RolesGuard` are exported from `shared/guards/` (not from `identity/`) and registered as `APP_GUARD` once globally.

### ARC-036 — Health checks (Terminus)

- **Rule 21 — Two endpoints, two purposes**: `GET /health/live` always returns 200 as long as the Node process is responsive. The handler runs `MemoryHealthIndicator.checkHeap('memory_heap', 200 * 1024 * 1024)` and `MemoryHealthIndicator.checkRSS('memory_rss', 300 * 1024 * 1024)`. If either check fails, the response is 503 with the Terminus error envelope { `status: 'error', info: {}, error: { memory_heap: { message: '...' } } }`. `GET /health/ready` checks Prisma, S3, memory, and disk; on any failure it returns 503.
- **Rule 22 — `PrismaHealthIndicator` runs a 1-second `SELECT 1`**: `apps/api/src/modules/health/indicators/prisma.health.ts` calls `prisma.$queryRaw\`SELECT 1\`` with a 1-second timeout. On success, the indicator returns `{ database: { status: 'up' } }`. On failure (timeout, connection error, query error), it throws `HealthCheckError` with `{ database: { status: 'down', error: '<message>' } }`.
- **Rule 23 — `S3HealthIndicator` runs `HeadBucket` with a 2-second timeout**: `apps/api/src/modules/health/indicators/s3.health.ts` constructs an `S3Client` from `S3Config` and calls `s3.send(new HeadBucketCommand({ Bucket: cfg.bucketName }))` with a 2-second timeout. On success, `{ photo_bucket: { status: 'up' } }`. On failure, `HealthCheckError` with `{ photo_bucket: { status: 'down', error: '<message>' } }`. The indicator is **not** fatal in Sprint 1 — if S3 is unreachable, `/health/ready` returns 503, but the API keeps running (eventual consistency is acceptable for S3).
- **Rule 24 — `S3Config` typed config is added in this spec**: `apps/api/src/config/s3.config.ts` declares `@IsString()` `S3_BUCKET`, `AWS_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (ADR-16 pattern). The class is registered in `AppConfigModule.providers` and exported globally.
- **Rule 25 — `HealthController` lives in `src/modules/health/`**: `apps/api/src/modules/health/inbound-adapters/health.controller.ts` declares `@Controller('health')` with `@Get('live')` and `@Get('ready')` decorated with `@HealthCheck()`. The controller injects `HealthCheckService`, `MemoryHealthIndicator`, `DiskHealthIndicator`, `PrismaHealthIndicator`, `S3HealthIndicator`.
- **Rule 26 — Memory and disk thresholds are tunable constants**: `HEALTH_MEMORY_HEAP_LIMIT_BYTES = 200 * 1024 * 1024`, `HEALTH_MEMORY_RSS_LIMIT_BYTES = 300 * 1024 * 1024`, `HEALTH_DISK_THRESHOLD_PERCENT = 0.9`. Exported from `apps/api/src/modules/health/health.constants.ts` so the runbook can document them and the team can tune them in one place.
- **Rule 27 — `/health/*` and `/.well-known/*` are not protected by the global guard**: The `JwtAuthGuard` (registered as `APP_GUARD`) is bypassed for `/health/live`, `/health/ready`, `/.well-known/jwks.json`, and `/.well-known/wendy-configuration`. The bypass is implemented via `Reflector` in `JwtAuthGuard` (using a `@Public()` decorator) or by adding the paths to the global guard's `exclude` list. The chosen approach is documented in the tech spec.
- **Rule 28 — `/health/ready` is the ALB target group probe**: The ECS task definition (delivered by OPS-011) configures the ALB target group health check as `GET /health/ready` with interval 30 s, timeout 5 s, healthy threshold 2, unhealthy threshold 3. The developer runbook (delivered by OPS-029) documents that a 503 from `/health/ready` drains the task from the ALB; the container is not restarted unless `/health/live` fails.
- **Rule 29 — Both endpoints are unauthenticated**: No JWT, no API key. The ALB security group is the only network-level restriction. No payload leaked beyond `status: 'up' | 'down'` and the indicator name (`memory_heap`, `database`, `photo_bucket`, etc.).
- **Rule 30 — Unit tests for each indicator**: For each indicator (`PrismaHealthIndicator`, `S3HealthIndicator`), at least one "healthy" and one "unhealthy" test using `@nestjs/testing`'s `Test.createTestingModule({ providers: [Indicator, ...] })` with mocked dependencies. The test for `HealthController` issues a supertest request and asserts 200 / 503 on the happy / sad paths.

### Cross-cutting

- **Rule 31 — Backend blueprint compliance**: The new files follow `3-architecture/3.2-blueprints/backend-blueprint.md` §3 (Scaffolding) and §6 (Cross-cutting Concerns). Specifically:
  - `apps/api/src/config/jwt.config.ts` and `apps/api/src/config/s3.config.ts` follow the `config + service` pattern.
  - `apps/api/src/shared/jwt/jwt.service.ts` lives in `shared/jwt/` (new shared subfolder).
  - `apps/api/src/shared/passwords/password-hasher.service.ts` lives in `shared/passwords/` (new shared subfolder).
  - `apps/api/src/shared/guards/jwt-auth.guard.ts`, `roles.guard.ts`, `decorators/roles.decorator.ts`, `decorators/current-user.decorator.ts` live in `shared/`.
  - `apps/api/src/modules/identity/strategies/jwt.strategy.ts` lives in `modules/identity/strategies/`.
  - `apps/api/src/modules/health/indicators/prisma.health.ts` and `s3.health.ts` replace the existing stub in `modules/health/`.
- **Rule 32 — No public endpoint surface changes**: `/health/*` and `/.well-known/*` are infrastructure endpoints — they are not part of `/api/v1/*`. The existing versioned-API convention is preserved.
- **Rule 33 — No new bounded-context tables**: This spec does not add tables or migrations. Refresh-token revocation is in-memory (Rule 8). The `revoked_refresh_tokens` table, when it ships, is ARC-014's follow-up or a new ARC.
- **Rule 34 — `pnpm` scripts on day one**: `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm --filter @wendy/api test`, `pnpm --filter @wendy/api test:e2e`, `pnpm --filter @wendy/api build` all succeed on a clean clone. Three new dependencies are added: `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/jwt`, `@nestjs/terminus`, `@aws-sdk/client-s3`, `bcrypt`, `jsonwebtoken` (peer of `passport-jwt`).

> ⚠️ Assumption — the SMTP / email layer is not in scope. `passport-local` is rejected (ADR-15 §What about passport-local) because the session model doesn't fit. The `LocalAuthService` (ARC-015 Rule 18) is the canonical credential-verification site.

> ⚠️ Assumption — the `@Public()` decorator is adopted over configuring `APP_GUARD` exclusions; the former is more idiomatic with NestJS and survives module refactors. If the team prefers the latter, the code change is local.

> ⚠️ Assumption — in-memory `revoked_jtis` is acceptable for Sprint 1 because the API runs as a single ECS service with one task. The Revocation story (`Set<string>`) is documented as a known limitation; ARC-014 may add a follow-up to use a `revoked_refresh_tokens` table.

## User Experience Notes

Not applicable in the strict sense — these are infrastructure stories. The "user experience" is the developer experience:

- A developer generating a local RS256 key pair with `openssl genrsa -out jwt-private.pem 2048` and exporting `JWT_PRIVATE_KEY_PEM=$(cat jwt-private.pem)` and `JWT_KEY_ID=$(uuidgen)` can boot the API in < 30 s.
- `curl http://localhost:3000/health/live` returns `{"status":"up","info":{"memory_heap":{"status":"up"},"memory_rss":{"status":"up"}},"error":{},"details":{...}}` within 100 ms.
- `curl http://localhost:3000/health/ready` returns 200 when Postgres 15 (from OPS-023) is up and the S3 mock (MinIO if used, or `wp-photos-prod` in dev) is reachable; otherwise 503 with the failing indicator in the body.
- `curl http://localhost:3000/.well-known/jwks.json` returns a JWKS document with one entry (`kid = <JWT_KEY_ID>`).
- `curl http://localhost:3000/.well-known/wendy-configuration` returns the URL map from ADR-05.
- A unit test that issues a JWT with `JwtService.signAccessToken({ sub: 'u1', role: 'WeddingPlanner', tenantId: 't1' })` and verifies it via `JwtService.verifyAccessToken` returns the original payload.
- A unit test that calls `RolesGuard.canActivate` with `req.user.role = 'WeddingPlanner'` and the route's `@Roles('Administrator')` returns `false` and the controller returns 403.

No user-facing UI components, no form validation, no i18n user-facing message catalogs are in scope here. The login screen, the WP onboarding form, and the admin user list arrive in Sprint 2 (ARC-017, US-001, US-002, etc.).
