---
title: "ADR-16 — Configuration management: typed config classes (Pydantic-settings / @ConfigurationProperties style)"
id: adr-16
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 1.0.0
updated: 2026-08-10
---

# ADR-16 — Configuration management: typed config classes

## Context

Wendy Planner's API needs to read configuration from environment variables at startup: database credentials, JWT signing keys, S3 bucket names, AWS region, port numbers, log levels, etc. Today, these would be scattered across services or fetched ad-hoc via `process.env.X`. We want a configuration pattern that:

- **Is typed**: every config value has a known type at compile time. No `string | undefined` surprises.
- **Is validated at startup**: missing or malformed env vars fail the boot with a clear error — not a runtime 500 six hours later.
- **Is injectable**: services receive their config via the constructor (or by parameter), not via `process.env` lookups scattered through the codebase.
- **Is testable**: tests can swap config values by providing a different config instance.
- **Is self-documenting**: the config class IS the schema. New developers read the class to learn what env vars exist.
- **Reuses our validation library**: the same `class-validator` decorators used for DTOs (ADR-14) are used for config. One mental model.

This mirrors the patterns of:

- **Pydantic-settings (Python):** a `BaseSettings` class with typed fields and a `Config` inner class declaring env-var prefixes and sources.
- **Spring `@ConfigurationProperties` (Java):** a class annotated with `@ConfigurationProperties(prefix = "...")`, fields bound from `application.yml` or env vars, validated with `@Valid`.
- **.NET `IOptions<T>`:** a typed POCO bound from configuration at startup.

In NestJS, the canonical recipe is `@nestjs/config` + typed config classes — the user pointed us at the relevant docs (`/techniques/configuration`).

## Decision

**Adopt typed config classes using `class-validator` + `class-transformer`. Each config namespace is a plain TypeScript class decorated with `class-validator` constraints, instantiated at startup from `process.env`, and provided to the DI container as the class itself.**

**Concrete pattern:**

### 1. One config class per domain

```ts
// apps/api/src/config/database.config.ts
import { plainToInstance } from 'class-transformer';
import { IsString, IsInt, IsOptional, validateSync, Min, Max } from 'class-validator';

export class DatabaseConfig {
  @IsString() host!: string;
  @IsInt() @Min(1) @Max(65535) port!: number;
  @IsString() username!: string;
  @IsString() password!: string;
  @IsString() database!: string;
  @IsOptional() @IsString() sslMode?: 'require' | 'verify-full' | 'disable';

  /** Build a config instance from process.env, throwing on validation failure. */
  static fromEnv(env: NodeJS.ProcessEnv = process.env): DatabaseConfig {
    const raw = {
      host: env.DB_HOST,
      port: parseInt(env.DB_PORT ?? '5432', 10),
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      sslMode: env.DB_SSL_MODE,
    };
    const instance = plainToInstance(DatabaseConfig, raw, {
      enableImplicitConversion: true,
    });
    const errors = validateSync(instance, { skipMissingProperties: false, whitelist: true });
    if (errors.length > 0) {
      throw new Error(
        `[DatabaseConfig] validation failed:\n` +
          errors.map((e) => `  - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`).join('\n'),
      );
    }
    return instance;
  }

  /** Computed property — derived from validated fields. */
  get connectionUrl(): string {
    const ssl = this.sslMode && this.sslMode !== 'disable' ? `?sslmode=${this.sslMode}` : '';
    return `postgres://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}${ssl}`;
  }
}
```

### 2. A global `AppConfigModule` provides them all

```ts
// apps/api/src/config/app-config.module.ts
import { Global, Module } from '@nestjs/common';
import { AppConfig } from './app.config';
import { DatabaseConfig } from './database.config';
import { JwtConfig } from './jwt.config';
import { S3Config } from './s3.config';
import { AwsConfig } from './aws.config';

@Global()
@Module({
  providers: [
    { provide: AppConfig,      useFactory: () => AppConfig.fromEnv() },
    { provide: DatabaseConfig, useFactory: () => DatabaseConfig.fromEnv() },
    { provide: JwtConfig,      useFactory: () => JwtConfig.fromEnv() },
    { provide: S3Config,       useFactory: () => S3Config.fromEnv() },
    { provide: AwsConfig,      useFactory: () => AwsConfig.fromEnv() },
  ],
  exports: [AppConfig, DatabaseConfig, JwtConfig, S3Config, AwsConfig],
})
export class AppConfigModule {}
```

### 3. `.env` file loading (dev only)

Use `@nestjs/config`'s `ConfigModule` solely for `.env` file loading. It runs first, populates `process.env`, and our typed factories read from there.

```ts
// apps/api/src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,         // process.env values are cached after first read
      envFilePath: '.env', // loaded only in dev; in prod, env vars come from ECS
    }),
    AppConfigModule,       // our typed factories
    // ... bounded-context modules
  ],
})
export class AppModule {}
```

### 4. Inject as the class type — no string keys

```ts
// A service (internal adapter — exit port)
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly db: DatabaseConfig) {
    super({ datasources: { db: { url: db.connectionUrl } } });
  }
}

