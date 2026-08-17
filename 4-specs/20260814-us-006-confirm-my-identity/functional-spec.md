---
title: "Specification: Confirm my identity to access the platform + Seed default Administrator"
date: 2026-08-14
type: specification
scope: internal
story-id: "US-006 + ARC-010"
status: draft
version: 1.2.0
updated: 2026-08-14
revision-history:
  - v1.2.0 (2026-08-14): minimum-viable scope cut per stakeholder review. Removed server-side logout endpoint (JWT is stateless; FE clears in-memory state and the token expires naturally). Removed `/oauth/userinfo` (claims ride in the JWT). Removed `/oauth/user/password` self-service change (deferred to a later iteration; admin reset covers MVP). Removed `.well-known/wendy-configuration` discovery doc (FE hardcodes the single private path). Access token TTL is now 7 days; no refresh tokens.
  - v1.1.0 (2026-08-14): included ARC-010 (Seed initial Admin) in this spec so the platform can be tested end-to-end. Removed implementation-specific wording (bcrypt, hashed, cookie attributes, cryptographic-source phrasing) per stakeholder review — this is a functional document.
  - v1.0.0 (2026-08-14): original draft for US-006 only.
---

# Confirm my identity to access the platform + Seed default Administrator

> **Status: Draft**
> **Stories in this spec**: `US-006` (Wedding Planner confirms identity to access the platform) and `ARC-010` (seed the initial `admin@wendy` so the platform has a default account for Vineyards before any WP logs in).

## User Stories

`US-006` Confirm my identity to access the platform - As a Wedding Planner, I need to confirm who I am when I open the platform so that only I can reach my weddings [groupBy:: user-and-role-management] [priority:: 3]

`ARC-010` Seed initial Admin (`admin@wendy`) - As the delivery team, we need a deploy-time seed script that creates the first Administrator with a randomly generated password, logs it once to the deployer's terminal, and stores only its non-plain-text representation. This password is the admin's permanent password (no forced rotation on first login). [groupBy:: arq] [priority:: 3]

## Context

Wendy Planner hosts confidential wedding data (guest lists, contact information, photos) for ~10 Wedding Planners at Vineyards. Today, each WP coordinates weddings manually via Excel files; the platform replaces that with a single shared tool. For the platform to be trustworthy, every WP must be able to prove they are who they say they are when opening it — and no one else (including other WPs or the Administrator) may reach their weddings.

The Administrator is the only person who provisions accounts. To make the platform usable from the very first deployment, **a default Administrator account (`admin@wendy`) must exist before any WP can log in**. Without it, no WP can ever authenticate, the login flow cannot be tested, and the platform cannot be onboarded by Vineyards. This is why ARC-010 ships bundled with US-006 — the default admin is the seed that allows the Administrator to begin onboarding WPs (US-001), and US-006 cannot be demonstrated end-to-end without it.

The default admin is created once at deploy time with a strong, randomly generated password that the deployer delivers to Vineyards out-of-band (the deployer reads it once from the deploy log and hands it to Vineyards). Vineyards is expected to change it after first use (voluntarily, through the profile screen — the MVP does not force a rotation on first login).

The WP signs in with credentials of the form `nombre@wendy` plus a password that the Administrator assigned out-of-band. After signing in, the WP remains signed in until they explicitly sign out or until 7 days of inactivity pass. A short-lived session token expires automatically; the platform transparently renews it without asking the WP to re-enter their password. The platform never asks the WP to change their password on first login — the Admin-assigned password is the WP's permanent password (the WP may change it voluntarily later).

If credentials are wrong, the platform does not reveal whether the username exists. It does not lock accounts. It does not send password-recovery emails (out of scope for MVP). The only way for a WP to regain access when they have forgotten their password is to ask the Administrator to reset it.

## Dependencies

