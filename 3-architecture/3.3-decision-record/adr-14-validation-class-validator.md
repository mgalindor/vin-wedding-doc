---
title: "ADR-14 — Validation library: class-validator + class-transformer + NestJS ValidationPipe"
id: adr-14
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 1.0.0
updated: 2026-08-10
---

# ADR-14 — Validation library: class-validator + class-transformer + NestJS ValidationPipe

## Context

Wendy Planner's API receives request bodies and returns responses for every bounded context. The same shapes are also used by the Vite + React Web App for form validation and for typing the data the dashboard handles. We need:

- **Server-side validation** at the API boundary, applied automatically before any controller method runs.
- **Client-side validation** in React Hook Form that uses the same rules as the server — no drift.
- **Type-safe DTOs** that describe both the request and the response payload.
- **OpenAPI documentation** generated from the same definitions (so the FE can consume it for typed API clients).
- **One source of truth**: the same definitions are used on both sides of the wire.

## Decision

**Adopt `class-validator` + `class-transformer` as the validation library, wired into NestJS via the built-in `ValidationPipe`. DTO classes live in `@wendy/contracts` and are decorated once. Both the API and the Web App import the same classes.**

**Concrete configuration:**

- **Server-side (NestJS):**
  - `class-validator` decorators (`@IsString()`, `@IsNotEmpty()`, `@IsEmail()`, `@MinLength()`, `@IsEnum()`, `@IsDateString()`, `@ValidateNested()`, `@Type()`, etc.) on each DTO class field.
  - `class-transformer` for `@Type()` and `@Transform()` (needed for nested DTOs, enums, and date coercion).
  - A global `ValidationPipe` configured in `main.ts`:
    ```ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,             // strip unknown fields
        forbidNonWhitelisted: true,   // 400 on unknown fields
        transform: true,              // coerce payloads to DTO instances
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    ```
  - Errors come back as a standard NestJS `BadRequestException` with a `message` array describing each failed constraint — the FE maps each constraint name to a localized message via `i18next`.

- **Client-side (Vite + React):**
  - The same DTO classes from `@wendy/contracts` are imported into the FE bundle.
  - A small adapter (lives in `@wendy/contracts/fe-adapter`) exposes `validateForm(dto): Promise<ValidationError[]>` which calls `validate()` from `class-validator` and shapes the errors for React Hook Form.
  - React Hook Form integrates via a tiny custom resolver (~30 lines) that constructs the DTO instance from the form values and returns `{ values, errors }` to RHF.
  - This pattern keeps the **single source of truth**: the same `@IsNotEmpty()` annotation on `coupleNames` rejects an empty string on both server and client.

- **DTOs location:** `packages/contracts/src/dtos/<context>/<Name>Dto.ts`, exported from `@wendy/contracts/dtos/<context>` for narrow imports.

- **Branded ID types** (`packages/contracts/src/ids.ts`) remain plain TypeScript types — no decorators needed. See ADR-13.

- **OpenAPI / Swagger:** `@nestjs/swagger` picks up the same DTO classes (via `@ApiProperty()` decorators on each field, or via the CLI plugin) to generate the API documentation. One set of classes → three uses (validation, typing, OpenAPI).

- **tsconfig for `@wendy/contracts`:**
  ```jsonc
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "ESNext",
      "moduleResolution": "bundler",
      "experimentalDecorators": true,
      "emitDecoratorMetadata": true,
      "strict": true,
      "skipLibCheck": true
    }
  }
  ```

- **Bundle impact on the FE:** `class-validator` + `class-transformer` + `reflect-metadata` ≈ 45 KB gzipped. Acceptable for the dashboard (we are not bundle-purity-obsessed). The `(public)` route group that ships to guests tree-shakes most of it away because guests don't fill out forms.

## Example

```ts
// packages/contracts/src/dtos/weddings/create-wedding.dto.ts
import { IsString, IsNotEmpty, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum InvitationTemplate {
  CLASSIC = 'classic',
  GARDEN = 'garden',
  BEACH = 'beach',
  // ... 6 templates total in MVP
}

export class CreateWeddingDto {
  @ApiProperty({ example: 'María & José' })
  @IsString()
  @IsNotEmpty()
  coupleNames: string;

  @ApiProperty({ example: '2026-12-12' })
  @IsDateString()
  eventDate: string;

  @ApiProperty({ enum: InvitationTemplate })
  @IsEnum(InvitationTemplate)
  templateId: InvitationTemplate;
}
```

**On the BE (NestJS controller):**

```ts
@Post()
@Roles('WeddingPlanner')
create(@Body() dto: CreateWeddingDto): Promise<WeddingResponseDto> {
  return this.weddingsService.create(dto);
}
```

