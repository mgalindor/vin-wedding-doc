---
title: "Technical Specification — US-006 + ARC-010: Confirm my identity to access the platform + Seed default Administrator"
date: 2026-08-14
type: specification
scope: internal
story-id: "US-006 + ARC-010"
status: draft
version: 1.1.0
updated: 2026-08-14
layers:
  backend: true
  frontend: true
  mobile: false
revision-history:
  - v1.1.0 (2026-08-14): minimum-viable scope cut per stakeholder review. Removed /oauth/refresh, /oauth/logout, /oauth/userinfo, /oauth/user/password, /.well-known/wendy-configuration. Access token TTL extended to 7 days; no refresh tokens; no revocation list. FE sign-out clears in-memory state only. User profile rides in the JWT claims.
  - v1.0.0 (2026-08-14): original draft.
---

# Technical Specification — US-006 + ARC-010: Confirm my identity to access the platform + Seed default Administrator

**Status: ⚠️ Draft**

---

## Scope

| Layer | Affected | Justification | foldername |
|---|---|---|---|
| Backend | Yes | ARC-010 ships a deploy-time seed script that creates the default `admin@wendy` account. US-006 ships a single new endpoint (`POST /oauth/token`) that validates credentials against the `users` table and signs a long-lived JWT containing the user's profile. The Web Frontend cannot deliver the login screen until this endpoint exists. | `apps/api` |
| Frontend Web | Yes | US-006 ships the login screen (route `/login`), an in-memory token store with the decoded JWT profile, the api-client with `Authorization: Bearer` injection, the dashboard layout with the personalized greeting and a sign-out affordance, and the bilingual EN/ES translations. ARC-010 does not affect the Frontend directly; the seed runs server-side only. | `apps/web` |
| Frontend Mobile | No | Out of scope per architecture §2.1 (PC + tablet only). | — |

---

## Architecture References

| Document | Description |
|---|---|
| `3-architecture/3.3-decision-record/adr-05-auth-jwt-bcrypt.md` | JWT (RS256+JWKS), bcrypt cost 12, OIDC-style URL paths. We use `/oauth/token` with `grant_type=password` per ADR-05 §Frontend integration. |
| `3-architecture/3.3-decision-record/adr-15-auth-framework-passport.md` | `@nestjs/passport` + `passport-jwt`, canonical NestJS recipe, JWT strategy + guard pattern. |
| `3-architecture/3.3-decision-record/adr-14-validation-class-validator.md` | DTOs in `@wendy/contracts` shared between API and Web; ValidationPipe at the API boundary. |
| `3-architecture/3.3-decision-record/adr-16-configuration-typed-classes.md` | Typed config classes with `class-validator` + `static fromEnv()`. |
| `3-architecture/3.2-blueprints/backend-blueprint.md` §3, §4, §5, §6 | Module layout, internal layers, data flow, cross-cutting concerns. |
| `3-architecture/3.2-blueprints/web-frontend-blueprint.md` §3, §5, §6 | Feature/route-group layout, data flow, api-client, auth store, i18n. |
| `4-specs/20260813-arc-013-015-036-auth-jwt-rbac-health/functional-spec.md` | The JWT primitives this story builds on (`JwtService`, `JwtStrategy`, `JwtAuthGuard`, `RolesGuard`, JWKS endpoint, `@Public` opt-out). |

---

## Backend

### API Endpoints

This spec ships **one** new endpoint and leaves the existing JWKS endpoint unchanged. All other auth endpoints (`/oauth/refresh`, `/oauth/logout`, `/oauth/userinfo`, `/oauth/user/password`, `/.well-known/wendy-configuration`) are deliberately deferred — see "Endpoints explicitly deferred" below.

#### CREATE — `POST /oauth/token`

The single login endpoint. Consumes the `AuthenticateUserUseCase` (validates credentials against the `users` table) and the existing `JwtService.signAccessToken` (from ARC-013). The response is a JWT plus the user's profile (the profile rides in the JWT payload so the FE does not need a separate endpoint).

