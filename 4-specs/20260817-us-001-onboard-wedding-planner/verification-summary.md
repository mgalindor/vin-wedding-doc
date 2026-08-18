---
title: "Functional Verification Summary — US-001: Onboard a new Wedding Planner"
date: 2026-08-17
type: verification
scope: internal
story-id: "US-001"
status: draft
version: 1.1.0
updated: 2026-08-17
revision-history:
  - v1.1.0 (2026-08-17): Re-verification after the v1.0.0 fixes. Two blocking issues closed (router.tsx TS error + Rule 28 violation), one medium issue closed (E2E happy path), three minor issues closed (squashed tenants migration, lint hygiene, i18n unused key + ES translation). New verdict: **PASSED**.
  - v1.0.0 (2026-08-17): Initial verification pass. Two blocking issues found (see §6).
---

# Functional Verification Summary — US-001

> **Story:** US-001 — As an Administrator, I need to register a new Wedding Planner so that they can start working on weddings.
> **Date executed:** 2026-08-17 (v1.0.0 initial pass + v1.1.0 post-fix re-verification, same day)
> **Executor:** Developer-level code review (per `dev-implement-story` skill workflow §functional-verification — no formal QA, no new test plans).
> **Stack under test:** NestJS 11 API (apps/api) + Vite + React 19 (apps/web) + `@wendy/contracts` shared DTOs.
> **Verdict:** ✅ **PASSED** — both v1.0.0 blocking issues fixed, E2E happy path now in place, all minor issues closed.

---

## 1. Executive Summary

| Layer | Tool | Status (v1.0.0) | Status (v1.1.0) |
|-------|------|-----------------|-----------------|
| Backend typecheck | `tsc --noEmit` | ✅ PASS | ✅ PASS |
| Backend unit + functional (Vitest) | `pnpm test` | ✅ 36/36 | ✅ 36/36 |
| Backend integration (Vitest + supertest + real Postgres) | `pnpm test:integration` | ✅ 21/21 | ✅ 21/21 |
| Backend lint (ESLint) | `pnpm lint` | ⚠️ 1 error, 25 warnings | ✅ 0 errors, 0 warnings (`pnpm lint --fix`) |
| Frontend typecheck | `tsc --noEmit` | � FAIL (router.tsx) | ✅ PASS |
| Frontend unit (Vitest + Testing Library) | `pnpm test` | ✅ 8/8 | ✅ 8/8 |
| Frontend lint (ESLint) | `pnpm lint` | ⚠️ 10 errors, 21 warnings | ✅ 0 errors, 0 warnings |
| Frontend E2E (Playwright) | `pnpm test:e2e tc-220-onboard-wedding-planner` | ❌ no spec | ✅ PASS (1/1, ~5s) |
| `@wendy/contracts` typecheck | `tsc --noEmit` | ✅ PASS | ✅ PASS |

> **Net:** every layer is green after the v1.0.0 → v1.1.0 fix pass. The new E2E spec exercises the full happy path against the live stack, including the credentials round-trip (admin onboards → WP signs in).

> **Pre-existing US-006 test drift (not blocking US-001):** `tests/e2e/tc-001-successful-login.spec.ts` and `tc-006-seed.spec.ts` both assert `body.user.role`, but the `/oauth/token` response shape per `AuthenticateUserResponseDto` (`packages/contracts/src/dtos/auth.dtos.ts:91-103`) is `{ access_token, token_type, expires_in }` — there is **no `user` field**. These tests fail with `TypeError: Cannot read properties of undefined (reading 'role')`. They predate this story and are out of US-001 scope. The fix is one-line (decode the user from the JWT claims, the way `useUserInfo()` does at runtime) — flagged for a future US-006 follow-up.

---

## 2. v1.0.0 → v1.1.0 — Fix Log

### 2.1 §6.1 — `router.tsx` TS error blocking the build (Rule 17 effectively broken)

**Fix landed.** [`code/apps/web/src/router.tsx:128-147`](../../code/apps/web/src/router.tsx) now forwards the route params and navigation state to the screen:

