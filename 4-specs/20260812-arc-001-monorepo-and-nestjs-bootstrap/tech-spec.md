---
title: "Technical Specification — ARC-001+ARC-002+ARC-003: Bootstrap monorepo, ESLint boundaries, and NestJS API skeleton"
date: 2026-08-12
type: specification
scope: internal
story-id: "ARC-001+ARC-002+ARC-003"
status: draft
version: 1.0.0
updated: 2026-08-12
layers:
  backend: true
  frontend: false
  mobile: false
  tooling: true
---

# Technical Specification — ARC-001+ARC-002+ARC-003: Bootstrap monorepo, ESLint boundaries, and NestJS API skeleton

**Status: ⚠️ Draft**

---

## Scope

| Layer           | Affected | Justification                                                                                                              | foldername          |
| --------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Backend         | Yes      | ARC-003 generates the entire `apps/api/` NestJS application. The other two stories create the workspace that hosts it.    | `apps/api/`         |
| Frontend Web    | No       | ARC-004 ("Bootstrap Vite + React Web skeleton") is a separate story. The `apps/web/` directory is created but left empty here. | `apps/web/`         |
| Frontend Mobile | No       | Out of scope per the architecture document §2.1.                                                                          | —                   |
| Tooling         | Yes      | ARC-001 and ARC-002 create the monorepo root (`pnpm-workspace.yaml`, `package.json`, `tsconfig.base.json`, ESLint, Prettier) and the ESLint boundary rules. | repo root, `packages/contracts/` |

The monorepo root lives in the `code/` git submodule (see `gene2-config.yaml` — the `local: ./code/` entry points there).

---

## Architecture References

| Documents | Description |
|---|---|
| `3-architecture/3.1-architecture/architecture.md` | The overall architecture document. §5.1 lists the six bounded contexts; §5.2 documents the container view; §7.1 shows the deployment layout. |
| `3-architecture/3.3-decision-record/adr-12-monorepo-pnpm-workspaces.md` | ADR-12 — the authoritative source for the monorepo structure, `pnpm-workspace.yaml` contents, shared configs, and the ESLint boundary rules. |
| `3-architecture/3.3-decision-record/adr-09-modular-monolith-organization.md` | ADR-09 — the authoritative source for the NestJS module layout: bounded contexts as `@Module()` declarations with `domain` / `application` / `inbound-adapters` / `outbound-adapters` / `public` sub-folders. |
| `3-architecture/3.2-blueprints/backend-blueprint.md` | Backend tier blueprint — coding conventions, folder layout, layered architecture, naming, testing strategy. Authoritative for the `apps/api/` skeleton. |
| `3-architecture/3.3-decision-record/adr-14-validation-class-validator.md` | ADR-14 — explains why `experimentalDecorators: true` and `emitDecoratorMetadata: true` are required in the shared TS config. |
| `3-architecture/3.3-decision-record/adr-16-configuration-typed-classes.md` | ADR-16 — the typed config class pattern (`@Injectable()` + `class-validator` + `fromEnv()` factory). ARC-003 stubs one config class to validate the pattern. |
| `3-architecture/3.3-decision-record/adr-17-health-checks-terminus.md` | ADR-17 — the health-check endpoint contract (`/health/live`, `/health/ready`). ARC-003 ships minimal stubs; ARC-036 replaces them with Terminus. |
| `3-architecture/3.3-decision-record/adr-13-id-strategy-nanoid.md` | ADR-13 — branded ID types and `nanoid<XxxId>()` helpers. ARC-003 does not need branded IDs yet, but the helper module is laid out so ARC-005 can fill it in. |
| `3-architecture/3.1-architecture/architecture.md` §5.1 | The six bounded contexts: Identity & Access, Wedding Management, Guest Management, Invitation, Photo Storage, Audit. ARC-003 generates one `@Module()` per context. |

---

## Backend

### API Endpoints

No application endpoints are introduced by this story. Two health-check stubs are registered so the API can boot and respond:

**CREATE — `GET /health/live`**

Liveness probe — returns 200 if the Node.js process is running.

```yaml
# GET /health/live
security:
  type: public
  role: public
response:
  status: ok   # str, required, enum: [ok]
```

**CREATE — `GET /health/ready`**

Readiness probe — stub returns 200. ARC-036 will replace this body with Terminus indicators for Prisma + S3.