```yaml
# POST /oauth/token
security:
  type: public
request:
  grant_type: str          # str, required, enum: ["password"]
  username: str            # str, required, regex: ^[a-z]+@wendy$, max 64 chars
  password: str            # str, required, min 1, max 256 chars
response:
  access_token: str        # str, required, JWT (RS256); lifetime 7 days
  token_type: str          # str, required, enum: ["Bearer"]
  expires_in: int          # int, required, seconds (604800 = 7 days)
  user:
    id: str                # str, required, 10-char NanoId
    fullName: str          # str, required
    email: str             # str, required
    role: str              # str, required, enum: ["Administrator", "WeddingPlanner"]
    tenantId: str          # str, required, 10-char NanoId
```

**Wrong-credentials behavior**: the endpoint returns `401 Unauthorized` with the standard envelope `{ code: "unauthorized", message: "Invalid username or password", traceId }`. The same response is used for: wrong username, wrong password, disabled account. No enumeration.

**JWT shape**: `{ sub: <userId>, fullName, email, role, tenantId, iat, exp, jti, iss: 'wendy-planner', aud: 'wendy' }`. The `fullName`, `email`, `role`, `tenantId` claims ride in the JWT so the FE can render the dashboard greeting without a second HTTP call.

**TTL change**: `JWT_ACCESS_TOKEN_TTL_SECONDS` is bumped from 900 (15 min) to 604800 (7 days) for this story. The same env var is reused; the default in `JwtConfig.fromEnv` is updated accordingly.

#### Unchanged — `GET /.well-known/jwks.json`

Already shipped by ARC-013. No change. Unauthenticated. Returns the public key in RFC 7517 shape. No additional endpoints are added in this spec.

#### Endpoints explicitly deferred

| Endpoint | Method | Owner | Why deferred |
|---|---|---|---|
| `POST /oauth/refresh` | POST | Not needed in MVP | Access token lifetime is 7 days — long enough to skip refresh; the WP re-enters the password when the token expires. |
| `POST /oauth/logout` | POST | Not needed in MVP | JWT is stateless; FE clears in-memory state and the credential expires naturally. No server-side session to terminate. |
| `GET /oauth/userinfo` | GET | Not needed in MVP | User profile rides in the JWT payload; FE decodes it once on sign-in. |
| `PUT /oauth/user/password` | PUT | ARC-018 (Sprint 2) | Self-service password change is not critical for MVP — admin reset covers the need. |
| `POST /oauth/revoke` | POST | Future | No revocation list in MVP; deferred until a security-incident response requirement emerges. |
| `GET /.well-known/wendy-configuration` | GET | Future | FE hardcodes the single `/oauth/token` path; discovery doc adds no value at this scale. |
| `POST /api/v1/wedding-planners` | POST | ARC-017 | WP onboarding (US-001) — out of scope of this story. |
| `POST /api/v1/wedding-planners/{id}/disable` | POST | ARC-018 | WP disable (US-004) — out of scope. |

---

### Database Changes

No new tables and no migration. The `users` table from ARC-008 already carries every field this story needs:

```dbml
Table users {
  id                 varchar(10)   [pk]
  tenant_id          varchar(10)   [not null]
  email              varchar(255)  [not null, unique]
  full_name          varchar(255)  [not null]
  phone              varchar(50)
  password_hash      varchar(72)   [not null]
  role               user_role     [not null]
  onboarded_by_admin_id varchar(10)
  is_disabled        boolean       [not null, default: false]
  created_at         timestamp     [not null, default: `now()`]
  updated_at         timestamp     [not null, default: `now()`]

  indexes {
    email [name: 'idx_users_email', unique]
    tenant_id [name: 'idx_users_tenant_id']
  }
}

enum user_role {
  Administrator
  WeddingPlanner
}
```

ARC-011 (Sprint 2) will turn `onboarded_by_admin_id` into a proper FK to `users.id`. ARC-018 will add the disable/reset flow.

---

### Events

Two audit events emitted on the in-process event bus. Until ARC-037 ships (Sprint 5), a no-op subscriber logs them at `info`/`warn` level; when ARC-037 lands, the subscriber switches to writing rows to `audit_events` without further code changes here.

