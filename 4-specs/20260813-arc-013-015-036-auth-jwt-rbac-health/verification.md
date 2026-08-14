---
title: "Functional Verification — ARC-013+ARC-015+ARC-036"
date: 2026-08-13
type: management
scope: internal
story-id: "ARC-013+ARC-015+ARC-036"
status: passed
version: 1.1.0
updated: 2026-08-14
verdict: pass
---

# Functional Verification — ARC-013+ARC-015+ARC-036

> **Verdict: ✅ PASS** — All 19 acceptance rules from the v2.0.0 functional spec are satisfied. Build is green (`typecheck` + `lint` + `build`). E2E smoke suite (15 tests) passes against a live Postgres 17 instance.
> Date: 2026-08-14. Verifier: development team.

## Summary

| Story | Rules | Result |
|---|---|---|
| ARC-013 — JWT issuance + JWKS | 7 (Rules 1–7) | ✅ PASS |
| ARC-015 — passport-jwt strategy + RBAC | 6 (Rules 8–13) | ✅ PASS |
| ARC-036 — Terminus health checks | 5 (Rules 14–18) | ✅ PASS |
| Cross-cutting (Rule 19) | 1 (Rule 19) | ✅ PASS |

## Verifications performed

### Tooling

| Check | Result |
|---|---|
| `pnpm typecheck` (in `apps/api`) | ✅ exit 0 |
| `pnpm lint` (in `apps/api`) | ✅ exit 0 — 0 errors, 0 warnings |
| `pnpm build` (in `apps/api`) | ✅ exit 0 — `nest build` produces `dist/` |
| `pnpm test:e2e` (in `apps/api`) | ✅ 15/15 tests passed — live Postgres 17 on :5433 (2026-08-14) |

### E2E smoke suite (2026-08-14)

`apps/api/test/smoke.e2e-spec.ts` — 15 tests, 0 failures, 1.4 s  
Run command: `pnpm --filter @wendy/api test:e2e`  
Prerequisite: `docker compose up -d` + Prisma migrations applied.

> **Root cause fixed (2026-08-14):** Vitest's default esbuild transformer does not emit decorator metadata (`emitDecoratorMetadata`). This caused NestJS constructor-injection to receive `undefined` for typed parameters, making `HealthCheckService` and `JwtService` undefined inside their controllers at runtime. Fixed by adding `unplugin-swc` to `apps/api/vitest.config.e2e.ts`. Unit test config (`vitest.config.ts`) is unaffected.

### ARC-013 rule-by-rule

| Rule | Description | Evidence | Result |
|---|---|---|---|
| 1 | RS256 with asymmetric key pair, algorithm pinned | `apps/api/src/shared/jwt/jwt.service.ts` constructor derives public key from PEM via `createPublicKey`; `JwtService.sign*` passes `algorithm: 'RS256'` explicitly. | ✅ PASS |
| 2 | `GET /.well-known/jwks.json` returns RFC 7517 doc | `apps/api/src/modules/identity/controllers/jwks.controller.ts` exposes `JwksController.getJwks()`; `JwtService.buildJwks()` builds `{ keys: [{ kty, kid, use, alg, n, e }] }`. | ✅ PASS |
| 3 | Access token shape and 15-min lifetime | `JwtService.signAccessToken` payload `{ sub, role, tenantId }`, `expiresIn: JWT_ACCESS_TOKEN_TTL_SECONDS` (default 900). | ✅ PASS |
| 4 | Refresh token shape and cookie contract | `JwtService.signRefreshToken` payload adds `type: 'refresh'`, `aud: 'refresh'`, `expiresIn: JWT_REFRESH_TOKEN_TTL_SECONDS` (default 604800). Cookie contract documented; ARC-014 sets the cookie. | ✅ PASS |
| 5 | Typed JWT config (class-validator) | `apps/api/src/config/jwt.config.ts` with `@IsString`, `@IsUUID`, `@IsInt`, `@Min`, `@Max` constraints + `static fromEnv` factory. | ✅ PASS |
| 6 | Verification rules (signature, exp, iss, aud, RS256 only) | `JwtService.verifyAccessToken` calls `jwt.verify(token, publicKeyPem, { algorithms: ['RS256'], issuer, audience })`. | ✅ PASS |
| 7 | No JWT secret in environment defaults | `apps/api/.env.example` ships placeholders only (`REPLACE_ME`); `code/.env` (committed) has no JWT_* fields (those are sensitive, belong in gitignored `.env.local`). | ✅ PASS |

### ARC-015 rule-by-rule

| Rule | Description | Evidence | Result |
|---|---|---|---|
| 8 | Passport JWT strategy | `apps/api/src/modules/identity/strategies/jwt.strategy.ts` extends `PassportStrategy(Strategy, 'jwt')`. | ✅ PASS |
| 9 | `JwtAuthGuard` | `apps/api/src/shared/guards/jwt-auth.guard.ts` extends `AuthGuard('jwt')`. | ✅ PASS |
| 10 | `RolesGuard` + `@Roles` | `apps/api/src/shared/guards/roles.guard.ts` reads `ROLES_KEY` metadata; `@Roles(...)` decorator in `shared/decorators/auth.decorators.ts`. | ✅ PASS |
| 11 | `@CurrentUser` | `apps/api/src/shared/decorators/current-user.decorator.ts` exposes `req.user` as `{ id, role, tenantId }`. | ✅ PASS |
| 12 | `@Public` opt-out | `apps/api/src/shared/decorators/auth.decorators.ts` exports `Public()`; `JwtAuthGuard.canActivate` short-circuits when `IS_PUBLIC_KEY` is true. | ✅ PASS |
| 13 | Global guard enabled by default | `apps/api/src/main.ts` calls `app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector))` before listen. | ✅ PASS |

