---
title: "Technical Specification — US-001: Onboard a new Wedding Planner"
date: 2026-08-17
type: specification
scope: internal
story-id: "US-001"
status: draft
version: 1.2.1
updated: 2026-08-17
layers:
  backend: true
  frontend: true
  mobile: false
revision-history:
  - v1.2.1 (2026-08-17): Added the `GET /oauth/userinfo` endpoint per ADR-05 §Standards-aligned URL paths. The endpoint returns the same `UserProfileDto` shape used at login, and the FE replaces the existing client-side JWT-decode (`decodeJwtPayload` in `use-login.ts`) for any role-gated UI decision with a server-authenticated call. This closes the path where a forged JWT could let a non-Administrator render the Administrator-only affordances while still failing every protected API call. Functional spec gained Rule 28 to codify the rule. No BE env-var additions, no FE bundle additions.
  - v1.2.0 (2026-08-17): Org email suffix is sourced from the **tenants table** (per `tenantId` of the security context), not from a `TENANT_EMAIL_SUFFIX` env var. The use case takes an `AdminPrincipal` value object (read from the JWT) and a `TenantEmailSuffixProvider` port that returns the row's suffix; a hard-coded fallback `wendy` is documented for Sprint 1 (no `tenants` table exists, the seed must be extended in this story). Password bounds are hard-coded constants inside the use case (`PASSWORD_MIN_LENGTH=10`, `PASSWORD_MAX_LENGTH=25`); no env vars for them. FE: the dashboard landing surfaces the "Wedding Planners" entry for Administrators (sidebar item + landing primary action leading to the onboarding form) — the section lives inside the existing `(dashboard)` route group, gated by the role, instead of a separate `(admin)` route group. No rule of the functional spec changed.
  - v1.1.0 (2026-08-17): Dropped the companion `POST /api/v1/wedding-planners/generate-password` endpoint — the FE generates the password locally with `window.crypto.getRandomValues`, the server still enforces the 10-25 char rule. Replaced the in-process `user.created` event emitter + subscriber with a direct structured `Logger.log(...)` call inside the use case (same payload: ids only, never the password). Removed `INITIAL_PASSWORD_GENERATED_LENGTH` config row. Removed `VITE_TENANT_EMAIL_SUFFIX_LABEL` env var. No rule of the functional spec changed.
  - v1.0.0 (2026-08-17): initial draft.
---

# Technical Specification — US-001: Onboard a new Wedding Planner

**Status: ⚠️ Draft**

---

## Scope

| Layer | Affected | Justification | foldername |
|---|---|---|---|
| Backend | Yes | Adds one new endpoint that creates a Wedding Planner record under the calling Administrator's tenant, mints the chosen initial credentials, persists an audit attribution, and returns the cleartext credential exactly once. The endpoint lives in the existing identity context and reuses every cross-cutting concern already in place (JWT/RBAC guards, global validation pipe, Prisma, event emitter). | `apps/api` |
| Frontend Web | Yes | Adds the new "Wedding Planners" entry to the Administrator shell sidebar, a placeholder section landing, and the onboarding form with its confirmation screen. Reuses the existing route groups, the i18n catalog, the api-client, and the auth store. | `apps/web` |
| Frontend Mobile | No | Out of scope per architecture §2.1 (PC + tablet only). | — |

---

## Architecture References