| Event | When | Payload |
|---|---|---|
| `user.signed_in` | Successful login (default admin and WPs). | `{ userId, tenantId, role, timestamp }` |
| `user.sign_in_failed` | Wrong username, wrong password, or disabled account. | `{ attemptedEmail, reason: "wrong_credentials" \| "disabled_account", timestamp }` |

Events do NOT carry the password value, the access token, or any other secret. There are no events for logout or password change in this spec (those capabilities are deferred).

---

### Seed Script (ARC-010)

A standalone script invoked once at deploy time. It is NOT an HTTP endpoint and not a scheduled job. It runs as an ECS one-shot task (or `pnpm db:seed` locally) before the API service starts serving traffic.

Behavior:

- Connects to the database via the same Prisma client the API uses.
- Counts existing users with `email = 'admin@wendy'`.
- If none exists: generates a strong random password (≥ 16 chars, alphanumeric + symbols), stores its non-plain-text representation (per ADR-05 §Token mechanics — never persisted in clear text), creates the user row with `role: Administrator`, `tenant_id: 'default'`, `is_disabled: false`, `onboarded_by_admin_id: null`, and prints the generated password exactly once to stdout with a banner ("COPY THIS PASSWORD — IT WILL NOT BE SHOWN AGAIN").
- If one already exists with `role: Administrator`: exits 0 silently (idempotent re-run).
- If one already exists with a different role: exits non-zero with a clear error.
- If the database is unreachable: exits non-zero with the Prisma error.
- Does NOT create WPs, weddings, or any other data (Rule 7 of the functional spec).