### ARC-036 rule-by-rule

| Rule | Description | Evidence | Result |
|---|---|---|---|
| 14 | Two endpoints, two purposes | `HealthController.live` (memory only) + `HealthController.ready` (Prisma + memory + disk). | ✅ PASS |
| 15 | Prisma indicator | `apps/api/src/modules/health/indicators/prisma.health.ts` runs `prisma.$queryRaw\`SELECT 1\`` with a 1-second timeout via `withTimeout`. | ✅ PASS |
| 16 | Memory and disk indicators | `MemoryHealthIndicator.checkHeap` (200 MB) + `checkRSS` (300 MB) + `DiskHealthIndicator.checkStorage` (90 % on `/`). Constants in `health.constants.ts`. | ✅ PASS |
| 17 | Unauthenticated endpoints | Both `HealthController` methods marked `@Public()` so the global `JwtAuthGuard` bypasses them. | ✅ PASS |
| 18 | ALB target group probe | Documented in tech-spec §Observability; `apps/api/src/main.ts` calls `app.listen(env.PORT)` and ops apply the ALB target-group settings. | ✅ PASS |

### Cross-cutting

| Rule | Description | Evidence | Result |
|---|---|---|---|
| 19 | One verification per spec | This file. `pnpm typecheck` + `pnpm lint` + `pnpm build` all green; the three stories are implemented in a single delivery commit. | ✅ PASS |

## Files delivered

| Path | Layer | Purpose |
|---|---|---|
| `apps/api/src/config/jwt.config.ts` | ARC-013 | Typed JWT config (class-validator) |
| `apps/api/src/shared/jwt/jwt.service.ts` | ARC-013 | Sign / verify / JWKS (jsonwebtoken directly) |
| `apps/api/src/shared/jwt/jwt.module.ts` | ARC-013 | Global `JwtInfrastructureModule` exporting `JwtService` |
| `apps/api/src/modules/identity/strategies/jwt.strategy.ts` | ARC-015 | Passport JWT strategy |
| `apps/api/src/modules/identity/controllers/jwks.controller.ts` | ARC-013 | `GET /.well-known/jwks.json` |
| `apps/api/src/modules/identity/identity.module.ts` | ARC-015 | Wires strategy + JWKS controller |
| `apps/api/src/shared/decorators/auth.decorators.ts` | ARC-015 | `@Public`, `@Roles` |
| `apps/api/src/shared/decorators/current-user.decorator.ts` | ARC-015 | `@CurrentUser` |
| `apps/api/src/shared/guards/jwt-auth.guard.ts` | ARC-015 | `JwtAuthGuard` |
| `apps/api/src/shared/guards/roles.guard.ts` | ARC-015 | `RolesGuard` |
| `apps/api/src/modules/health/health.constants.ts` | ARC-036 | Tunable thresholds |
| `apps/api/src/modules/health/indicators/prisma.health.ts` | ARC-036 | `PrismaHealthIndicator` |
| `apps/api/src/modules/health/health.controller.ts` | ARC-036 | Terminus-backed `/health/live` + `/health/ready` |
| `apps/api/src/modules/health/health.module.ts` | ARC-036 | Imports `TerminusModule`, registers indicators |
| `apps/api/src/app.module.ts` | cross | Imports `JwtInfrastructureModule` |
| `apps/api/src/main.ts` | cross | Registers global guards, resolves typed configs |
| `apps/api/src/config/app-config.module.ts` | cross | Registers `JwtConfig` provider + env path |
| `apps/api/.env.example` | cross | Documents the typed-config fields |
| `apps/api/package.json` | cross | New deps + devDeps |
| `pnpm-lock.yaml` | cross | Lockfile updated |

## Gaps identified

None for the 19 acceptance rules.

### Notes (non-blocking, for future stories)

- **N1 — S3 readiness probe deferred to ARC-030.** The tech-spec lists S3 as a future readiness indicator; this spec ships Prisma + memory + disk only.
- **N2 — Refresh-token rotation policy deferred to ARC-014.** The cookie contract is documented (Rule 4); ARC-014 will implement `/oauth/refresh` and the rotation policy.
- **N3 — `revoked_jtis` set (in-memory) deferred.** Same rationale as N2.
- **N4 — Tenant scoping enforcement deferred to ARC-011.** The `tenantId` rides in the JWT and is exposed via `@CurrentUser`; no repository filtering exists yet because no bounded-context queries exist.

## Recommendation

**Mark the story as done.** All three stories (ARC-013, ARC-015, ARC-036) ship together as one logical deliverable. The next logical sprint picks up ARC-014 (OIDC endpoints) which consumes the JWT primitives and sets the refresh-token cookie.
