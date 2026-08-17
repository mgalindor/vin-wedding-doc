---
title: "Backend Tier Blueprint"
date: 2026-08-11
type: architecture
scope: internal
version: 1.3.0
updated: 2026-08-17
tier: backend
revision-history:
  - v1.3.0 (2026-08-17): added §7.1 Test File Layout & Naming, §7.2 Test Scripts, §7.3 Breaking Tests From Earlier Specs — establishes the project-wide convention that the directory is the layer and the NNN in the file name is the TC ID from the spec's verification-summary.
  - v1.2.0 (2026-08-12): added explicit subfolders for future shared services (prisma, s3, secrets) and documented the "config + service" pattern. Fixes the small inconsistency in v1.1.3 where the comment said "PrismaService, S3Client" live in shared/ but only four subfolders (guards/interceptors/errors/events) were listed.
  - v1.1.3 (2026-08-11): prior version
---

# Backend Tier Blueprint

> Concise technical guide for the NestJS API tier (`apps/api/`). Read this end-to-end before opening a PR that touches backend code.
> Length: ~8 minutes. Operational commands and CI/CD steps live in `apps/api/README.md`, not here.

## 1. Runtime & Platform

| Dimension | Value |
|-----------|-------|
| Language | TypeScript 5.x (`experimentalDecorators`, `emitDecoratorMetadata`) |
| Runtime | Node.js 22 LTS |
| Platform | AWS ECS Fargate behind an ALB (multi-stage Docker image) |
| Build & PM | pnpm 9.x — monorepo workspaces (ADR-12) |

---

## 2. Tech Stack