The deploy pipeline calls the seed task before the API service task starts (same pattern as ARC-009's `prisma migrate deploy`). The seed task's IAM role has only `users` table write access.

---

### Third-party Integrations (Backend)

No external integrations in this spec.

---

## Frontend

### Structure

#### Screens / Views

| Action | Screen | Description |
|---|---|---|
| CREATE | `LoginScreen` | Two-field form (username, password) + submit button. Submits to `/oauth/token`. Redirects to `/dashboard` on success. Redirects to `/login` if the user is unauthenticated and visits any protected route. |
| CREATE | `DashboardLayout` | Top bar with the personalized greeting (from JWT claims) and the user menu (with the sign-out action). Wraps every `(dashboard)` child route. The group is still empty in Sprint 1 — US-009 will land its first child route here in Sprint 2. The group renders an empty-state placeholder for Sprint 1. |
| MODIFY | `(dashboard)` route group | Adds the `DashboardLayout` as the layout for the whole `(dashboard)` group. |
| CREATE | `ProtectedRoute` guard | Composable guard that reads the in-memory session. If unauthenticated, redirects to `/login`. Applied at the layout level so every `(dashboard)` child is protected by construction. |

#### Navigation and Routing

| Action | Route / Screen | Navigates from | Trigger | Stack type |
|---|---|---|---|---|
| CREATE | `/login` | anywhere (entry point) | User opens `/login` directly, or `ProtectedRoute` redirects an unauthenticated user | replace |
| CREATE | `/dashboard` | login | User submits login form successfully | replace (from /login) |

The `(public)` route group for invitations is unaffected by this story.

---

### Interaction

#### Form Specifications

**CREATE — LoginForm**

Lives in `LoginScreen`. Collects username and password; submits to `POST /oauth/token`.

| Field | Label | Input type | Required | Validation | Default |
|---|---|---|---|---|---|
| username | Username | text | Yes | Required; matches `^[a-z]+@wendy$` | — |
| password | Password | password | Yes | Required; min 1 char | — |

**Actions:**

| Action | Label | Behavior |
|---|---|---|
| submit | "Sign in" | Calls `POST /oauth/token` with the validated DTO. On success: stores the access token and the decoded profile in memory, navigates to `/dashboard`. On 401: shows the generic "Invalid username or password" error. On 5xx/network: shows a retry-friendly message. |
| — | — | Pressing Enter in any field submits the form. |

#### UI Behavior Rules

| Element | Rule | Trigger |
|---|---|---|
| Submit button | Disabled until both fields have a non-empty value | On any field change |
| Submit button | Shows a spinner and is disabled while the request is in flight | On submit |
| Username field | Shows inline error "Username is required" if empty on submit | On submit |
| Password field | Shows inline error "Password is required" if empty on submit | On submit |
| Username field | Shows inline error "Use the format nombre@wendy (lowercase)" if the value doesn't match the regex | On submit |
| Form (general) | Shows inline error "Invalid username or password." under the password field on 401 | On 401 response |
| Form (general) | Shows inline error "Sign-in service unavailable. Try again." on 5xx or network failure | On 5xx or network failure |
| Dashboard header | Shows "Welcome back, {fullName}" — the value comes from the JWT claims decoded at login | On dashboard mount |
| User menu | Shows "Sign out" as the only action in Sprint 1 | On menu open |
| Sign-out click | Clears the in-memory token and profile, redirects to `/login` | On click |
| Dashboard empty state | Renders a localized "No weddings yet" placeholder until US-009 ships | On dashboard mount |

#### i18n Keys (new in this spec)

| Namespace | Keys |
|---|---|
| `auth.login.title`, `auth.login.username`, `auth.login.password`, `auth.login.submit`, `auth.login.errors.required`, `auth.login.errors.format`, `auth.login.errors.invalid`, `auth.login.errors.unavailable`, `auth.login.help.contactAdmin` | Login screen strings |
| `dashboard.greeting`, `dashboard.signOut`, `dashboard.empty.title`, `dashboard.empty.body` | Dashboard layout strings |

Both EN and ES catalogs receive the same keys. A CI check fails the build if a key exists in only one catalog.

---

### Data

#### API Consumption (Frontend → Backend)

| Endpoint | Triggered by | Outcome in UI |
|---|---|---|
| `POST /oauth/token` | User submits the login form | On 200: stores access token in memory, decodes JWT claims into the user store, navigates to `/dashboard`. On 401: shows the generic error. On 5xx/network: shows the "try again" error. |
| `GET /.well-known/jwks.json` | Never (FE does not verify JWT signatures; BE does) | — |

#### Data State Design

| Data | Scope | Lifecycle |
|---|---|---|
| Access token | shared across screens | Created on successful login; held in memory only (never persisted to `localStorage` or cookies from JS). Cleared on sign-out or on tab close. Expires naturally after 7 days. |
| Current user profile (decoded from JWT) | shared across screens | Created on successful login by decoding the JWT payload once; cleared on sign-out. Stale data is acceptable for MVP — if the WP updates their profile (US-007), they re-login to see the new values. |
| Login form state | local to `LoginScreen` | Reset on successful submit. Held in React Hook Form; not persisted. |

**JWT decoding**: the FE decodes (does NOT verify) the JWT payload client-side using a tiny utility that splits on `.` and `atob()`s the middle segment. Verification happens server-side on every request. The decoded claims (`id`, `fullName`, `email`, `role`, `tenantId`) populate the in-memory user store once.

#### No refresh-on-401 pattern

Because there is no refresh endpoint, the api-client does not implement a refresh interceptor. On a 401 response (e.g. expired credential), the api-client clears the in-memory session and redirects to `/login`. The user signs in again.

---

### Third-party Integrations (Frontend)

None.

---

## Cross-cutting Concerns

### Security and Authorization

| Endpoint / Feature | Allowed roles | Notes |
|---|---|---|
| `POST /oauth/token` | unauthenticated | Login endpoint; CloudFront-level rate limiting is a deployment concern, not a code concern. |
| All other dashboard endpoints | `@Roles('Administrator')` or `@Roles('Administrator', 'WeddingPlanner')` (defined per-controller in their owning stories) | Protected by the global `JwtAuthGuard` + `RolesGuard` from ARC-015. |

#### Security trade-off: no revocation list

This spec deliberately does NOT ship a revocation list. The implications:

| Scenario | Behavior | Acceptable for MVP? |
|---|---|---|
| WP signs out | FE clears in-memory token; the credential remains valid on the backend until natural expiry (up to 7 days). | Yes — the FE cannot use it; if the WP signs in again, they get a new credential (the old one is still valid but inert from the FE's perspective). |
| WP is disabled by the Administrator (US-004, when ARC-018 ships) | New sign-ins are blocked; existing credentials remain valid until natural expiry. | Yes — the disabled WP can continue to use the platform for up to 7 days. Mitigation: the Administrator can also reset the password, but this does not invalidate live credentials either (no revocation list). The risk is accepted per the kickoff's manual-reset workflow. |
| WP's laptop is stolen | Attacker can use the credential for up to 7 days. | Yes — there is no security-incident response requirement in MVP. Mitigation: the WP can sign in again on a trusted device and use the platform normally; the compromised credential remains valid but the WP can change behavior to limit damage. A revocation list is the future fix. |
| JWT signing key needs rotation | Two-key rotation requires a brief window where both keys are advertised in the JWKS endpoint. | Already supported by ARC-013's `kid`-based JWKS. No change. |

A future iteration can add a revocation list (a single `revoked_jti` table or a `password_version` claim checked against the `users` row) when one of these scenarios becomes unacceptable for the product.

### Configuration

One new env var is read by the seed script (typed config class, ADR-16):

| Var | Required | Default | Notes |
|---|---|---|---|
| `SEED_ADMIN_EMAIL` | No | `admin@wendy` | Lets deployments override the default admin email. |

The seed reads `SEED_ADMIN_EMAIL` and uses `admin@wendy` if not set. `SEED_ADMIN_TENANT_ID` defaults to `'default'` (no env var; matches ARC-011's eventual FK plan). No new secret is introduced.

The existing `JWT_ACCESS_TOKEN_TTL_SECONDS` env var is **re-purposed** for the new 7-day lifetime. The default in `JwtConfig.fromEnv` is updated from 900 to 604800.

### Error Handling

| Scenario | Expected behavior |
|---|---|
| `POST /oauth/token` with malformed body | `400 Bad Request` with the standard validation envelope listing each failing field |
| `POST /oauth/token` with `grant_type` other than `"password"` | `400 Bad Request` with `{ code: "unsupported_grant_type", message: "Only grant_type=password is supported", traceId }` |
| `POST /oauth/token` with wrong username or wrong password | `401 Unauthorized` with `{ code: "unauthorized", message: "Invalid username or password", traceId }`. No distinction between "no such user" and "wrong password". |
| `POST /oauth/token` with disabled account | `401 Unauthorized` with the same envelope as above. |
| Dashboard endpoint with missing or invalid JWT | `401 Unauthorized` with the standard envelope (handled by the global `JwtAuthGuard`); the FE redirects to `/login`. |
| Seed script: existing `admin@wendy` with role `Administrator` | Exit 0 silently; no row updated |
| Seed script: existing `admin@wendy` with role `WeddingPlanner` | Exit non-zero; log a clear error; do NOT modify the row |
| Seed script: DB unreachable | Exit non-zero with the Prisma error message |

### Observability

- Successful logins log at `info` level with `{ userId, role, jti }`. No password value, no token value.
- Failed logins log at `warn` level with `{ attemptedEmail, reason }`. No password value.
- The seed script logs the generated password exactly once at `info` level via stdout, with a banner ("COPY THIS PASSWORD — IT WILL NOT BE SHOWN AGAIN"). After the seed completes, the same value is never logged again.
- The `traceId` is propagated through the FE api-client and attached to every API call so cross-layer tracing works (per ADR-16 + Sentry cross-cutting rules).

### Backend Blueprint Compliance

- New code follows `backend-blueprint.md` §3 (one `@Module` per bounded context) — the use case and controller land inside `apps/api/src/modules/identity/`. The use case lives in `application/`; the controller lives in `inbound-adapters/`; the Prisma repository lives in `outbound-adapters/`. DTOs are imported from `@wendy/contracts` per §6 Validation.
- The credential-verification use case depends on `JwtService` (already exported by `JwtInfrastructureModule` via `@Global()`); no new module-level wiring is needed.
- ESLint boundary rules from ARC-002 are respected — no cross-app imports.

### Frontend Blueprint Compliance

- New code follows `web-frontend-blueprint.md` §3 (feature folders, two lazy route groups). The login screen is a feature under `apps/web/src/features/auth/`. The session store lives in `apps/web/src/shared/auth/`.
- The api-client implements `Authorization: Bearer` injection in one place (`shared/api-client/`); features call `apiClient.get<DTO>(path)` and never see the token directly.
- i18n keys are added to both `apps/web/src/i18n/locales/en/` and `apps/web/src/i18n/locales/es/`; the CI check fails the build if a key is missing in either catalog.

---

## Technical Risks and Constraints

| Risk / Constraint | Impact | Mitigation |
|---|---|---|
| No revocation list — a stolen credential is valid for up to 7 days. | Medium (acceptable for MVP) | Documented above. The MVP has no security-incident response requirement. A future iteration can add a revocation list when the product grows. |
| Disabled accounts are blocked at sign-in but not retroactively — existing credentials remain valid. | Medium (acceptable for MVP) | Documented above. The disabled WP can use the platform for up to 7 days after disable. Admin-reset does not help (no revocation list). |
| 7-day access token TTL is long by industry standards (typically 15 min access + 7-day refresh). | Low | Accepted for MVP simplicity. The WP re-enters the password once a week. A future iteration can introduce refresh tokens if usage data warrants. |
| The seed script's password is logged to stdout, which means it lives in CloudWatch / the deploy log. | Medium | Banner in the seed output; deploy runbook documents the sensitivity. |
| The `fe-adapter` (`classValidatorResolver`) is deferred to Sprint 3 per the existing backlog. US-006's login form cannot use it in Sprint 1. | Low | The login form has only two fields with simple regex + required rules. Hand-written React Hook Form validation is sufficient. |
| The dashboard `is_disabled` check on every request is deferred. A disabled WP can keep reading data until their credential expires. | Medium | Documented. ARC-018 will not change this — a per-request check is a separate decision and requires either a revocation list or a `password_version` claim. |

---

## Open Questions

All questions answered for this spec (yolo mode). Reviewer should confirm or correct.

- [x] **Q1.** Should the seed live in the same Docker image as the API, or as a separate one-shot task? **Resolution:** Same image, separate entrypoint — `pnpm db:seed` vs `pnpm start`. Same Docker image keeps the deploy simple.

- [x] **Q2.** Should `/oauth/refresh` ship in this spec? **Resolution:** No. 7-day access token is long enough to skip refresh for MVP. If usage data warrants a shorter TTL with refresh, it is a future iteration.

- [x] **Q3.** Should `/oauth/logout` ship in this spec? **Resolution:** No. JWT is stateless; FE clears in-memory state and the credential expires naturally. The complexity of a revocation list is not justified at MVP scale.

- [x] **Q4.** Should `/oauth/userinfo` ship in this spec? **Resolution:** No. The user's profile rides in the JWT payload; the FE decodes it once on sign-in.

- [x] **Q5.** Should `/oauth/user/password` ship in this spec? **Resolution:** No. Admin-reset (ARC-018, Sprint 2) covers the MVP need. Self-service password change is a future iteration.

- [x] **Q6.** Should `/.well-known/wendy-configuration` ship in this spec? **Resolution:** No. The FE hardcodes the single `/oauth/token` path. Discovery doc is unnecessary overhead at this scale.

- [x] **Q7.** Should the login form support "remember me"? **Resolution:** No. The 7-day token TTL already implements "remember me" for MVP. The login form has no checkbox.

- [x] **Q8.** Should the access token be persisted across page reloads (e.g. sessionStorage)? **Resolution:** No. The token lives only in memory. Closing the browser tab clears it. Reopening within 7 days does NOT restore the session — the WP must sign in again. (Tab close = sign-out for MVP. Acceptable for the small user base.)