| Document | Description |
|---|---|
| [3-architecture/3.2-blueprints/backend-blueprint.md](../../../3-architecture/3.2-blueprints/backend-blueprint.md) §3, §4, §5, §6, §7 | Folder layout (bounded contexts with `domain` / `application` / `inbound-adapters` / `outbound-adapters` / `public`), typed config classes, error envelope, audit intent, test layout & file-naming convention. |
| [3-architecture/3.2-blueprints/web-frontend-blueprint.md](../../../3-architecture/3.2-blueprints/web-frontend-blueprint.md) §3, §5, §6 | Route-group structure, api-client, in-memory auth store, i18n setup, confirmation route guard. |
| [3-architecture/3.3-decision-record/adr-05-auth-jwt-bcrypt.md](../../../3-architecture/3.3-decision-record/adr-05-auth-jwt-bcrypt.md) | RS256 + JWKS, bcrypt cost 12, OIDC-style URL paths (`/oauth/token`). The onboarding create uses the same password machinery to keep one credential code path. |
| [3-architecture/3.3-decision-record/adr-07-multitenancy-preparation.md](../../../3-architecture/3.3-decision-record/adr-07-multitenancy-preparation.md) | `tenant_id` on every table; the onboarding writes the new Wedding Planner into the calling Administrator's tenant without a tenant lookup. |
| [3-architecture/3.3-decision-record/adr-09-modular-monolith-organization.md](../../../3-architecture/3.3-decision-record/adr-09-modular-monolith-organization.md) | One `@Module` per bounded context; sibling contexts reach another context only through its `public/` folder. The new onboarding endpoint stays inside the existing identity context — no new bounded context is created for one endpoint. |
| [3-architecture/3.3-decision-record/adr-15-auth-framework-passport.md](../../../3-architecture/3.3-decision-record/adr-15-auth-framework-passport.md) | `@nestjs/passport` + `passport-jwt` (canonical NestJS recipe) — reused without modification. |
| [3-architecture/3.3-decision-record/adr-14-validation-class-validator.md](../../../3-architecture/3.3-decision-record/adr-14-validation-class-validator.md) | DTOs in `@wendy/contracts`, validation at the API boundary via the existing global `ValidationPipe`. |
| [3-architecture/3.3-decision-record/adr-16-configuration-typed-classes.md](../../../3-architecture/3.3-decision-record/adr-16-configuration-typed-classes.md) | New typed config class for the organisation email-suffix follows the existing config pattern (`class-validator` + `static fromEnv()`). |
| [4-specs/20260817-us-001-onboard-wedding-planner/functional-spec.md](functional-spec.md) | Approved source of truth. This tech spec implements those rules; when in doubt, the functional spec wins. |

---

## Backend

### API Endpoints

This spec ships **one** new endpoint and two helper internal entry points.

**CREATE — `POST /api/v1/wedding-planners`**

Creates a new Wedding Planner account under the calling Administrator's tenant, persists it, emits the `user.created` audit event in the same transaction, and returns the created record together with the cleartext initial credential (the only endpoint that surfaces it).

```yaml
# POST /api/v1/wedding-planners
security:
  type: jwt
  role: Administrator
request:
  firstName: str         # str, required, max 120 chars; stored concatenated into full_name for Sprint 1
  lastName:  str         # str, required, max 120 chars
  email:     str         # str, required, RFC-5322-ish (presence of @, non-empty local, non-empty domain with dot)
  username:  str         # str, required, slug pattern ^[a-z]+$, max 64 chars; platform appends the suffix read from the tenants table by the calling admin's tenantId
  password:  str         # str, required, min 10, max 25 chars; no class rule
  phone:     str         # str, optional, max 50 chars
response:
  id:               str  # str, required, 10-char NanoId
  username:         str  # str, required, full address (<slug>@<suffix>)
  initialPassword:  str  # str, required, plain text — the value the Admin will hand off
  createdAt:        str  # str, required, ISO 8601
  onboardedByAdminId: str # str, required, 10-char NanoId (echoed from the JWT for traceability)
```

**Endpoint contract notes**:

- The `username` in the request is the slug only (`^[a-z]+$`). The full address (`<slug>@<suffix>`) is computed server-side by reading the **tenant row** for the calling Administrator's `tenantId` from the security context, and pulling its email suffix; the use case takes an `AdminPrincipal` value object derived from the JWT (`tenantId`, `actorId`) plus a `TenantEmailSuffixProvider` port that returns the suffix by id. Sprint 1 fallback (no `tenants` table ships today): a hard-coded `wendy` is documented in the seed and adapter — the fallback is removed when the table lands.
- The cleartext `initialPassword` is returned **only** in this response. No subsequent request from any role returns it; the only way to read it again is the one-time confirmation screen that consumes this response in the same session.
- Field-level validation errors return the existing envelope with details keyed by the offending DTO field name; uniqueness conflicts (slug, email) return the conflict envelope with details keyed by the conflicting field. The token/error codes follow the existing pattern.
- The endpoint is `@UseGuards(JwtAuthGuard, RolesGuard)` plus `@Roles(Role.Administrator)`. A Wedding Planner who somehow authenticates receives the existing generalized refusal — no enumeration, no special case.

