---
title: "Specification: Onboard a new Wedding Planner"
date: 2026-08-17
type: specification
scope: internal
story-id: "US-001"
status: draft
version: 1.5.0
updated: 2026-08-17
revision-history:
  - v1.5.0 (2026-08-17): Added Rule 28 — role-dependent UI affordances (the Administrator-only "Wedding Planners" sidebar entry and "Onboard Wedding Planner" landing action) MUST be gated on the server-authenticated profile endpoint (per ADR-05 §`/oauth/userinfo`), not on client-decoded JWT claims. Server-side authorization on every protected API call is unaffected and continues to enforce role-based access independently of what the FE shows.
  - v1.4.0 (2026-08-17): Purged implementation details per skill scope ("focus on WHAT, never HOW"). Removed HTTP codes, endpoint URLs, JSON envelopes, DTO field names, database column names, story IDs embedded in rules, decorator names, transport/ORM/framework references. Reworded rules 1-27 in plain language. Removed the entire "Technical Notes" section (its content belongs in the tech spec).
  - v1.3.0 (2026-08-17): Initial-access mode is now "Admin-typed OR auto-generate" (Rule 10). Length range tightened to 10-25 chars inclusive (Rule 11). Slug domain derives from the tenant's email domain (Rule 2).
  - v1.2.0 (2026-08-17): Password rules simplified to Admin-typed + ≥ 10 chars (no complexity rule, no confirm field). Mockup became the single source of truth for the form layout (removed duplicated labels and screen chrome).
  - v1.1.0 (2026-08-17): US-002 merged into US-001 (administrator-enters-password step is part of US-001 in MVP).
  - v1.0.0 (2026-08-17): original draft covering US-001 + US-002 as a combined delivery.
---

# Onboard a new Wedding Planner

> **Status: Draft**
> **Story**: `US-001` — As an Administrator, I need to register a new Wedding Planner so that they can start working on weddings.
> **Scope note (2026-08-17)**: the original backlog item `US-002 Set the new Wedding Planner's initial access` is delivered as part of this story. The initial-password setup is described in the §"Setting initial access" rules below. It is not a separate story because it does not add a new product capability on its own in MVP — it is the password entry on the onboarding form. If a future iteration introduces a non-manual access mode (auto-generate surfaced as a separate capability, email magic link, mandatory first-login rotation, or SSO), it will be added as a new story.

## User Stories

`US-001` Onboard a new Wedding Planner - As an Administrator, I need to register a new Wedding Planner so that they can start working on weddings [groupBy:: user-and-role-management] [priority:: 3]

## Context

Wendy Planner is operated by a small internal team (one Administrator plus Wedding Planners). Today, onboarding a new Wedding Planner is manual and informal — invitations travel by chat, credentials travel by WhatsApp or call, and there is no central record of who onboarded whom. The platform replaces this with a single onboarding flow owned by the Administrator.

The Administrator opens the platform's Wedding Planners section, fills the new Wedding Planner's profile, sets the Wedding Planner's initial access credential, and submits. The platform creates the account, shows the credentials back exactly once (the Administrator copies them and delivers them out-of-band), and the Wedding Planner can sign in immediately. There is no invitation email, no one-time code, and no forced rotation — the credentials chosen at onboarding are the Wedding Planner's **permanent** credentials. The Wedding Planner may change them voluntarily later from their profile.

The credentials handoff lives outside the platform: the Administrator reads the username and password off the confirmation screen, sends them to the new Wedding Planner over a separate channel (chat, call, in person), and the Wedding Planner signs in. The audit trail records that an account was created and who onboarded it, so the organisation can later supervise who brought whom in.

This spec assumes the Administrator is already signed in. The onboarding flow is reachable only by an authenticated Administrator; a Wedding Planner who authenticates cannot reach it.

## Dependencies