```yaml
# GET /health/ready
security:
  type: public
  role: public
response:
  status: ok   # str, required, enum: [ok]
```

---

### Database Changes

No database changes in this story. `apps/api/prisma/` is **not** created here — that is ARC-008's work. The `prisma` key is reserved in `package.json` for ARC-008.

---

### Events

No events are published or consumed in this story. The `@nestjs/event-emitter` module is **not** installed here — that is ARC-037's work. The module skeleton keeps cross-context communication open via the standard NestJS module graph for now.

---

### Third-party Integrations (Backend)

No third-party integrations. The `bcrypt`, `@aws-sdk/client-s3`, and other backend libraries from the blueprint are not installed here — those belong to the stories that use them (ARC-013, ARC-029, etc.).

---

## Frontend

Not applicable — `layers.frontend` is `false`. ARC-004 will create the `apps/web/` directory contents.

---

## Tooling

> This section covers the cross-cutting monorepo and lint setup that ARC-001 and ARC-002 deliver. The architectural documents treat this as part of the development environment rather than the runtime, but the configuration files are themselves part of the deliverable.

### Monorepo root layout (ARC-001)

The repository root contains:

| Path | Purpose |
|---|---|
| `package.json` | Workspace root. Declares pnpm scripts: `lint`, `typecheck`, `format`, `build`, `test`, `dev`, `clean`. |
| `pnpm-workspace.yaml` | Declares `apps/*` and `packages/*` as pnpm workspaces. |
| `pnpm-lock.yaml` | Generated by `pnpm install`. Checked in. |
| `tsconfig.base.json` | Shared compiler options: `target: ES2022`, `module: ESNext`, `moduleResolution: Bundler`, `strict: true`, `experimentalDecorators: true`, `emitDecoratorMetadata: true`, `esModuleInterop: true`. |
| `.eslintrc.cjs` | Base ESLint config — TypeScript + Prettier compatibility, with the boundary rules (see below). |
| `.prettierrc` | Shared Prettier config: `singleQuote: true`, `semi: true`, `trailingComma: "all"`, `printWidth: 100`. |
| `.gitignore` | Standard Node + pnpm + IDE ignores (`node_modules/`, `dist/`, `.env`, `.idea`, `.vscode/`, coverage). |
| `.editorconfig` | EOL + indentation consistency across editors. |
| `.npmrc` | pnpm settings: `auto-install-peers=true`, `strict-peer-dependencies=false`. |
| `README.md` | Brief: clone → `pnpm install` → `pnpm dev`. Replaced in detail by OPS-024 in a later iteration. |

### Workspace skeletons (ARC-001)

Three empty workspaces are created with minimal but valid `package.json` and `tsconfig.json`:

| Workspace | `package.json` `name` | Notes |
|---|---|---|
| `apps/api/` | `@wendy/api` | NestJS application — contents created by ARC-003. |
| `apps/web/` | `@wendy/web` | Empty in this story. Placeholder `package.json` with `private: true` so pnpm does not complain. ARC-004 fills it in. |
| `packages/contracts/` | `@wendy/contracts` | Empty in this story. Placeholder `package.json`. ARC-005 fills it in. |

Each workspace's `tsconfig.json` extends the root `tsconfig.base.json` and adds only what's specific (e.g. the API workspace sets `experimentalDecorators: true` explicitly, even though the base already has it, for clarity).

### ESLint boundary rules (ARC-002)

The base `.eslintrc.cjs` uses `eslint-plugin-import` with `no-restricted-paths` to enforce:

| Rule | Forbidden pattern | Scope |
|---|---|---|
| `apps/api` ⇏ `apps/web` | Any import path resolving under `apps/web/src/` from a file in `apps/api/src/` | `apps/api/src/**` |
| `apps/web` ⇏ `apps/api` | Any import path resolving under `apps/api/src/` from a file in `apps/web/src/` | `apps/web/src/**` |
| `packages/*` ⇏ `apps/*` | Any import path resolving under `apps/*/src/` from a file in `packages/*/src/` | `packages/*/src/**` |

The rule produces a one-line error naming the forbidden import path. `pnpm lint` exits non-zero on any violation. **Note:** this story only sets up the rule *for the existing files*. When new files are added inside `apps/api/src/modules/*/domain/` they are auto-covered by the `apps/api/src/**` glob; the rule does not need to be re-declared per-context.