| Story | Type | Description |
|---|---|---|
| `ARC-008` Initialize Prisma `users` migration | Requires | The `users` table with `email`, password storage column (non-plain-text), `role`, `is_disabled`, `tenant_id` must exist (already shipped). |
| `ARC-013` JWT auth (RS256) + JWKS | Requires | JWT issuance/verification primitives with RS256 and the `/.well-known/jwks.json` endpoint (already shipped). |
| `ARC-015` Passport-jwt + RBAC guards | Requires | `JwtAuthGuard`, `RolesGuard`, `@CurrentUser`, `@Roles`, `@Public` decorators (already shipped). |
| `US-001` Onboard a new Wedding Planner | Required by | The Administrator must create the WP account (with an assigned password) before the WP can sign in. ARC-017 implements the `POST /api/v1/wedding-planners` endpoint. |
| `US-005` Restore a Wedding Planner's access | Required by | When a WP is locked out, the Administrator resets the password so the WP can sign in again. ARC-018 implements the reset endpoint. |
| `US-002` Set the new Wedding Planner's initial access | Required by | The mechanism by which the Administrator hands the password to the WP out-of-band. |
| `US-007` Keep my contact information current | Depends on | Once signed in, the WP may update their own contact info. |

> ARC-010 (seed the default admin) ships bundled with US-006 and is owned by this spec. ARC-010 does not depend on US-006 (the seed runs at deploy time, before the API serves traffic); US-006 depends on ARC-010 (the WP login flow needs the default admin to be testable end-to-end).

## Rules & Constraints

### Identity and credentials

- **Rule 1 — Username format is `nombre@wendy`.** A WP's username matches the regular expression `^[a-z]+@wendy$` (lowercase letters only, no spaces, no digits). The WP enters it exactly that way. The platform does not allow other formats.
  - *Example:* `miguel@wendy` is valid; `Miguel@wendy`, `miguel@wendy.com`, `miguel@wendy.ar`, and `miguel` are not.

- **Rule 2 — The password is the one the Administrator assigned.** The platform does not generate a one-time password, does not email the password, and does not require the WP to change the password on first login. The Admin-assigned value is the WP's **permanent** password.

- **Rule 3 — Passwords are never stored in plain text.** The platform records passwords in a form that protects them from being read back as clear text. Only the WP and the Administrator know the password. The platform never displays it back after it has been assigned.

### Default Administrator (seed — ARC-010)

- **Rule 4 — A default Administrator (`admin@wendy`) exists before any user signs in.** The account is created exactly once at deploy time by a seed script. Its `role` is `Administrator`. Its `is_disabled` is `false`. Its `onboarded_by_admin_id` is `null` (no one onboarded it).

- **Rule 5 — The seed generates a strong random password and prints it once.** The password is long enough to resist guessing, drawn from a source that the platform treats as unpredictable, and is shown in the deployer's terminal (and only in the terminal) exactly once. It is never logged again, never returned by any endpoint, and never persisted in plain text.

- **Rule 6 — The seed is idempotent.** Running it twice does not create a second admin or overwrite the first one's password. The seed fails loudly (non-zero exit code) if the default admin already exists with a different role or if the `users` table is unreachable.

- **Rule 7 — The default admin is the only account created by the seed.** The seed does not create any WPs, weddings, or other data. Future local development seeds (sample WPs, weddings, etc.) are a separate concern (OPS-025).

- **Rule 8 — The default admin signs in through the same login form as any WP.** The only difference is what they see after signing in: the Administrator lands on the admin dashboard with the Wedding Planners section; a WP lands on the WP dashboard with their weddings.

- **Rule 9 — The default Administrator cannot be disabled by themselves.** Disabling `admin@wendy` would lock Vineyards out of the platform with no recovery path. The disable endpoint refuses to disable the default admin.

### Sign-in (login)

- **Rule 10 — The WP signs in by submitting username + password to the platform.** The platform validates the credentials against the `users` table. If both match and the account is not disabled, the WP is signed in.