| Library / Tool | Version | Purpose |
|----------------|---------|---------|
| `nestjs` | 11.x | Modular monolith framework — one `@Module` per bounded context |
| `@prisma/client` + `prisma` | 5.x | Type-safe ORM + versioned SQL migrations (ADR-11) |
| `class-validator` + `class-transformer` | latest | Request DTO validation; DTOs reused on the FE (ADR-14) |
| `@nestjs/passport` + `passport-jwt` | latest | JWT validation (RS256, JWKS); canonical NestJS recipe (ADR-15) |
| `@nestjs/terminus` | latest | `/health/live` + `/health/ready` with custom Prisma/S3 indicators (ADR-17) |
| `nestjs-pino` | latest | Structured JSON logging to stdout (CloudWatch-aggregated) |
| `@nestjs/swagger` | latest | OpenAPI 3 generated from the same DTO classes |
| `@aws-sdk/client-s3` | 3.x | Presigned PUT/GET URL issuance |
| `bcrypt` | 5.x | Password hashing at cost factor 12 (ADR-05) |
| `nanoid` | 5.x | 10-char URL-safe IDs as primary keys (ADR-13) |
| `@nestjs/testing` | latest | NestJS-specific glue (`Test.createTestingModule()`, `.overrideProvider()`) — used **inside** test files. See [NestJS testing docs](https://docs.nestjs.com/fundamentals/testing). |
| `vitest` + `supertest` | latest | Generic test runner + HTTP-level adapter calls. Vitest discovers `*.spec.ts`, runs `describe` / `it` / `expect`; supertest drives HTTP. Vitest is API-compatible with `@nestjs/testing`, so every NestJS pattern applies. |
| `eslint` + `@typescript-eslint` | latest | Linting; enforces no-cross-workspace and no-cross-context-internal imports (ADR-12) |

---

## 3. Scaffolding

**Architecture style:** hexagonal modular monolith — one `@Module` per bounded context with five folders: `domain` / `application` / `inbound-adapters` / `outbound-adapters` / `public`. The `public/` folder is the only entry point for sibling contexts.

```
src/
├── modules/
│   ├── {bounded-context}/       # one @Module per context (ADR-09)
│   │   ├── domain/              # entities, value objects, domain events (PRIVATE)
│   │   ├── application/         # use cases + port interfaces (PRIVATE)
│   │   ├── inbound-adapters/    # controllers, other entry points (PRIVATE)
│   │   ├── outbound-adapters/   # Prisma repos, S3, external clients (PRIVATE)
│   │   ├── public/              # cross-module contracts (use cases, DTOs, domain)
│   │   └── {context}.module.ts  # exports only the public surface
│   ├── identity/                # JWT issuance, users, passwords
│   ├── weddings/                # Wedding aggregate + per-template payload
│   └── ...                      # guests, invitation, photos, audit — same pattern
├── shared/                      # cross-context singletons (runtime services + cross-cutting concerns)
│   ├── guards/                  # JwtAuthGuard, PublicTokenGuard, RolesGuard
│   ├── interceptors/            # audit, traceId, response envelope
│   ├── errors/                  # DomainError taxonomy + envelope mapper
│   ├── events/                  # in-process EventEmitter wiring
│   ├── prisma/                  # PrismaService (ARC-008)              ← @Injectable runtime client
│   ├── s3/                      # S3Service       (ARC-029)             ← @Injectable runtime client
│   └── secrets/                 # SecretsManagerService (ARC-013)      ← @Injectable runtime client
├── config/                      # typed config classes (ADR-16), one per domain
│   ├── env.config.ts            # generic env vars (NODE_ENV, PORT, LOG_LEVEL)
│   ├── database.config.ts       # DATABASE_URL, DB_POOL_SIZE            (ARC-008)
│   ├── jwt.config.ts            # RS256 keys, issuer, ttl              (ARC-013)
│   ├── s3.config.ts             # bucket, region, access keys          (ARC-029)
│   └── secrets.config.ts        # Secrets Manager config              (ARC-013)
├── health/                      # Terminus controller + custom Prisma/S3 indicators (ADR-17)
└── main.ts                      # bootstrap: ValidationPipe + pino + Swagger + Sentry
```

### The "config + service" pattern

Every external connection (Prisma, S3, Secrets Manager, future Redis, etc.) follows the same two-file pattern:

| File | Responsibility | Depends on |
|---|---|---|
| `src/config/X.config.ts` | Typed config class with `class-validator` decorators. Validates env vars on boot (ADR-16). Fails fast if a required value is missing. | `process.env` |
| `src/shared/X/x.service.ts` | `@Injectable()` runtime service that uses the config to construct the real client (Prisma, AWS SDK, etc.). Exposed to bounded contexts via NestJS DI. | `X.config.ts` |

Example for S3 (planned for ARC-029):

```ts
// src/config/s3.config.ts
@Injectable()
export class S3Config {
  @IsString() S3_BUCKET!: string;
  @IsString() AWS_REGION!: string;
  @IsString() S3_ACCESS_KEY_ID!: string;
  @IsString() S3_SECRET_ACCESS_KEY!: string;
  static fromEnv(env = process.env): S3Config { /* ... */ }
}

// src/shared/s3/s3.service.ts
@Injectable()
export class S3Service {
  private readonly client: S3Client;
  constructor(config: S3Config) {
    this.client = new S3Client({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.S3_ACCESS_KEY_ID,
        secretAccessKey: config.S3_SECRET_ACCESS_KEY,
      },
    });
  }
  presignPut(key: string, contentType: string): string { /* ... */ }
}
```

**Why this pattern:** bounded contexts depend on `S3Service` (the runtime adapter), not on `S3Config` (the values). The two files share the same prefix (`s3.`) so the relationship is obvious in the file tree.

---

## 4. Internal Layers

| Layer | Responsibility | Cannot |
|-------|---------------|--------|
| Domain (PRIVATE) | Pure entities, value objects, domain events. Encodes invariants. | Import from any other layer; call external services; touch the DB. |
| Application (PRIVATE) | Use cases. Orchestrates domain objects through port interfaces. | Contain HTTP concerns; access the DB directly; import NestJS primitives except `@Injectable`. |
| Inbound adapters (PRIVATE) | Controllers and other entry points. Translates HTTP/DTO into use case inputs. | Contain business rules; access the DB directly; import other contexts' internals. |
| Outbound adapters (PRIVATE) | Repositories (Prisma), S3 client, external HTTP — implements the ports declared in `application/`. | Contain business rules; be imported by sibling contexts. |
| Public API | Contracts exposed to sibling modules: concrete use case classes (injectable), DTOs for cross-module data, read-only domain objects. | Expose internal adapters, internal ports, or implementation details. |

---

## 5. Data Flow

**Typical request flow:**

```
HTTP Request → Controller (inbound-adapter) → Use Case (application)
  → Port interface (application) → Outbound adapter → PostgreSQL / S3
```

**Module communication:** sibling contexts import only from `modules/{context}` (resolved through `public/`); ESLint rules prevent direct imports of any internal folder. Cross-context reactions (`wedding.published` → `audit.log` + `photos.ensurePrefix`) flow through `@nestjs/event-emitter`; the publishing context does not know the subscribers.

---

## 6. Cross-cutting Concerns

### Logging
- Mechanism: `nestjs-pino` — structured JSON to stdout
- Location: registered globally in `main.ts`; per-service `Logger` injected via `@nestjs/common`
- Rule: log at request entry/exit with `traceId`; never log passwords, JWT secrets, or guest PII

### Error Handling
- Mechanism: typed `DomainError` taxonomy (`NotFoundError`, `QuotaExceededError`, …) → mapped by an exception filter to `{ code, message, details?, traceId }`
- Location: `shared/errors/` + global filter in `shared/interceptors/`
- Rule: domain errors bubble up; infra errors are wrapped as `DomainError` before reaching the application layer

### Validation
- Mechanism: `class-validator` decorators on DTOs from `@wendy/contracts`; global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`
- Location: `main.ts` (global pipe); DTOs in `packages/contracts/src/dtos/`
- Rule: validate at the boundary; trust internally — never re-validate domain entities constructed by the application layer

### Authentication (AuthN)
- Mechanism: `@nestjs/passport` `JwtStrategy` (RS256, JWKS) for internal users; `PublicTokenStrategy` for invitation/photo-album tokens (ADR-15)
- Location: `modules/identity/strategies/`; guards in `shared/guards/`
- Rule: protected routes declare `@UseGuards(JwtAuthGuard)`; public routes declare `@UseGuards(PublicTokenGuard)`; `/health/*` and `/.well-known/*` opt out

### Authorization (AuthZ)
- Mechanism: `RolesGuard` reading `role` from the JWT payload
- Location: `shared/guards/roles.guard.ts`; declared alongside `JwtAuthGuard`
- Rule: role comes from the auth context, never from the request body; controllers check `@Roles(...)`; sensitive use cases may re-check inside the service

### Audit
- Mechanism: `AuditEvent` row written in the same DB transaction as the audited action
- Location: `modules/audit/` + interceptor at `shared/interceptors/audit.interceptor.ts`
- Rule: append-only (no UPDATE/DELETE from app code); every critical action (publish, RSVP, photo moderation, password reset) emits an event

### Configuration
- Mechanism: typed config classes per ADR-16 — `class-validator` + `class-transformer` + `static fromEnv()` factory
- Location: `config/` (one class per domain); registered globally via `AppConfigModule`
- Rule: inject by class type, not by string key; missing env vars crash the boot with a clear error

### Health
- Mechanism: `@nestjs/terminus` with `PrismaHealthIndicator` + `S3HealthIndicator` (ADR-17)
- Location: `health/health.controller.ts`; mounted at `/health/live` and `/health/ready`
- Rule: liveness is cheap (memory only); readiness checks Prisma + S3; both unauthenticated

---

## 7. Testing Strategy

> **Source of truth:** the official NestJS testing guide — <https://docs.nestjs.com/fundamentals/testing#end-to-end-testing> (E2E section). Vitest is API-compatible with `@nestjs/testing`, so every pattern there (unit, integration, E2E, scoped providers, request-scoped testing) applies directly.
>
> **There is no NestJS-native HTTP client for E2E.** `@nestjs/testing` bootstraps the app; `supertest` drives the HTTP calls. The official E2E recipe uses both — they are not alternatives.
>
> **Two libraries, two roles** (used together — neither replaces the other):
>
> - **`@nestjs/testing`** is the NestJS-specific glue used **inside** test files. It provides `Test.createTestingModule()` and `.overrideProvider().useValue()` to build a test module without booting the whole app.
> - **`vitest`** is the generic test runner. It discovers `*.spec.ts`, runs `describe` / `it` / `expect`, and reports results. It is not aware of NestJS.
> - **`supertest`** drives HTTP-level calls when testing controllers or E2E flows (canonical HTTP driver in the NestJS docs).
>
> **Canonical recipes per tier** (full details in the NestJS docs):
>
> - **Unit:** `Test.createTestingModule({ providers: [UseCase] }).compile()` — register only the unit under test, mock its ports with `.overrideProvider(PortToken).useValue(fake)`.
> - **Adapter:** `Test.createTestingModule({ controllers: [X], providers: [{ provide: UseCase, useValue: mockUseCase }] }).compile()` — same shape, swap providers for mocks, drive the HTTP surface via supertest.
> - **E2E:** `Test.createTestingModule(AppModule).overrideProvider(PrismaService).useValue(testPrisma).compile()` → `app = moduleRef.createNestApplication()` → `await app.init()` → `request(app.getHttpServer())` (supertest) → `await app.close()` in `afterAll`.

| Type | What | Tool | NOT tested here |
|------|------|------|-----------------|
| Unit | Use cases (application layer), services in isolation, error mapping, config class validation. Domain invariants are exercised indirectly through use case tests. | Vitest | Adapters, DB, HTTP stack, file I/O |
| Adapter | Controllers with mocked use cases (validations, exception mapping, guards); repositories against real PostgreSQL (queries, migrations, constraints); guards/strategies with mocked JWT. | Vitest + supertest + testcontainers + Prisma | Full app boot, full user flow, UI rendering |
| End-to-end | Full HTTP flow against a bootstrapped Nest app + test DB. Reserved for the primary journeys in §6 of the architecture document. | Supertest against `Test.createTestingModule(AppModule).compile()` | Internal implementation details, edge cases already covered by unit / adapter tests |

### 7.1 Test File Layout & Naming (project-wide)

**The directory is the layer — never encode layer in the file name.**

| Layer | Path | Runner |
|-------|------|--------|
| Unit (BE, alongside code) | `apps/api/src/**/*.spec.ts` | Vitest |
| Unit (BE, cross-cutting) | `apps/api/test/functional/tc-NNN-*.spec.ts` | Vitest |
| Adapter (BE) | `apps/api/test/integration/tc-NNN-*.spec.ts` | Vitest + supertest + testcontainers |
| Unit (FE) | `apps/web/src/**/*.spec.ts(x)` | Vitest + Testing Library |
| End-to-end (FE) | `apps/web/tests/e2e/tc-NNN-*.spec.ts` | Playwright |

**File name:** `<scope>-<NNN>-<kebab-description>.spec.ts`

- `scope` = `tc` for a verification test case. Future: `it-NNN` for integration contract, `e2e-NNN` if Playwright projects multiply.
- `NNN` is **the test case ID from the spec's `verification-summary.md`**, not a consecutive counter. e.g. TC-101 → `tc-101-...spec.ts`. If a spec has no TC entry, mint one in its verification-summary first.
- `kebab-description` names the component or flow under test (e.g. `authenticate-use-case`, `oauth-token-controller`, `token-lifetime`).

**Why the directory, not the number:** earlier drafts proposed ranges like `tc-0xx = unit, tc-1xx = adapter`. This is fragile (you run out of 0xx; you can't tell `tc-100` apart from a TC number). The parent directory is the source of truth.

### 7.2 Test Scripts (`apps/api/package.json`)

| Command | What it runs |
|---------|--------------|
| `pnpm test` | unit + functional |
| `pnpm test:unit` | functional only |
| `pnpm test:watch` | functional in watch mode |
| `pnpm test:integration` | adapter against real Postgres |
| `pnpm test:integration:watch` | adapter in watch mode |
| `pnpm test:integration:debug` | adapter with verbose reporter |
| `pnpm test:all` | unit + integration |

> **Note on `test:e2e`:** the backend `test:e2e` script was renamed to `test:integration` in commit `f8e9b3a` because it runs **adapter** tests (NestJS bootstrap + Postgres, no browser), not end-to-end. The frontend `test:e2e` (in `apps/web`) remains — that one IS end-to-end via Playwright.

### 7.3 When a New Spec Breaks Tests From an Earlier Spec

Business rules change. Three responses, pick by intent:

1. **Update the test** — when the new rule replaces the old one. The commit message MUST list which TC IDs changed and reference the deprecating spec:

   ```
   feat(US-009): drop expires_in field, add refresh tokens

   Updates the following TC-IDs from US-006:
   - tc-002-token-lifetime.spec.ts: now asserts jti is present
   - tc-003-jwt-claims.spec.ts: drops the exp - iat === 3600 check

   Refs: US-006 v1.3.0 (deprecates 1h access-token contract).
   ```

2. **Mark `@deprecated`** — when both behaviours coexist temporarily (feature flag, gradual rollout). Use `it.skip()` or `describe.skip()` and leave the file in place as documentation.
3. **Delete** — only when the new test fully replaces the old and the behaviour it covered is now redundant.

The **`verification-summary.md` of the new spec MUST list** which TC-IDs from earlier specs are superseded. This keeps the trail of "what behaviour used to be tested" auditable.

**Coverage target:** unit tests for every use case; one adapter test per controller and per repository; one E2E test per primary scenario in §6 of the architecture document.

**Mocking rule:** mock at adapter boundaries — controllers mock use cases, use cases mock ports (or use in-memory fakes for ports), repositories hit a real test DB. Never mock domain logic.

**What not to test:** trivial getters/setters, third-party library internals, framework boilerplate, pure data classes with no behavior.

**Why three tiers and not four (unit / adapter / component / E2E):** NestJS exposes `@nestjs/testing` + `Test.createTestingModule(AppModule).overrideProvider(X).useValue(mock).compile()`, which lets you boot the whole app with selected providers mocked and call HTTP endpoints via supertest. That covers the "component test" use case, so we don't need a fourth category. Adapter tests stay focused on a single adapter with its closest neighbor mocked; E2E tests stay focused on the happy path of a primary journey. This keeps the mental model simple for a 2-person team.

---

## 8. Naming Conventions

- Files: `kebab-case.ts`. Classes: `PascalCase`. Functions/vars: `camelCase`. Constants: `UPPER_SNAKE_CASE`.
- Module folders: `domain/`, `application/`, `inbound-adapters/`, `outbound-adapters/`, `public/` (one per bounded context).
- DTOs: `packages/contracts/src/dtos/{context}/{verb}.dto.ts` (e.g. `weddings/create-wedding.dto.ts`).
- Branded IDs: `type XxxId = string & { readonly __brand: 'XxxId' }` minted via `nanoid<XxxId>()` (ADR-13).
- List queries: `ORDER BY created_at DESC, id ASC` (ADR-13 §Sorting).
- DB tables: snake_case via `@@map`; columns camelCase in Prisma.
- Module public surface: `modules/{context}/public/` re-exports the cross-module contracts (use cases, DTOs, domain objects); sibling contexts import only from there. ESLint boundary rules block direct imports of internal folders.

---

## Related Decisions

- [ADR-01 — Backend stack: NestJS](../3.3-decision-record/adr-01-backend-stack-nestjs.md)
- [ADR-05 — Authentication: JWT + bcrypt + OIDC-style URLs](../3.3-decision-record/adr-05-auth-jwt-bcrypt.md)
- [ADR-09 — Modular monolith: NestJS modules per bounded context](../3.3-decision-record/adr-09-modular-monolith-organization.md)
- [ADR-11 — Database versioning: Prisma Migrate](../3.3-decision-record/adr-11-database-versioning-prisma-migrate.md)
- [ADR-13 — ID generation: NanoId](../3.3-decision-record/adr-13-id-strategy-nanoid.md)
- [ADR-14 — Validation: class-validator](../3.3-decision-record/adr-14-validation-class-validator.md)
- [ADR-15 — Auth framework: passport-jwt](../3.3-decision-record/adr-15-auth-framework-passport.md)
- [ADR-16 — Configuration: typed config classes](../3.3-decision-record/adr-16-configuration-typed-classes.md)
- [ADR-17 — Health checks: Terminus](../3.3-decision-record/adr-17-health-checks-terminus.md)