A small `tools/eslint/boundary-rules.cjs` helper file holds the rule configuration so it can be unit-tested in isolation if needed (this is optional and lives outside the workspaces).

---

## Backend (continued) — NestJS skeleton (ARC-003)

### Folder structure (ARC-003)

`apps/api/` is generated with the structure promised by the backend blueprint §3 (Scaffolding):

```
apps/api/
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .eslintrc.cjs                      # extends root, re-applies boundary rules
├── src/
│   ├── main.ts                        # bootstrap: NestFactory, ValidationPipe, port
│   ├── app.module.ts                  # root @Module: imports all bounded-context modules
│   ├── common/                        # cross-cutting — empty folders, ready for ARC-035
│   │   ├── guards/                    # (empty) — JwtAuthGuard, RolesGuard in ARC-015
│   │   ├── interceptors/              # (empty) — traceId, audit in ARC-037
│   │   ├── errors/                    # (empty) — DomainError taxonomy in ARC-037
│   │   └── events/                    # (empty) — EventEmitter wiring in ARC-037
│   ├── modules/
│   │   ├── identity/                  # Identity & Access (ADR-09)
│   │   │   ├── identity.module.ts
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── inbound-adapters/
│   │   │   ├── outbound-adapters/
│   │   │   └── public/
│   │   ├── weddings/                  # Wedding Management
│   │   │   ├── weddings.module.ts
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── inbound-adapters/
│   │   │   ├── outbound-adapters/
│   │   │   └── public/
│   │   ├── guests/                    # Guest Management
│   │   ├── invitation/                # Invitation (public endpoints, RSVP)
│   │   ├── photos/                    # Photo Storage (presigned URLs, lifecycle)
│   │   ├── audit/                     # Audit (event log)
│   │   └── health/                    # health-check controller (replaces ARC-036 stub)
│   ├── infra/                         # adapters: prisma, s3, secrets — empty here, ARC-008+ fills
│   │   ├── prisma/                    # (empty)
│   │   ├── s3/                        # (empty)
│   │   └── secrets/                   # (empty)
│   └── config/                        # typed config classes (ADR-16)
│       ├── app-config.module.ts       # global @Module wiring typed configs
│       ├── app-config.service.ts      # AppConfigService root-level
│       ├── env.config.ts              # root @Injectable() config: PORT, NODE_ENV, LOG_LEVEL
│       └── index.ts                   # barrel re-export
└── prisma/                            # (NOT created here — ARC-008)
```

> **Note on the "7th" folder** (resolving the ⚠️ Assumption from the functional spec): the seven folders under `apps/api/src/modules/` are the **six bounded contexts** (`identity`, `weddings`, `guests`, `invitation`, `photos`, `audit`) plus `health` (the Terminus controller) which lives under `modules/` because it is a NestJS module in its own right. The `infra/` folder at the top level is the cross-cutting adapter layer, not a module.

### Module declarations (ARC-003)

Each bounded-context module file is the minimum valid `@Module()`:

```ts
@Module({})
export class IdentityModule {}
```

`app.module.ts` imports all of them:

```ts
@Module({
  imports: [
    AppConfigModule,
    IdentityModule,
    WeddingsModule,
    GuestsModule,
    InvitationModule,
    PhotosModule,
    AuditModule,
    HealthModule,
  ],
})
export class AppModule {}
```

### Bootstrap (ARC-003)

`src/main.ts` is the canonical NestJS entry point with the ADR-16 / ADR-14 wiring:

- `NestFactory.create(AppModule)`.
- `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))` — wired here so ARC-035 only needs to confirm decorators; the pipe is in place.
- `app.listen(port)` reading from the typed `EnvConfig` service.
- `process.on('unhandledRejection', ...)` and `process.on('uncaughtException', ...)` handlers that exit non-zero after logging.

### Typed config (ARC-003)

`src/config/env.config.ts` is the canonical example of ADR-16:

```ts
@Injectable()
export class EnvConfig {
  @IsEnum(['development', 'staging', 'production'])
  NODE_ENV!: 'development' | 'staging' | 'production';

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  LOG_LEVEL!: string;
}
```

The `AppConfigModule` uses `class-validator` + `class-transformer` to validate `process.env` on boot. Missing or invalid values throw a clear error before the HTTP server starts.