// A controller (entry port)
@Controller('oauth/token')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly jwt: JwtConfig, // typed, validated, no string keys
  ) {}
}
```

### 5. Tests inject a config instance

```ts
const testJwtConfig = Object.assign(new JwtConfig(), {
  privateKey: 'test-key',
  publicKey: 'test-key',
  issuer: 'wendy-test',
  audience: 'wendy-test',
});

Test.createTestingModule({
  providers: [
    TokenService,
    { provide: JwtConfig, useValue: testJwtConfig },
  ],
}).compile();
```

### Config namespaces for Wendy Planner

| Class | Env var prefix | Purpose |
|-------|----------------|---------|
| `AppConfig` | `APP_` | port, env name, log level, CORS origins |
| `DatabaseConfig` | `DB_` | host, port, user, password, database name, SSL mode |
| `JwtConfig` | `JWT_` | private key (PEM), public key (PEM), issuer, audience, access TTL, refresh TTL |
| `S3Config` | `S3_` | bucket name, region, endpoint (for LocalStack / MinIO), presigned URL TTL |
| `AwsConfig` | `AWS_` | region, profile (local only), secrets-manager mode |
| `EmailConfig` | `EMAIL_` | provider, from address (for future email notifications) |
| `PhotoLifecycleConfig` | `PHOTO_` | retention days (30), max photos per wedding (200), max file size MB (5) |

## Options Considered

### Option A — `process.env.X` directly in services

- **Pros:** zero ceremony.
- **Cons:** untyped, no validation, no central place to see what env vars exist, easy to typo `process.env.DATABSE_HOST`.
- **Verdict:** only acceptable for one-week projects. **Rejected.**

### Option B — `@nestjs/config` with `registerAs()` namespaces (the "official" way)

```ts
export const databaseConfig = registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
}));
```

- **Pros:** standard NestJS recipe, namespace grouping.
- **Cons:** **not typed** — `configService.get('database.host')` returns `any` or `undefined`; you have to cast or use `ConfigType<typeof databaseConfig>` (which is awkward at the call site).
- **Verdict:** insufficient for our needs; we want compile-time safety. **Rejected as the primary pattern.**

### Option C — Typed config classes (the Pydantic-settings / Spring style) — **Selected**

- **Pros**
  - **Fully typed** — TypeScript knows every field's type at compile time.
  - **Validated at startup** — the app refuses to boot if config is malformed; the error message tells the developer exactly which env var is wrong.
  - **Self-documenting** — the class is the schema.
  - **Reuses `class-validator`** — same decorators as DTOs (ADR-14), one mental model.
  - **Testable** — instantiate the class directly, pass it to the test module.
  - **Matches industry standards** — Pydantic-settings (Python), Spring `@ConfigurationProperties` (Java), .NET `IOptions<T>`.
- **Cons**
  - ~10 lines per config class (factory + validation). Trivial.
  - Slightly more setup than `registerAs()`.
  - One-time learning curve if the team hasn't seen the pattern.

### Option D — `envalid` or `zod-config` libraries

- **Pros:** purpose-built libraries.
- **Cons:** adds another library; we already have `class-validator` for the same job. **Rejected.**

## Consequences

### Positive

- **Fail-fast at boot**: missing `DB_PASSWORD`? The app crashes immediately with `[DatabaseConfig] validation failed: - password: should not be empty`. No silent production surprises.
- **Compile-time safety**: refactor renames a config field; TS errors in every consumer.
- **Single mental model**: the same `class-validator` decorators used for DTOs validate config. No new validation syntax to learn.
- **Easy to test**: instantiate the config class with test values; no need to set `process.env`.
- **Discoverable**: a new dev opens `apps/api/src/config/` and sees every env var the app needs.

### Negative / Trade-offs

- One config class per domain — small overhead (5-10 classes, ~50 lines each).
- Config loading happens once at startup; changes to env vars require a restart (this is by design and matches the rest of the industry).

### Follow-up actions

- [ ] Create `apps/api/src/config/` with one file per config namespace (ADR-16 §Config namespaces) [owner:: backend] [priority:: high]
- [ ] Implement `AppConfigModule` (global) [owner:: backend] [priority:: high]
- [ ] Wire `AppConfigModule` + `ConfigModule.forRoot({ envFilePath: '.env' })` in `AppModule` [owner:: backend] [priority:: high]
- [ ] Refactor existing services to inject config classes instead of using `process.env` [owner:: backend] [priority:: high]
- [ ] Add a startup smoke test that fails if any required config class throws on instantiation [owner:: backend] [priority:: medium]
- [ ] Document the full env var inventory in the backend blueprint [owner:: backend] [priority:: medium]
- [ ] Add a `.env.example` to the repo root with placeholder values [owner:: backend] [priority:: medium]

### Revisit when

- The number of config namespaces exceeds ~15 (consider grouping).
- A config value needs to change without a restart (consider feature flags, not config — different concept).
- Multi-tenant config emerges (per-tenant values should live in the DB, not env vars).