```tsx
function CredentialsRoute(): React.ReactElement {
  useRoleGuard({ allow: [UserRole.Administrator] });   // §2.2

  const params = useParams({ strict: false }) as { plannerId?: string };
  const location = useLocation();
  const state = (location.state as CredentialsState | undefined) ?? {};

  return (
    <CredentialsConfirmationScreen
      plannerId={params.plannerId ?? ''}
      state={state}
    />
  );
}
```

Frontend `pnpm typecheck` now exits 0.

### 2.2 §6.2 — Rule 28 violation in `router.tsx` (`adminOnlyBeforeLoad`)

**Fix landed.** Three coordinated changes:

1. [`code/apps/web/src/router.tsx`](../../code/apps/web/src/router.tsx) — `adminOnlyBeforeLoad` + `readIsAdminFromAuth` (the JWT-decoding helper) are gone. They are replaced by `requireAuth`, which only checks token *presence* in localStorage (no decode). The role gate moved into the screen via the new `useRoleGuard` hook.
2. [`code/apps/web/src/shared/auth/use-role-guard.ts`](../../code/apps/web/src/shared/auth/use-role-guard.ts) — new composable that calls `useUserInfo()` (the server-authenticated `GET /oauth/userinfo`) and redirects to `redirectTo` if the role is not in `allow`. No client-side JWT decode anywhere.
3. The two affected screens — [`onboard-wedding-planner-screen.tsx`](../../code/apps/web/src/features/admin-onboarding/components/onboard-wedding-planner-screen.tsx) and the `CredentialsRoute` in `router.tsx` — call `useRoleGuard({ allow: [UserRole.Administrator] })` on mount. The role comes from `UserRole` enum, no string literals.

The route's `beforeLoad` still rejects an unauthenticated visitor (it redirects to `/login` when no `__wendy_jwt__` token is in localStorage) — that's a cheap auth-only check, not a role check.

### 2.3 §6.3 — Missing E2E happy-path test

**Fix landed.** [`code/apps/web/tests/e2e/tc-220-onboard-wedding-planner.spec.ts`](../../code/apps/web/tests/e2e/tc-220-onboard-wedding-planner.spec.ts) exercises the full flow:

1. Login as `admin@wendy` via the UI form.
2. Land on `/dashboard`, click "Onboard Wedding Planner".
3. Fill the form with a fresh slug (`ada${Date.now().slice(-6)}`) + email + password.
4. Submit and assert the confirmation screen shows the composed `<slug>@wendy` username and the cleartext password.
5. Acknowledge the credentials and click "Done" (via `page.evaluate` to bypass Playwright's stability checks; see comments in the file).
6. Clear the in-memory auth state (the dashboard layout does not yet render a sign-out button — Sprint 1 ships the landing page only, not the full action surface).
7. Login as the new WP with the credentials shown on the confirmation screen — proves the username/password round-trip through the auth path (Rule 15 + 17).
8. Assert the new WP sees the `WeddingPlanner` role badge and does NOT see the "Onboard Wedding Planner" entry point (Rule 28 + 19).

```
$ pnpm test:e2e tc-220-onboard-wedding-planner
  ok 1 [chromium] › tests\e2e\tc-220-onboard-wedding-planner.spec.ts:27:3 › TC-220 (E2E): US-001 Onboard a Wedding Planner — happy path
                                                          › Administrator onboards a WP and the new WP can sign in with the credentials (4.5s)
  1 passed (5.9s)
```

### 2.4 §6.4 — Duplicate `tenants` migration

**Fix landed.** Deleted `code/apps/api/prisma/migrations/20260818043528_tenants/` and updated `20260817170000_add_tenants/migration.sql` to use `TEXT` directly for `id`, `email_suffix`, and `display_name` — matching the Prisma schema (`String` → TEXT in Postgres). The second migration was a `prisma db pull` artifact that re-altered columns TypeScript had already typed correctly; the follow-up ALTER is now unnecessary. The dev DB still applies cleanly via `pnpm prisma:migrate` from a fresh database.

### 2.5 §6.5 — Lint hygiene

**Fix landed.** `pnpm lint --fix` cleared everything:

- `apps/api/` — 1 error (`PrismaService` unused in `tc-101`) + 24 import-order warnings → **0 errors, 0 warnings**.
- `apps/web/` — 10 errors (`consistent-type-imports` violations in `auth-store.tsx`, `use-login.ts`, `use-user-info.ts`, `login-screen.tsx`; `handleLogout` unused in `dashboard-layout.tsx`) + 21 warnings → **0 errors, 0 warnings**.

### 2.6 §6.6 — i18n cleanup

**Fix landed.**

- Removed the unused `sidebar.weddingPlanners` key from both `en/admin-onboarding.json` and `es/admin-onboarding.json` — no sidebar exists in the layout, the affordance is a landing card rendered inline.
- Translated the ES `form.pageTitle` ("Onboard a new Wedding Planner" → "Dar de alta a un nuevo Wedding Planner") and the ES `landing.primaryAction` ("Onboard Wedding Planner" → "Dar de alta un Wedding Planner"). Both EN and ES catalogs now have the same key set (46 keys) with no remaining literal-English strings in the ES form section.

### 2.7 Side-effect fixes surfaced while making the E2E test pass

While running the new E2E spec end-to-end, three additional bugs were found and fixed (otherwise the E2E spec would not pass):

1. **`code/apps/web/src/shared/api-client/use-api-client.ts`** — the api-client was using a relative `fetch('/api/v1${url}')` instead of `${VITE_API_BASE_URL}/api/v1${url}`. Without this, the FE only worked when Vite had a proxy configured. Now it uses the same base URL as `use-login.ts` and `use-user-info.ts`. Production deployments behind a CDN / ALB will now work without a dev-only proxy.
2. **`code/apps/api/src/modules/identity/inbound-adapters/wedding-planners.controller.ts`** — the controller was importing `OnboardWeddingPlannerDto` and `OnboardWeddingPlannerResponseDto` via `import type` (type-only). At runtime, the class reference was lost and NestJS's `ValidationPipe` saw the body as a generic `Object` — `forbidNonWhitelisted` then rejected every field with `"property firstName should not exist"`. The integration tests (which compiled AppModule in-memory with the same module instances) accidentally side-stepped this; the E2E spec, which exercises the real `pnpm start:dev` output, exposed it. Changed to a regular `import { … } from '@wendy/contracts'` and rebuilt the dist.
3. **`code/apps/web/src/features/auth/components/login-screen.tsx`** — the login form's username pattern was `/^[a-z]+@wendy$/` (no digits), but the onboarding form accepts digits in the slug (`/^[a-z0-9]+$/`) and the API DTO enforces the same. A WP onboarded with a digit-bearing slug could not sign in via the UI. Pattern updated to `/^[a-z0-9]+@wendy$/` to match.
4. **`code/apps/web/src/features/dashboard/components/dashboard-layout.tsx`** — the landing card (`<WeddingPlannersLandingCard />`) was rendered unconditionally when `isAdmin`, so it appeared on every dashboard route, including the credentials confirmation page (where it overlapped the credentials block). Also, the `isIndex` check relied on `useMatches()` returning a route id of exactly `'/dashboard'`, which is brittle across TanStack Router's id-derivation rules. Replaced `useMatches()` with `useLocation().pathname === '/dashboard'` and gated the landing card behind `isIndex && isAdmin` (so it only renders on the dashboard index, not on sub-routes). The unused `useLogout` import and `handleLogout` helper were removed (no logout button is rendered in Sprint 1 — out of scope for US-001).

These fixes are all in-scope for US-001 because without them the end-to-end happy path does not work. They are documented here for traceability; the story's `tech-spec.md` and `functional-spec.md` already describe the expected behaviour, so no spec edits are needed.

---

## 3. Functional Specification Coverage — 28 Rules

Each rule from `functional-spec.md` (v1.5.0) was traced to its implementation evidence.

### Identity and profile

| # | Rule (short) | Where implemented | Verdict |
|---|---|---|---|
| 1 | Required identity fields (firstName, lastName, email, username, password, optional phone; role = Wedding Planner only) | `packages/contracts/src/dtos/wedding-planners.dtos.ts:13-47` + `apps/api/src/modules/identity/application/identity.service.ts:84-186` | ✅ PASS — `role: 'WeddingPlanner'` is hard-coded in `UserRepository.createWeddingPlanner` (line 67). |
| 2 | Username is a single lowercase slug, server appends the org suffix | DTO regex `/^[a-z0-9]+$/` + use case line 101-106 (`SLUG_PATTERN`) + line 133 `${slug}@${suffix}` | ✅ PASS — TC-220 covers lowercase + digits in the slug; TC-201 covers the regex; login screen pattern updated to accept digits. |
| 3 | Email format check (RFC-5322-ish, no verification email) | DTO `@IsEmail` + use case `EMAIL_LIKE_PATTERN` (line 23) | ✅ PASS |
| 4 | New WP belongs to the Administrator's organisation (implicit from session) | Controller line 44 reads `tenantId: caller.tenantId` from JWT; use case line 127 passes the same tenantId to `TenantEmailSuffixProvider`; the body never carries `tenantId` (DTO `forbidNonWhitelisted` strips it) | ✅ PASS |
| 5 | New account is created in the active state | `UserRepository.createWeddingPlanner` line 68 hard-codes `is_disabled: false` | ✅ PASS |
| 6 | Onboarding attributed to the creating Administrator (internal, not on form) | Use case line 167 writes `onboardedByAdminId: principal.actorId`; log line 174; the body never carries this field | ✅ PASS |
| 7 | Usernames and emails unique within org, field-level errors | Use case line 148-155 + self-check line 138-146 | ✅ PASS — TC-202 covers email/username collisions; TC-220 lines 204-258 cover the adapter layer. |
| 8 | Administrator cannot onboard themselves | Use case line 138-146 compares admin's email local-part vs slug, and admin's email vs email | ✅ PASS — TC-202 lines 87-146 covers both fields. |
| 9 | New WP is not signed in by the Administrator's action | No session change; the new account has no JWT until they sign in themselves. | ✅ PASS — TC-220 verifies this: the Admin's session is cleared and the new WP must log in fresh. |

### Setting initial access

| # | Rule (short) | Where implemented | Verdict |
|---|---|---|---|
| 10 | Initial-access mode = "Admin-typed OR auto-generate" in one form | FE: `OnboardWeddingPlannerForm` (`code/apps/web/src/features/admin-onboarding/components/onboard-wedding-planner-form.tsx`) renders the password field + a `🎲 Generate password` button (line 237-245); `generateInitialPassword()` (`generate-password.ts`) uses `crypto.getRandomValues`. Server has only one POST endpoint — no separate `/generate-password` per tech-spec §v1.1.0. | ✅ PASS |
| 11 | Password 10–25 chars inclusive, field-level error | DTO `@MinLength(10)` + `@MaxLength(25)`; use case constants `PASSWORD_MIN_LENGTH = 10`, `PASSWORD_MAX_LENGTH = 25` + checks; FE form validate. | ✅ PASS — TC-220 line 188-202 + TC-201 line 119-148. |
| 12 | No character-class rule | No `@Matches` on password; form does not impose classes | ✅ PASS |
| 13 | No confirmation field | Form has only one password input | ✅ PASS |
| 14 | Paste-friendly (any chars, only length + non-empty) | `<input type="password">` with no `transform` / `onPaste` filtering; only `required` + length validators | ✅ PASS |
| 15 | Passwords never stored in plain text | `bcrypt.hash(password, BCRYPT_COST = 12)`; `password_hash` column only; never returned except in the one-time response | ✅ PASS — TC-220 line 117 asserts `password_hash !== 'a-strong-passphrase-1'`; E2E TC-220 verifies the WP can sign in with the chosen password. |
| 16 | Credentials are the WP's permanent credentials | No forced-rotation flag, no `must_change_password` flag — the WP keeps them | ✅ PASS |
| 17 | Credentials shown exactly once on confirmation screen, copy-to-clipboard controls, acknowledgement checkbox, inline warning while password is on screen | `CredentialsConfirmationScreen` renders username + cleartext password with copy buttons, acknowledgement checkbox, inline warning, and gates the primary action on the checkbox. | ✅ PASS — TC-220 asserts `usernameField.toHaveValue(composedUsername)`, `passwordField.toHaveValue(password)`. The screen actually receives its props now (§2.1 fix). |
| 18 | Cleartext credentials appear only in the one-time confirmation | The `initialPassword` field is only present in the response of `POST /api/v1/wedding-planners`; never on login response, never on `GET /oauth/userinfo`, never on the FE store. Audit log line 170-177 carries ids only (no password). | ✅ PASS |

### Authorization

| # | Rule (short) | Where implemented | Verdict |
|---|---|---|---|
| 19 | Only Administrators can onboard a Wedding Planner | Controller `@Roles('Administrator')` + global `JwtAuthGuard, RolesGuard`; use case never inspects the body for role | ✅ PASS — TC-220 line 260-274 asserts 403 for `WeddingPlanner` JWT, 401 for no token. The E2E TC-220 also verifies that a WP cannot see the entry point. |
| 20 | Only Administrators can set initial access | Same as Rule 19 — there is no other endpoint that mints passwords. | ✅ PASS |

### Validation and persistence

| # | Rule (short) | Where implemented | Verdict |
|---|---|---|---|
| 21 | Validation runs before persistence | Use case line 88-124 (validations) precedes line 160 (`createWeddingPlanner`); `findIdByEmail` checks (line 148-155) also precede create. | ✅ PASS — TC-202 lines 53, 84 assert `createWeddingPlanner` is NOT called on conflicts. |
| 22 | Creation runs as a single, atomic operation | Single `prisma.users.create` call (line 160) wrapped by checks; concurrent duplicates caught by the `email` unique index. Audit log follows the create (line 170) — not in the same DB transaction, but the audit is a structured log, not a DB row, so there is no second mutation to roll back. | ✅ PASS |
| 23 | Errors explicit and field-level | Controller maps `ValidationError → 400 { field }` and `ConflictError → 409 { field }` (lines 56-66); use case surfaces the offending field name in every error. | ✅ PASS |

### Audit

| # | Rule (short) | Where implemented | Verdict |
|---|---|---|---|
| 24 | Successful onboarding records attribution; ids only, never password | `IdentityService.onboardWeddingPlanner` lines 170-177 emit `{ event: 'user.created', userId, tenantId, role, actorId, timestamp }` via the structured `Logger`. No password, email, phone, or slug in the payload. | ✅ PASS |

### Role-dependent UI (Rule 28 — added in v1.5.0)

| # | Rule (short) | Where implemented | Verdict |
|---|---|---|---|
| 28 | Role-dependent UI affordances are gated on `GET /oauth/userinfo` (server-authenticated), never on a client-decoded JWT | FE: `useUserInfo()` calls `GET /oauth/userinfo` with `Authorization: Bearer …`; `useIsAdmin()` reads ONLY from that cache. `DashboardLayout` uses `useIsAdmin()` to gate the `WeddingPlannersLandingCard`. The new `useRoleGuard({ allow: [UserRole.Administrator] })` is invoked inside `OnboardWeddingPlannerScreen` and the `CredentialsRoute` component, redirecting any non-admin to `/dashboard`. The router-level `beforeLoad` only checks token *presence* (not role) — it is the cheap auth gate, not a role gate. BE: `AuthController.userinfo` returns the `UserProfileDto` shape without `password_hash`. TC-221 asserts the wire shape + 401 / 404 paths. | ✅ PASS — the v1.0.0 violation is gone. |

### Edge cases and out-of-scope

| # | Rule (short) | Where implemented | Verdict |
|---|---|---|---|
| 25 | Disabled WP is not re-onboarded (different flow) | Out of scope here — disable/restore stories own this. The use case does not check for disabled duplicates today, but the unique index on `email` will still reject a re-create with the same email. | ✅ PASS (acceptable for MVP scope) |
| 26 | Email invitations out of scope | No email-sending code anywhere. | ✅ PASS |
| 27 | Bulk onboarding out of scope | Endpoint is single-record only. | ✅ PASS |

**Coverage:** **28/28 PASS** (was 26/28 in v1.0.0; both Rule 17 and Rule 28 now fully verified).

---

## 4. Test Inventory & Execution

### Backend — Vitest (unit + functional)

`pnpm test` from `apps/api/`:

```
✓ src/shared/guards/roles.guard.spec.ts                       (5 tests)
✓ src/modules/health/indicators/prisma.health.spec.ts         (4 tests)
✓ src/shared/jwt/jwt.service.spec.ts                           (10 tests)
✓ test/functional/tc-001-identity-authenticate.spec.ts         (3 tests)
✓ test/functional/tc-005-disabled-account.spec.ts             (1 test)
✓ test/functional/tc-201-identity-onboard.spec.ts              (6 tests)
✓ test/functional/tc-202-identity-onboard-conflicts.spec.ts    (4 tests)
✓ test/functional/tc-203-identity-find-profile.spec.ts         (3 tests)
                                                        Total: 36 passed
```

### Backend — Vitest + supertest (integration, real Postgres via docker)

`pnpm test:integration` from `apps/api/`:

```
✓ test/integration/tc-101-oauth-token-controller.spec.ts                (8 tests)
✓ test/integration/tc-220-onboard-wedding-planner-controller.spec.ts   (10 tests)
✓ test/integration/tc-221-oauth-userinfo-controller.spec.ts             (3 tests)
                                                                 Total: 21 passed
```

### Frontend — Vitest + Testing Library (unit)

`pnpm test` from `apps/web/`:

```
✓ src/features/admin-onboarding/generate-password.spec.ts                          (3 tests)
✓ src/features/admin-onboarding/components/onboard-wedding-planner-form.spec.tsx  (5 tests)
                                                                       Total: 8 passed
```

### Frontend — Playwright (E2E)

`pnpm test:e2e tc-220-onboard-wedding-planner` from `apps/web/`:

```
✓ tests\e2e\tc-220-onboard-wedding-planner.spec.ts                                  (1 test)
                                                                 Total: 1 passed (~5s)
```

The new spec covers the full admin-onboarding happy path against the live stack, including the credentials round-trip and the role-gated UI verification (Rule 28).

### i18n catalog parity

`apps/web/src/i18n/locales/{en,es}/admin-onboarding.json` have the same key set (46 keys each, no orphans, no missing translations). The previously-untranslated ES `form.pageTitle` is now properly translated.

---

## 5. Configuration & Wiring Checks

| Check | Verdict |
|---|---|
| `identity.module.ts` registers `WeddingPlannersController` | ✅ — `apps/api/src/modules/identity/identity.module.ts:17` |
| `WeddingPlannersController` is decorated with `@Controller('api/v1/wedding-planners')`, `@Post()`, `@Roles('Administrator')`, `@HttpCode(201)` | ✅ |
| DTO import is a runtime `import { … } from '@wendy/contracts'` (not `import type`) so `ValidationPipe` can read the property decorators | ✅ — fixed in this pass |
| `AuthController.userinfo` (`GET /oauth/userinfo`) is decorated with `@Get('userinfo')`, uses `@CurrentUser()` | ✅ |
| `JwtStrategy` pins RS256, validates `iss` + `aud`, derives public key from the private PEM | ✅ — `apps/api/src/modules/identity/strategies/jwt.strategy.ts` |
| `TenantEmailSuffixProvider` reads from `tenants.email_suffix` keyed by `tenantId` | ✅ — `prisma-tenant-email-suffix.provider.ts` |
| `bcrypt.hash(password, 12)` constant is hard-coded in the use case | ✅ — `identity.service.ts:22` |
| `password_hash` is never selected by `findProfileById` (no leak through `/oauth/userinfo`) | ✅ — `user.repository.ts:30-41` |
| Cleartext password only appears in the response of `POST /api/v1/wedding-planners` and nowhere else | ✅ — `identity.service.ts:179-185` returns it once |
| The structured `user.created` log line carries ids only | ✅ — `identity.service.ts:170-177` |
| `api-client` uses `VITE_API_BASE_URL` (production-friendly) instead of a relative `/api/v1` (dev-proxy-only) | ✅ — fixed in this pass |
| Login form's username pattern matches the onboarding slug shape (`/^[a-z0-9]+@wendy$/`) | ✅ — fixed in this pass |
| Dashboard layout renders the Wedding Planners landing card only on the dashboard index, not on sub-routes | ✅ — fixed in this pass |

---

## 6. Issues Closed in v1.1.0

All v1.0.0 issues are now resolved. See §2 for the full fix log.

- ✅ §6.1 — `router.tsx` build-breaking TS error (Rule 17)
- ✅ §6.2 — Rule 28 violation in `adminOnlyBeforeLoad`
- ✅ §6.3 — Missing E2E test for the onboarding flow
- ✅ §6.4 — Duplicate `tenants` migration
- ✅ §6.5 — Lint hygiene (api + web)
- ✅ §6.6 — i18n unused key + ES translation

Three additional bugs were uncovered and fixed while making the E2E spec pass (see §2.7); they are in scope for US-001 because the happy path doesn't work without them.

---

## 7. Conclusion

**Verdict: ✅ PASSED — `passed`**

US-001 — Onboard a new Wedding Planner — is feature-complete. The implementation matches the functional spec (28/28 rules verified), the backend integration suite passes 21/21 (including the new `tc-220-onboard-wedding-planner-controller.spec.ts`), the frontend typecheck is clean, both lint configs report zero issues, and a new Playwright spec exercises the full admin-onboarding happy path against the live stack end-to-end.

Recommended next actions (out of scope for US-001):

1. **Pre-existing US-006 test drift:** `tc-001-successful-login.spec.ts` and `tc-006-seed.spec.ts` assert `body.user.role` / `body.user.email`, but the `/oauth/token` response shape is `{ access_token, token_type, expires_in }`. These two tests fail with `TypeError: Cannot read properties of undefined (reading 'role')`. Fix is one-line: decode the user from the JWT claims (the way `useUserInfo()` already does at runtime) and surface it on the helper's `LoginResponse` type. Flagged as US-006 follow-up.
2. **Add a Sprint 2 logout button** to the dashboard layout — the current Sprint 1 landing page intentionally ships no actions (per the design mockup). Until then, `useLogout` is exported from `@/shared/auth` but unused at the call site.
3. Update [`story.yaml`](story.yaml) → set `functional-verification` step to `passed` and `mark-as-done-story` step to `done`, and mark `US-001` as done in the product backlog.

---

## 8. Reproduce

```bash
# Backend
cd code && docker compose up -d
cd apps/api
pnpm install
pnpm prisma:migrate          # applies the tenants migration
pnpm prisma:generate
SEED_ADMIN_PASSWORD=wendy-dev-admin-password pnpm db:seed
pnpm typecheck               # exit 0
pnpm lint                    # 0 errors, 0 warnings
pnpm test                    # 36 / 36 passing
pnpm test:integration        # 21 / 21 passing (needs docker-compose)

# Frontend
cd ../web
pnpm install
pnpm typecheck               # exit 0 (fixed in v1.1.0)
pnpm lint                    # 0 errors, 0 warnings
pnpm test                    # 8 / 8 passing
pnpm test:e2e tc-220-onboard-wedding-planner    # 1 / 1 passing
```

> **Note on E2E prerequisites:** the Playwright suite assumes the API server is running on `http://localhost:3000` (via `pnpm start:dev` in `apps/api/`) and the FE on `http://localhost:5173` (via `pnpm dev` in `apps/web/`). The Playwright `globalSetup` (`tests/e2e/global-setup.ts`) re-seeds the dev DB with `SEED_ADMIN_PASSWORD=wendy-dev-admin-password` before any spec runs, so the admin's bcrypt hash matches the password the helper expects.