**Unchanged**: `GET /.well-known/jwks.json`, `GET /health/*` are untouched.

**CREATE — `GET /oauth/userinfo`** (per ADR-05 §Standards-aligned URL paths, OIDC Core §5.3)

Returns the authenticated user's profile. Same shape as `UserProfileDto` already used at login — no new DTO, no new shape. This is the **only** endpoint the FE trusts for role-gated UI decisions (Rule 28 of the functional spec). Replaces the client-side `decodeJwtPayload(...)` in `use-login.ts` for any UI affordance whose rendering depends on the caller's role.

```yaml
# GET /oauth/userinfo
security:
  type: jwt
  role: any authenticated user
request:
  {}
response:
  id:        str  # str, required, 10-char NanoId
  fullName:  str  # str, required
  email:     str  # str, required
  role:      str  # str, required, enum: [Administrator, WeddingPlanner]
  tenantId:  str  # str, required, 10-char NanoId
```

Implementation note: the endpoint sits inside the same `AuthController` (`modules/identity/inbound-adapters/auth.controller.ts`) as `POST /oauth/token` and reuses the existing `AuthenticateUserUseCase` to load the row by the JWT subject. The decorator set is `@UseGuards(JwtAuthGuard)` without `@Roles(...)` — every authenticated principal may read their own profile. No password, hash, slug, or cleartext credential appears in the response; the existing `findProfileByEmail`-style exclusion of `password_hash` continues to hold.

### Endpoints added in this spec

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/wedding-planners` | POST | Onboard a Wedding Planner (above). |
| `/oauth/userinfo` | GET | Return the authenticated user's profile (above). |

#### Endpoint explicitly not shipping

- A `POST /api/v1/wedding-planners/generate-password` companion was considered and dropped. The "Generate password" affordance in the FE generates the value locally with `window.crypto.getRandomValues` (a CSPRNG already available in every supported browser). The server still enforces the 10-25 char rule on the incoming value, so the FE cannot smuggle an out-of-range password through. The motivation for dropping is twofold: (a) the round-trip adds latency and a second failure surface for no security gain, and (b) the value is one-shot, so the value of "the password never leaves the process until creation" is irrelevant once the Admin has authenticated — if the FE is compromised, the FE can call the create endpoint directly.

#### Endpoints explicitly deferred

| Item | Owner | Why deferred |
|---|---|---|
| `POST /api/v1/wedding-planners/{id}/disable` | Disable story | The onboarding endpoint always creates the new account in the active state; disabling lives in its own story. |
| `POST /api/v1/wedding-planners/{id}/reset-password` | Restore story | Not needed in this iteration. |
| `POST /api/v1/wedding-planners/generate-password` | Dropped (see above) | Generated locally on the FE; server still enforces the rule. |
| Per-organisation email-suffix lookup from a `tenants` table | **Shipped in this spec** | The `tenants` table (one row per `tenant_id`) lands as part of this story's migration; the seed inserts a single `default` row carrying `email_suffix = 'wendy'`. The `OnboardWeddingPlannerUseCase` reads the suffix from the row via the `TenantEmailSuffixProvider` port. |

---

### Database Changes

**One new table and one seed row.** The Sprint 1 implementation introduces the `tenants` table so the org email suffix is sourced from data, not from a constant. The existing `users` table already carries every field this spec needs:

How the rules map onto the existing columns:

- **First + last name** — Sprint 1 concatenates `${firstName} ${lastName}` with a single space and writes the result to `full_name`. A future migration will split the column; no FE change is required when that lands.
- **Email** — written as-is; the existing unique index enforces the uniqueness rule.
- **Username slug** — appended with the suffix read from the `tenants.email_suffix` column for the calling Administrator's `tenantId` (e.g. `@wendy`), and the full value is written to `email`. The unique index then enforces uniqueness across the organisation. (The slug itself is never persisted as a separate column.)
- **Password** — `bcrypt.hash(password, BCRYPT_COST=12)` is written to `password_hash`. With the 10-25 char cap, bcrypt's 72-byte truncation limit is unreachable.
- **`role`** — `WeddingPlanner` constant. The endpoint cannot produce an `Administrator` row.
- **`is_disabled`** — server constant `false` at create time. The body never carries this field.
- **`onboarded_by_admin_id`** — written from the JWT subject of the call. Body never carries this field.
- **`tenant_id`** — written from the JWT subject's `tenantId` claim. Body never carries this field.

```dbml
Table tenants {
  id            varchar(10)   [pk]                       // NEW — 10-char NanoId; matches users.tenant_id
  email_suffix  varchar(64)   [not null, unique]         // NEW — e.g. "wendy"; the slug suffix the platform appends
  display_name  varchar(255)  [not null]                 // NEW — human-readable org name for future UI surfaces
  created_at    timestamp     [not null, default: `now()`]
  updated_at    timestamp     [not null, default: `now()`]

  indexes {
    id [name: 'idx_tenants_pk', unique]
  }
}