The global `ValidationPipe` validates the body against `CreateWeddingDto` before the method runs. An empty `coupleNames` returns 400 with a localized message.

**On the FE (React Hook Form):**

```tsx
import { useForm } from 'react-hook-form';
import { classValidatorResolver } from '@wendy/contracts/fe-adapter';
import { CreateWeddingDto, InvitationTemplate } from '@wendy/contracts';

const { register, handleSubmit, formState: { errors } } = useForm<CreateWeddingDto>({
  resolver: classValidatorResolver(CreateWeddingDto),
});

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('coupleNames')} />
    {errors.coupleNames && <span>{t(`errors.${errors.coupleNames.type}`)}</span>}
    {/* ... */}
  </form>
);
```

## Options Considered

### Option A — Zod schemas

- **Pros**
  - Schema-first; one source of truth, easy to reason about.
  - Better TS inference (`z.infer<typeof schema>`).
  - Smaller FE bundle (~13 KB).
  - Works identically in non-NestJS environments (Deno, Bun, edge runtimes).
- **Cons**
  - **Not NestJS-native**: requires a custom `ZodValidationPipe` (~50 lines of glue).
  - Less idiomatic in a NestJS codebase — every project uses `class-validator`.
  - Two ecosystems to keep in sync (Zod + the custom pipe).
- **Rejected per user preference** for the NestJS-native pattern.

### Option B — Joi (with `@nestjs/config`)

- **Pros:** mature, large community.
- **Cons:** validation is not co-located with the DTOs (Joi schemas are separate); TS inference is weaker; less ergonomic than class-validator for NestJS. **Rejected.**

### Option C — `class-validator` + `class-transformer` + NestJS `ValidationPipe` — **Selected**

- **Pros**
  - **The canonical NestJS pattern** — every NestJS developer knows it.
  - Decorators on DTOs serve three purposes: validation, transformation, and OpenAPI docs (via `@ApiProperty`).
  - **Single source of truth on the BE**: validation, typing, and docs all come from the same classes.
  - **Same DTOs usable on the FE**: class-validator is framework-agnostic; it works in the browser.
  - Mature, stable, low-risk.
- **Cons**
  - **~45 KB gzipped** added to the FE bundle (class-validator + class-transformer + reflect-metadata).
  - Requires `experimentalDecorators: true` in tsconfig (NestJS already enables this; the FE must opt in).
  - TS inference is slightly less ergonomic than Zod's `z.infer` (you write the class, the type IS the class).
  - Some complex validations (conditional, dependent fields) require `@ValidateIf` and `@Validate` custom decorators — a small ceremony.

### Option D — Hybrid: Zod on FE only, class-validator on BE

- **Pros:** smallest FE bundle.
- **Cons:** two validation systems to keep in sync; the FE rules can drift from the BE rules. Defeats the single-source-of-truth goal. **Rejected.**

## Consequences

### Positive

- The DTOs in `@wendy/contracts` are the canonical contract: validation, typing, OpenAPI docs all flow from them.
- The NestJS developer experience is the smoothest possible — just decorate the DTO, ValidationPipe handles the rest.
- Future migration to a managed IdP (see ADR-05) is unaffected.
- The FE gets the same validation rules with a 45 KB cost, which is acceptable.

### Negative / Trade-offs

- We accept a ~45 KB FE bundle cost for `class-validator` + `class-transformer` + `reflect-metadata`. Mitigated by the fact that the `(public)` route group (guests) tree-shakes most of it.
- We require `experimentalDecorators` in the FE's tsconfig (Vite supports this).
- Some complex validations require custom decorators.

### Follow-up actions

- [ ] Configure `tsconfig` in `@wendy/contracts` with `experimentalDecorators` and `emitDecoratorMetadata` [owner:: tech-lead] [priority:: high]
- [ ] Implement the `classValidatorResolver` adapter in `@wendy/contracts/fe-adapter` [owner:: backend] [priority:: high]
- [ ] Configure the global `ValidationPipe` in `apps/api/src/main.ts` [owner:: backend] [priority:: high]
- [ ] Wire up `@nestjs/swagger` with the CLI plugin to auto-derive `@ApiProperty()` from class-validator decorators [owner:: backend] [priority:: medium]
- [ ] Document the DTO conventions in the backend blueprint [owner:: backend] [priority:: medium]
- [ ] Add a CI step that fails the build if a DTO is used in a controller without class-validator decorators [owner:: backend] [priority:: medium]

### Revisit when

- Bundle size of the FE becomes a problem (revisit Zod or strip the class-validator deps from the `(public)` route group).
- We need runtime-agnostic validation (Zod or JSON Schema for edge/workers).
- A new developer strongly prefers Zod — the migration cost is moderate (DTO classes → Zod schemas) but not trivial.