### Health stub (ARC-003)

`src/modules/health/health.module.ts` declares a `HealthController` that returns the two stub endpoints. ARC-036 will replace this controller with `@nestjs/terminus` indicators.

---

## Cross-cutting Concerns

### Security and Authorization

| Endpoint / Feature | Allowed roles | Notes |
|---|---|---|
| `GET /health/live` | Public | No auth. ALB target group uses this. |
| `GET /health/ready` | Public | No auth. ALB target group uses this. |

No auth is implemented in this story. ARC-013, ARC-014, ARC-015 land the JWT + JWKS + RBAC. The `@UseGuards()` annotations do not appear in this story.

### Error Handling

The global `ValidationPipe` rejects malformed bodies with the standard NestJS 400 + class-validator messages. The standard error envelope `{ code, message, details?, traceId }` (architecture §5.2) is **not** wired in this story — that is part of ARC-037's work. For this story, NestJS's default error format is acceptable.

### Logging

No structured logger is configured. `console.log` in the bootstrap is sufficient for ARC-003. `nestjs-pino` lands with ARC-037.

### Configuration

ADR-16 typed config is in place via `EnvConfig` and `AppConfigModule`. The pattern is established — subsequent stories extend it by adding new typed config classes.

### Health

The two endpoint stubs are wired. ARC-036 will replace them with Terminus.

---

## Technical Risks and Constraints

| Risk / Constraint | Impact | Mitigation |
|---|---|---|
| **pnpm workspaces in a git submodule**: the `code/` directory is a git submodule, and pnpm-workspace.yaml must live at its root. Submodules and pnpm should be compatible, but lockfile management inside a submodule adds friction when the parent project is also a pnpm workspace. | Medium | Keep the `code/` submodule as the monorepo root. Document the workflow: developers `cd code && pnpm install` or open the submodule directly in their editor. The workspace-relative `local: ./code/` path in `gene2-config.yaml` keeps everything aligned. |
| **ESLint boundary rules with `no-restricted-paths`**: the rule syntax can be tricky to write correctly, and a wrong glob produces false positives (or worse, false negatives). | Medium | The rule lives in a small isolated file (`tools/eslint/boundary-rules.cjs`) that can be unit-tested. The implementation includes three positive test cases (each forbidden direction) and three negative test cases (allowed directions: `apps/api → packages/contracts`, etc.). |
| **NestJS version drift**: blueprint says NestJS 11.x; if the package's major version advances between blueprint and implementation, the boilerplate may need adjustment. | Low | Pin to `^11.0.0` in `package.json`. The boilerplate is small enough that a minor refactor is cheap. |
| **Node version mismatch**: blueprint says Node 22 LTS, but a developer's local Node version may differ. | Low | Add a `engines.node` field in `package.json` (>= 22.0.0). Add a `.nvmrc` at the repo root pinning to `22`. |
| **The `apps/web/` placeholder might confuse the team**: it exists as a workspace but is empty. | Low | Add a `README.md` inside `apps/web/` that says "Vite + React Web skeleton — see ARC-004" so future readers know the empty state is intentional. |

---

## Open Questions

> All questions must be answered before this document moves to `approved` status.

- [x] **Q1.** Is `health/` the right name for the seventh module folder, or should it stay in `src/modules/health/` (separate from bounded contexts) without being listed in the `AppModule`? **Resolution:** kept in `src/modules/health/` and imported by `AppModule`. ADR-17 is unambiguous about it being a module.
- [x] **Q2.** Should the `infra/` folder at the top level be a module? **Resolution:** no. It holds adapter classes (PrismaService, S3Client), not controllers. Adapters are provided by their own modules and imported into the bounded-context modules. The structure is documented but no module file is created in this story.
- [x] **Q3.** Where do the ESLint boundary rules live — root `.eslintrc.cjs` or a separate `tools/eslint/` file? **Resolution:** root `.eslintrc.cjs` for ergonomics, with a `tools/eslint/boundary-rules.cjs` helper for unit-testability of the rule definitions.
- [x] **Q4.** Should `tsconfig.base.json` set `experimentalDecorators: true` for every workspace, or only for the API and contracts? **Resolution:** set it in the base config. Web App code (Vite + React) does not use decorators, but the setting is harmless. Setting it once in the base avoids a future surprise when a DTO is shared with the Web App.