Ref: users.tenant_id > tenants.id
```

Migration:

- A single new migration `apps/api/prisma/migrations/<timestamp>_add_tenants/migration.sql` (or the prisma-format equivalent) creates the `tenants` table above.
- The same migration back-fills a single row `{ id: 'default', email_suffix: 'wendy', display_name: 'Vineyards' }` so the seed for `admin@wendy` (the default administrator from US-006/ARC-010) and any user with `tenant_id = 'default'` continues to work without behaviour change.

Seed:

- `apps/api/tools/db-seed.ts` is extended so the default administrator's `tenant_id` resolves against the seeded `tenants` row instead of the `tenant_id = 'default'` constant — same final value today, but routed through the new row. The seed is still idempotent.

The existing `users` table does not change.

---

### Audit

The functional spec's Rule 24 requires that every successful onboarding record the attribution of the new account to the creating Administrator, in a form that carries only ids (never the password, the email, the phone, or any other PII). The functional spec explicitly leaves the persistence mechanism open: *"the platform may differ on its persistence mechanism (a structured log today; a centralised audit table in a later iteration) without changing the rules above."*

This spec picks the lighter option. The use case that drives the create endpoint calls the existing structured logger (`nestjs-pino`, already configured in `main.ts`) immediately after the row is persisted and before the response returns, with this payload:

```yaml
audit-log:
  event:        user.created
  userId:       str  # 10-char NanoId
  tenantId:     str  # 10-char NanoId
  role:         str  # "WeddingPlanner"  (Administrator creations are not allowed by this endpoint)
  actorId:      str  # 10-char NanoId of the calling Administrator (JWT subject)
  traceId:      str  # request-scoped id from the traceId interceptor
  timestamp:    str  # ISO 8601