- **Rule 11 — On successful sign-in, the platform returns a single long-lived access credential and the user's profile.** The credential is a JWT. The user's profile (`id`, `fullName`, `email`, `role`, `tenantId`) rides in the JWT payload — no separate endpoint is needed. The credential is sent with every subsequent request the WP makes to the dashboard.

- **Rule 12 — The credential is valid for 7 days.** The WP remains signed in for up to 7 days without re-entering the password. When the 7 days elapse, the credential expires automatically and the WP must sign in again. There is no separate "refresh" step — re-entering the password is the only way to extend the session.

- **Rule 13 — On successful sign-in, the WP lands on the dashboard.** The dashboard shows a personalized welcome (the WP's full name) and a navigation to the WP's weddings. The dashboard is empty if the WP has no weddings yet.

### Sign-in failures

- **Rule 14 — Wrong username or wrong password returns the same generic error.** The platform does not reveal whether the username exists. The error message is identical regardless of which field was wrong (for example: "Invalid username or password"). The error code is the same too.

- **Rule 15 — The platform does not lock accounts after repeated failed attempts.** There is no lockout counter, no CAPTCHA, and no delay between attempts in MVP. (This is an accepted trade-off given the small user base of ~10 WPs and the manual admin-reset workflow.)

- **Rule 16 — A disabled account cannot sign in.** If a WP was disabled by the Administrator (US-004), sign-in returns the same generic "invalid credentials" error. The platform does not reveal that the account was disabled — the WP must contact the Administrator to find out. **Note:** an existing credential (already issued before disable) remains valid until its natural expiry — the platform does not invalidate live credentials on disable.

- **Rule 17 — The default Administrator cannot be disabled by themselves.** Disabling `admin@wendy` would lock Vineyards out of the platform with no recovery path. The disable endpoint refuses to disable the default admin.

### Ending the session

- **Rule 18 — The Web App provides a "Sign out" affordance that clears local state.** Clicking it removes the access credential from memory and redirects the WP to the login screen. The credential itself remains valid on the backend until its natural 7-day expiry. This is an accepted trade-off for MVP — see Technical Notes below.

- **Rule 19 — The next protected request after sign-out redirects to the login screen.** Because the access credential is gone from memory, the api-client cannot reach the dashboard; the Web App sends the WP back to the login page.

- **Rule 20 — A credential that has expired is rejected by the platform.** When the 7 days pass, the next request from a still-open browser session returns an error. The api-client catches it and redirects the WP to the login screen.

### Authorization on protected routes

- **Rule 21 — Only authenticated WPs and the Administrator can reach the dashboard.** Every dashboard endpoint requires a valid, non-expired access credential. Requests without one are redirected to the login page; requests with an invalid or expired one are redirected to the login page.

- **Rule 22 — The WP can only see their own weddings.** A WP cannot see another WP's weddings even if they both belong to Vineyards. (For MVP, all WPs share the same `tenant_id`; the per-WP isolation is application-level filtering once ARC-011 lands.)

- **Rule 23 — Public pages are reachable without signing in.** A WP who is not signed in can still load the login page and the static marketing surface (if any). Invitations (`/i/:token`) and couple photo albums (`/c/:token`) are public routes with their own token-based authentication.

### Audit

- **Rule 24 — Successful sign-ins and failed sign-ins are auditable events.** The platform records an event for each (without the password value) so the Administrator can later see who signed in, when, and how many attempts failed. The audit write is part of the same database transaction as the action it records.

> ⚠️ Assumption — Audit persistence in MVP: this story records the audit intent but does not own the audit table or the audit interceptor. ARC-037 (Sprint 5) ships the `audit_events` table and the interceptor; if ARC-037 is not yet shipped when US-006 lands, the events are emitted on the in-process bus and a no-op subscriber logs them, so nothing is lost when ARC-037 lands.

## Technical Notes (non-binding)

The following are implementation choices that the team made in the tech spec; they are documented here for traceability and may be revised in a future iteration without changing this functional spec.

- **JWT lifecycle — the platform accepts that a credential cannot be revoked before its natural expiry.** True revocation (logout-from-all-devices, immediate disable, stolen-laptop response) requires a server-side revocation list — a piece of state we deliberately deferred. For MVP, the 7-day expiry is the security boundary. If a credential is compromised, the worst case is up to 7 days of unauthorized access. Mitigation: the WP can sign in again on a trusted device to obtain a new credential; this does not invalidate the compromised one. A future iteration can add a revocation list when the product has a security-incident response requirement (e.g. self-service password recovery with immediate kill of all sessions).

- **No separate `/oauth/userinfo` endpoint.** The user's profile rides in the JWT payload (`id`, `fullName`, `email`, `role`, `tenantId`). The Web App decodes the JWT once on sign-in and caches the profile in memory. If the WP updates their full name or email (US-007), the change shows up after the next sign-in, not immediately.

- **No self-service password change in this iteration.** A signed-in WP cannot change their own password from the UI. The only way to change a password is for the Administrator to reset it (ARC-018, ships in a later sprint). This is consistent with the MVP rule that the Administrator owns account lifecycle.

- **Disabled accounts are blocked at sign-in but not retroactively.** Disabling a WP (US-004, ARC-018) prevents future sign-ins but does not invalidate live credentials. The disabled WP can continue to use the platform until their credential expires (up to 7 days) or they sign out manually. This is consistent with the no-revocation-list choice above.

## User Experience Notes

- **Login form** has two fields: `username` (placeholder `nombre@wendy`) and `password` (masked). Both fields are required. The submit button is disabled until both fields have a value. Pressing Enter in any field submits the form.

- **Field validation feedback** appears under each field on submit:
  - Empty username → "Username is required."
  - Empty password → "Password is required."
  - Malformed username (e.g. contains uppercase, spaces, or a different domain) → "Use the format nombre@wendy (lowercase)."
  - Wrong credentials → "Invalid username or password." (Same message for wrong username, wrong password, and disabled account.)

- **Loading state**: while the sign-in request is in flight, the submit button shows a spinner and is disabled. The form fields are read-only.

- **Successful sign-in**: the WP is redirected to the dashboard. The dashboard header shows a personalized greeting (e.g. "Welcome back, Miguel") and the WP's email.

- **Persistent session**: if the WP closes the browser and returns within 7 days, they land on the dashboard without being asked to sign in again. After 7 days, the credential expires and the WP is asked to sign in again.

- **Sign-out affordance**: the dashboard header has a "Sign out" action in the user menu. Clicking it clears the in-memory credential and redirects to the login screen. (The credential itself is still valid on the backend until it expires naturally — see Technical Notes.)

- **Bilingual UI**: all visible strings (button labels, error messages, the greeting) come from the message catalogs (`en` and `es`). The platform detects the language from `Accept-Language` on first visit and respects the WP's override thereafter. The login page is no exception — it must work in English and Spanish.

- **Default Administrator sign-in**: the default Administrator signs in through the same login form with the same flow as any WP. The only difference is what they see after signing in: the Administrator lands on the admin dashboard with the Wedding Planners section; a WP lands on the WP dashboard with their weddings.

- **Default Administrator password delivery**: at deploy time, the platform's seed log prints the default admin's password exactly once. The deployer copies it from the deploy log and delivers it to Vineyards out-of-band. Vineyards is expected to change the password voluntarily after first use (the MVP does not force a rotation).

- **No "forgot password" affordance**: the login page does not show a "forgot password" link. The MVP rule is that the WP must contact the Administrator to reset their password. A placeholder line in the help text reads "Contact your administrator if you can't sign in." (or its Spanish equivalent).

> ⚠️ Assumption — The "no forgot password" affordance is consistent with the kickoff's out-of-scope list. If a future iteration adds self-service recovery, the affordance is added then; this story does not preempt it.

> ⚠️ Assumption — The dashboard "no weddings yet" empty state is owned by US-009 (register a new wedding). US-006 only guarantees that an empty dashboard renders without error after sign-in.