| Item | Type | Description |
|---|---|---|
| Initial identity & access foundation (the platform's `users` record; the session mechanism; the role-based authorization layer) | Requires | The basic identity model that stores the new account, the session mechanism that lets the Administrator reach the flow, and the role-based authorization layer that locks the screen to Administrators. |
| Wedding Planner sign-in | Requires | The Administrator hand-off only works if the Wedding Planner can actually authenticate with the credentials delivered (depends on the confirmation screen + the sign-in feature). |
| Wedding Planner list view | Required by | The section landing this spec ships is a placeholder; the full search/filter list arrives in a later iteration. This spec does not own the list. |
| Wedding Planner supervision dashboard | Required by | Builds the supervision view in a later iteration, depending on the audit trail this spec emits. |
| Wedding Planner disable / restore flows | Required by | A Wedding Planner that was disabled in error must be restored through those flows, not re-onboarded through this spec — re-onboarding would create a duplicate profile. |
| Centralised audit table | Future | The audit intent is shipped by this spec (a `user.created` event is emitted). The table and interceptor that persist it ship in a later iteration; until then a stand-in subscriber logs the event so nothing is lost. |
| Per-organisation email-domain record | Future | The organisation suffix that the platform appends to the slug is read from a per-organisation source of truth when one exists. Today the platform uses a single hard-coded value; the migration to a per-organisation lookup is a configuration swap, not a behaviour change. |

If a future change has no obvious dependency in either direction, state that explicitly rather than leaving the row blank.

## Rules & Constraints

### Identity and profile

- **Rule 1 — Required identity fields.** The form captures the new Wedding Planner's **first name**, **last name**, **email**, **username** (the local-part slug), and **initial password**. A **phone** field is offered but optional. The created account's role is **Wedding Planner** — the Administrator cannot create another Administrator through this flow.
  - *Example:* An Administrator enters a first name, a last name, an email address, a username slug, an optional phone number, and the initial password — all submitted together.

- **Rule 2 — The username is a single lower-case slug that the platform turns into a full address.** The form accepts only the local part of the address (the "slug" — lowercase letters only, no spaces, no digits, no symbols). The platform appends the email suffix of the Administrator's organisation (e.g. `wendy` → `…@wendy`) before validating and storing the final value, which matches the agreed `nombre@<organisation>` convention. The validation surface the form sees is just the slug — full-string validation lives behind the platform.
  - *Example:* The Administrator types `miguel` while signed in under the organisation whose email suffix is `wendy`; the platform stores `miguel@wendy`. Upper-case, mixed-case, digit-bearing, hyphen-bearing or already-suffixed inputs are rejected at the slug.

- **Rule 3 — The email looks like an email.** The platform validates the email format well enough to reject obvious mistakes (presence of `@`, a non-empty local part, a non-empty domain with at least one dot). The platform does not send a verification email; it accepts the address as the Wedding Planner's contact on faith.

- **Rule 4 — The new Wedding Planner belongs to the Administrator's organisation.** The organisation membership is implicit in the signed-in session — it is never a free input on the form. The platform refuses any attempt to onboard a Wedding Planner under a different organisation.

- **Rule 5 — The new account is created in the active state.** The platform does not offer a "draft" or "pending approval" state. The Wedding Planner can sign in immediately after credentials are delivered.

- **Rule 6 — The onboarding event is attributed to the creating Administrator.** The platform records which Administrator created the account, so the organisation can later review who brought whom in. The attribution is internal information and is not exposed on the form.

- **Rule 7 — Usernames and emails are unique within the organisation.** The platform refuses to create a Wedding Planner whose final username (after the platform appends its organisation suffix) or email already exists. The error is field-level: the form pinpoints which field is in conflict with a human-readable message naming that field. The platform is allowed to reveal this to the Administrator because the Administrator already needs directory visibility to manage the team.
  - *Example:* If the final username is taken, the form shows a "Username already in use" message on the username field. If the email is taken, the form shows the equivalent on the email field.

- **Rule 8 — The Administrator cannot onboard themselves.** The platform refuses any attempt where the requested username slug matches the Administrator's own slug, or where the email matches the Administrator's own email. The message names the offending field. (The uniqueness rule typically fires first; this rule documents intent for the team.)

- **Rule 9 — The new Wedding Planner is not signed in by the Administrator's action.** The Administrator stays in the Wedding Planners section; the new account's first session is independent. The Administrator must deliver the credentials through the out-of-band channel described in the context, and the Wedding Planner signs in from their own device.

### Setting initial access

- **Rule 10 — In MVP the initial-access mode is "Administrator enters OR platform auto-generates", in one form.** The Administrator chooses between two mutually-exclusive inputs on the same form:
  1. **Administrator-typed** — a regular password field where the Administrator enters the Wedding Planner's initial password. The Administrator can type it manually or paste it from a clipboard or password manager.
  2. **Auto-generate** — an action button that fills the password field with a fresh, strong random value within the agreed length range, drawn from mixed character classes. The Administrator can click it again to roll a new value before saving.
  Either way, the chosen value is what the platform records. Both inputs land in the same field; only the source differs. There is no confirmation field, no email, no magic link, no one-time code, and no SSO in MVP. Other delivery modes (email-delivery, mandatory first-login rotation, SSO) are explicit non-goals for this story and may be added in a later iteration.

- **Rule 11 — The password is between 10 and 25 characters inclusive.** The platform refuses anything shorter or longer with a field-level error. The lower bound is the minimum entropy for an Administrator-typed passphrase. The upper bound is a guardrail against accidentally pasted megabytes, paste-bombs, or otherwise unmanageable values from a clipboard manager. The auto-generated value is always inside this range by construction. There is no other strength rule.
  - *Example:* A nine-character value is rejected; a ten-character value is accepted; a twenty-eight-character passphrase is rejected for exceeding the upper bound; a twenty-two-character passphrase is accepted. Spaces, accents and most symbols are accepted characters; the rule is a length rule, not a complexity rule.

- **Rule 12 — There is no character-class rule.** The platform does not require uppercase, lowercase, digits, or symbols. Long passphrases — including those that contain only lowercase letters and spaces — are acceptable, and the helper copy next to the field is allowed to suggest that the password can be a phrase.

- **Rule 13 — There is no password confirmation field.** The Administrator enters (or pastes, or auto-generates) the value once. The platform does not require it to be typed twice.

- **Rule 14 — Paste-friendly input within the agreed length range.** The password field accepts any paste from a clipboard or password manager; the only validations that fire are the agreed length range and the no-empty rule. The Administrator can copy-paste freely without transformation, truncation, or character-set restrictions.

- **Rule 15 — Passwords are never stored in plain text on the platform.** The platform records credentials in a form that protects them from being read back in clear text. Only the Administrator and the Wedding Planner know the value. The platform never displays the value back after the one-time confirmation screen.

- **Rule 16 — The chosen credentials are the Wedding Planner's permanent credentials.** The platform does not require the Wedding Planner to change them on first sign-in. The Wedding Planner can change them voluntarily later from their profile.

- **Rule 17 — The credentials are shown exactly once, on a confirmation screen.** After successful creation, the platform navigates the Administrator to a confirmation screen that displays the new Wedding Planner's username and password in clear text, exactly once. The screen exposes a copy-to-clipboard control on each value, and a confirmation checkbox ("I have saved the credentials") that gates the only exit action.
  - The confirmation screen warns the Administrator — in an inline message that is **visible while the password is on screen** — that the password cannot be consulted later through the platform: it can only be **replaced** through a future restore flow, so the Administrator must save the value somewhere safe before acknowledging.
  - Once the Administrator has acknowledged, the platform returns to the Wedding Planners section and the password leaves the screen.

- **Rule 18 — The cleartext credentials appear only in the one-time confirmation.** They are intentionally shown so the Administrator can hand them off; the rule is that they never appear again in any other surface — no other screen, no other endpoint, no other audit entry. The login surface, the user profile, any listing view or supervisory view all return credentials exclusively in their non-clear-text form.

### Authorization

- **Rule 19 — Only Administrators can onboard a Wedding Planner.** The screen and the form submission are restricted to authenticated users with the Administrator role. A Wedding Planner who authenticates cannot reach the screen.

- **Rule 20 — Only Administrators can set initial access.** The same role restriction applies — initial access is a side effect of the onboarding flow, which is itself Administrator-only.

### Validation and persistence

- **Rule 21 — Validation runs before persistence.** All rules in the *Identity and profile* and *Setting initial access* sections are checked before any record is written. If any rule fails, the platform reports the failure to the form without persisting anything.

- **Rule 22 — Creation runs as a single, atomic operation.** The platform either creates the account with the attributed Administrator and emits the audit event, or it makes no change at all. Two simultaneous onboardings of the same Wedding Planner cannot both succeed.

- **Rule 23 — Errors are explicit and field-level.** Failures tell the Administrator which field is at fault and what to do. Validation problems surface as field-level messages; conflicts (a unique field already taken) surface as field-level messages too. Authorisation problems surface as a single, generalised refusal ("you do not have permission") without revealing why. Surprises surface as a single, generalised "something went wrong" message — never with database or stack-trace details leaked to the form.

### Audit

- **Rule 24 — Every successful onboarding records that an account was created, attributed to the signing Administrator.** The audit entry carries only the identifiers involved — never the password value, the email address, or any other personal data beyond the ids themselves. The platform may differ on its persistence mechanism (a structured log today; a centralised audit table in a later iteration) without changing the rules above.

> ⚠️ Assumption — Audit persistence today: the audit intent is delivered by emitting the event to a stand-in log channel. A later iteration introduces a dedicated audit table; the rule above is unchanged. If that later iteration is not yet shipped when this story lands, the stand-in log keeps the record so nothing is lost when the table arrives.

### Edge cases and out-of-scope
- **Rule 28 — Role-dependent UI surfaces are gated on a server-authenticated profile call, not on client-decoded JWT claims.** The platform exposes an authenticated profile endpoint that returns the calling user's role alongside other profile fields. Client-side decisions about whether to render an Administrator-only affordance (for example, the "Wedding Planners" sidebar entry or the "Onboard Wedding Planner" landing action) read from this endpoint's server-authenticated response and never from a client-side JWT decode. Server-side role enforcement on every protected API call is unchanged and continues to deny unauthorised requests independently of what the interface renders.

> ⚠️ Assumption — this rule exists because rules 19 and 20 alone are not enough: the form rendering depends on knowing the caller's role before the protected API is even called, and the only safe source is the server. The technical realisation of the role-revealing endpoint is described in the tech spec; functionally, the rule just says "don't trust client-decoded JWT for UI gating." Any future auth surface (server-verified session, IdP-backed introspection, or signed role claim) that the platform adopts satisfies the rule as long as the source is server-authenticated.


- **Rule 25 — A previously disabled Wedding Planner is not re-onboarded.** Restoring an existing disabled account uses a different flow (a future story). This spec's onboarding flow has no "re-activate" path; on disabling-by-mistake the Administrator is expected to use the restore flow, not to create a duplicate account here.

- **Rule 26 — Inviting a Wedding Planner by email is out of scope.** The platform does not send emails, invitation links, or magic links in MVP. The Administrator delivers the credentials through whatever out-of-band channel the organisation uses (chat, call, in-person, password-manager share).

- **Rule 27 — Bulk onboarding (CSV import) is out of scope.** Each Wedding Planner is onboarded individually through this flow. Bulk import of a Wedding Planner list is deferred to a later iteration.

## Visual reference

The form's screen layout, the sidebar entry point, the page title, the field order, the footer button labels and the confirmation screen are owned by the design mockup files in [2-product/2.1-discovery/2.1.6-design/mockup/](2-product/2.1-discovery/2.1.6-design/mockup/):

- [17-admin-wp-form.html](../../../2-product/2.1-discovery/2.1.6-design/mockup/17-admin-wp-form.html) — Manage Wedding Planner (Add + Edit), with the slug-suffix pattern (local slug + automatic organisation suffix).
- [16-admin-wp-list.html](../../../2-product/2.1-discovery/2.1.6-design/mockup/16-admin-wp-list.html) — Wedding Planners list. Deferred to a later iteration — the first implementation of the Wedding Planners section is a placeholder empty state with a single "+ Add Wedding Planner" entry point, in the same shape as the mockup.
- [14-my-profile.html](../../../2-product/2.1-discovery/2.1.6-design/mockup/14-my-profile.html) — referenced for the Administrator shell parity, not for behaviour.

Bilingual UI (`en` + `es`) is delivered alongside the form; both catalogs must be complete.