```

**Explicitly NOT logged** (matches Rule 24): the password value, the email address, the phone, the slug, or any other PII beyond the ids themselves. The log line never carries the cleartext credential.

**Why log-only instead of an event bus + subscriber + audit table**: with a single critical event in scope today, an event emitter and a subscriber is infrastructure that pays for itself only once the platform has several events with overlapping subscribers. Today it would be a write-and-forget line in one place. The conversion to a centralised audit table (when the audit story ships it) is a one-line change in the use case: `Logger.log(...)` becomes `auditRepo.persist(row)`. The audit-table row shape is the same as the log payload above; no rule of the functional spec is touched.

---

### Configuration (backend)

This spec ships **no new env-driven typed-config class** in the API. The values that drove the previous typed-config table are now either constants in code or are read from a database row:

| Concern | Source of truth | Where read |
|---|---|---|
| Password bounds | Hard-coded constants `PASSWORD_MIN_LENGTH = 10` and `PASSWORD_MAX_LENGTH = 25` in the use case (per Rule 11). No env var, no config class — the bounds are part of the functional contract, not an operational knob. | `OnboardWeddingPlannerUseCase` (constants `const`). |
| Bcrypt cost factor | Hard-coded constant `BCRYPT_COST = 12` (per ADR-05). | `OnboardWeddingPlannerUseCase`. |
| Tenant email suffix | Sourced from the `tenants.email_suffix` column for the calling Administrator's `tenantId`, read via the `TenantEmailSuffixProvider` outbound port. The Sprint 1 implementation returns a hard-coded `wendy` because no `tenants` table exists yet (see *Database Changes* below — this story ships the table and seed). | `OnboardWeddingPlannerUseCase` → `TenantEmailSuffixProvider` (adapter in `outbound-adapters/`). |

The "Generate password" affordance on the FE is **not** a backend concern — the value is generated locally with the browser's `crypto.getRandomValues`, then sent over the same wire as an Admin-typed value. The server enforces the same 10-25 char length rule.

---

### Cross-cutting concerns

- **Validation** — global `ValidationPipe` already enforces `whitelist + forbidNonWhitelisted + transform`. Adding `@MinLength`/`@MaxLength`/`@Matches` decorators to the new DTO is enough.
- **Authorization** — `@UseGuards(JwtAuthGuard, RolesGuard)` plus `@Roles(Role.Administrator)`. Registered globally in `main.ts` already.
- **Audit** — write the structured log line documented in §"Audit" (event = `user.created`, ids only, no password).
- **Logging** — request entry/exit via the existing `nestjs-pino` setup; never log the cleartext password. The `initialPassword` value is only returned to the FE; it never reaches the logger.
- **Error envelope** — reuse the existing `DomainError` taxonomy and the global exception filter. Validation errors surface as field-level details; uniqueness conflicts surface as field-level conflict details; auth/authz failures use the existing generalized messages; unhandled errors remain opaque.

---

## Frontend

### Structure

#### Screens / Views

| Action | Screen | Description |
|---|---|---|
| MODIFY | `DashboardLayout` (existing) | Adds the sidebar entry **"Wedding Planners"** for authenticated users whose role is `Administrator`, and renders an empty-state card on the dashboard landing for the Admin with a primary action **"Onboard Wedding Planner"** that navigates straight to the onboarding form. Wedding Planners see no change. |
| CREATE | `OnboardWeddingPlannerScreen` | The onboarding form. Two text fields for first/last name, an email field, an optional phone field, the slug text input with the visual `@wendy` suffix, a password field masked with the "Generate password" button, and the footer buttons. |
| CREATE | `CredentialsConfirmationScreen` | One-shot display of the created username and cleartext password with copy-to-clipboard controls and the mandatory acknowledgement checkbox. |

#### Navigation and Routing

| Action | Route / Screen | Navigates from | Trigger | Stack type |
|---|---|---|---|---|
| MODIFY | `/dashboard` (existing landing) | login | Dashboard mounts for an Administrator | replace |
| CREATE | `/dashboard/wedding-planners/onboard` | `/dashboard` | Administrator clicks "Onboard Wedding Planner" | push |
| CREATE | `/dashboard/wedding-planners/:id/credentials` | `/dashboard/wedding-planners/onboard` | Onboarding form submits successfully | replace |

The two new routes live inside the existing `(dashboard)` route group. The role gate is **not** at the layout level — the dashboard layout is shared with the WP shell — but at the component level on the empty-state card and on each new route's `beforeLoad`. A `useIsAdmin()` composable reads the in-memory auth store; non-Administrators see the existing landing and no "Onboard Wedding Planner" entry exists for them. This avoids spinning up a separate `(admin)` group and keeps the Web bundle cheap (the same layout and same auth store serve both roles).

A small role-guard composable for the two new routes redirects a Wedding Planner who types the URL by hand back to `/dashboard` without revealing that the route exists.

#### Interaction

##### Form Specifications

**CREATE — OnboardWeddingPlannerForm** (lives in `OnboardWeddingPlannerScreen`)

| Field | Label | Input type | Required | Validation | Default |
|---|---|---|---|---|---|
| `firstName` | First Name | text | Yes | Required, max 120 chars | — |
| `lastName` | Last Name | text | Yes | Required, max 120 chars | — |
| `email` | Email | email | Yes | Required, RFC-5322-ish format | — |
| `username` | Username | text | Yes | Required, slug pattern `^[a-z]+$`, max 64 chars | — |
| `phone` | Phone | tel | No | Optional, max 50 chars | — |
| `password` | Password | password | Yes | Required, 10-25 chars, the value is what gets sent (no client-only strength checks) | filled by `Generate password` if the Admin clicks the button, else Admin-typed |

**Actions**:

| Action | Label | Behavior |
|---|---|---|
| `generate-password` | Generate password | Generates a value locally with `crypto.getRandomValues`, applies the length-and-classes policy (10-25 chars, mixed classes), and writes it into the password field. No server call. |
| `submit` | Save Planner | Sends `POST /api/v1/wedding-planners` with the validated payload. Disabled until required fields are filled and within length bounds. On success: navigates to `credentials` (replace) with the response payload in memory. On 409: surfaces the field-level conflict. On 4xx/5xx: a localised banner above the form. |
| `cancel` | Cancel | Returns to `/dashboard` without confirmation. Reopening the form starts a fresh attempt. |

##### UI Behavior Rules

| Element | Rule | Trigger |
|---|---|---|
| Submit button | Disabled until all required fields are non-empty and within bounds | On any field change |
| Submit button | Spinner and disabled | While `POST /api/v1/wedding-planners` is in flight |
| `username` field | Inline error *"Use lowercase letters only"* when the value doesn't match the slug pattern | On submit (server-side error is also possible) |
| `password` field | Inline error *"Password must be 10-25 characters"* when the value is too short or too long | On submit |
| Email field | Inline error *"Enter a valid email address"* when the format check fails | On submit |
| Generate password button | Replaces the field with a locally-generated value (length-and-classes policy applied) | On click |
| Confirmation screen | The cleartext password block is shown exactly once | On navigation from the form |
| Confirmation screen | Copy-to-clipboard controls beside username and password | Visible |
| Confirmation screen | *"I have saved the credentials"* checkbox gates the primary action | Visible from the moment the screen mounts |
| Confirmation screen | The inline warning about future replace-only access is visible while the password is on screen | Visible from the moment the screen mounts until the Admin clicks the primary action |
| Confirmation screen primary action | Disabled until the checkbox is ticked, then navigates back to `/dashboard` | Enabled by checkbox tick |

#### Data

##### API Consumption (Frontend → Backend)

| Endpoint | Triggered by | Outcome in UI |
|---|---|---|
| `POST /api/v1/wedding-planners` | Form submit | On success → `credentials` screen with the response. On 409 with details → field-level errors. On other failures → generic banner. |
| _No server call_ | "Generate password" click | The FE generates the value locally with `crypto.getRandomValues`, applies the length-and-classes policy, and writes it into the password field. The next submit carries the generated value exactly like an Admin-typed one. |

##### Data State Design

| Data | Scope | Lifecycle |
|---|---|---|
| Submission response (created id, username, cleartext password) | local to the navigation between `onboard` and `credentials` | Carried in TanStack Router's navigation state (or in URL-encoded form if the navigation state proves awkward); cleared the moment the Admin acknowledges on the confirmation screen. Never persisted. |
| Form state (`firstName`, `lastName`, `email`, `username`, `phone`, `password`) | local to `OnboardWeddingPlannerScreen` | Held in React Hook Form via a DTO from `@wendy/contracts`. Cleared on cancel, on submit success (replaced by the navigation payload), or on submit failure (preserved so the Admin can correct without retyping). |
| Confirmation acknowledgement | local to `CredentialsConfirmationScreen` | Holds the cleartext password in component state until the Admin ticks the checkbox; cleared immediately after the navigation back to the section. Never reaches any persistence layer. |

##### Translation keys (i18n)

The translation catalogs (`en` and `es`) gain a new namespace **`admin.onboarding`** with the strings used by the form, the helper banner, the section landing copy, and the confirmation screen. Both catalogs must remain in sync; a CI check fails the build when a key exists in only one catalog.

---

### Cross-cutting Concerns

#### Security and Authorization

| Surface | Allowed roles | Notes |
|---|---|---|
| `/dashboard/wedding-planners/*` routes | `@Roles(Administrator)` at the `beforeLoad` of each route | The route lives inside the existing `(dashboard)` group, so the layout-level auth stays the same. The two new routes add a small role composable that reads from the `useUserInfo()` cache and redirects a Wedding Planner who types the URL by hand back to `/dashboard` without revealing the route exists. |
| `POST /api/v1/wedding-planners` | `@Roles(Administrator)` | `@UseGuards(JwtAuthGuard, RolesGuard)`; the calling principal must be an authenticated Administrator. |
| `GET /oauth/userinfo` | any authenticated user | `@UseGuards(JwtAuthGuard)` without `@Roles(...)`. The response always reflects the JWT subject — a caller cannot impersonate another user. |

#### Role-dependent UI never trusts client-decoded JWT (Rule 28)

The FE **must not** read the `role` claim from a client-decoded JWT for any UI-gating decision (sidebar visibility, "Onboard Wedding Planner" landing action, route `beforeLoad` redirects). The signature is verified server-side only; a forged JWT can fool the FE bundle into rendering Administrator-only affordances while failing every protected API call. Rule 28 closes that hole: the FE calls `GET /oauth/userinfo` (B Bearer-token) before rendering any role-dependent UI affordance, and reads `role` only from that response. The implementation:

- `apps/web/src/shared/auth/use-login.ts` already decodes the JWT to hydrate the profile at sign-in time. That decoded profile remains useful as a UX-fast-path (it avoids one round-trip on first paint of the dashboard), but **no role-gated affordance may use it** directly. A second hook, `useUserInfo()`, issues the bearer-authenticated `GET /oauth/userinfo` and exposes the same profile shape.
- The auth store keeps the decoded profile separate from the server-authenticated profile. The decoded profile has `source: 'jwt-decode'`; the server profile has `source: 'oauth-userinfo'`. The `useIsAdmin()` composable reads ONLY the server-authenticated profile.
- The dashboard layout calls `useUserInfo()` on mount. While the request is in flight, the role-gated affordances are not rendered (a micro-spinner is acceptable; the existing landing copy continues to show). On 401, the auth store is cleared and the user is redirected to `/login`.

#### Configuration (FE)

| Variable | Meaning | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Already used by `use-login`. Reused here unchanged. | empty (same-origin). |

The visual suffix shown beside the username field (`@wendy`) comes from a translation string in the bilingual catalog, not from a runtime config. Today both EN and ES render the same suffix string; the FE reuses the same value the server returns from `POST /api/v1/wedding-planners`. The catalog entry is treated as a build-time hint only — if it ever diverges from the server's authoritative value, the FE rejects the catalog value at boot of the form (defensive; not user-visible today).

---

## Cross-cutting Concerns (continued)

### Side-effects to update when this ships

- The bilingual catalogs (`apps/web/src/i18n/locales/en|es/*.json`) gain the `admin.onboarding` namespace.
- The feature flagging layer (when added) does not gate this story — onboarding is core MVP.
- The api-client's TypeScript type for `OnboardWeddingPlannerRequest` / `OnboardWeddingPlannerResponse` comes from `@wendy/contracts` (added in this spec).
- The front-end `navigation` between `onboard` and `credentials` carries the response in state but does NOT round-trip through query parameters (cleartext password must not appear in URLs / history).
