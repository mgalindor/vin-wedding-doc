---
title: "Journey Map — User & Role Management"
date: 2026-08-10
type: analysis
scope: internal
version: 1.0.0
updated: 2026-08-10
work-style: yolo
progress:
  - step: initialize
    status: done
  - step: identify-actors-and-goals
    status: done
  - step: map-steps
    status: done
  - step: identify-opportunities
    status: done
---

# Journey Map — User & Role Management

## Actors

| Actor | Goal |
|---|---|
| Administrator (admin@wendy) | Onboard, supervise, and manage Wedding Planners inside Wendy Planner. |
| Wedding Planner (WP) | Access the platform with assigned credentials and manage their own profile. |

## Journey — Administrator

**Goal**: Onboard, supervise, and manage Wedding Planners.

### Onboard a Wedding Planner

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the platform and log in as Administrator. | No self-service signup; depends on a pre-provisioned admin account. | The first Administrator is provisioned manually during deployment. |
| 2 | Open the Wedding Planners section. | Today there is no shared tool — onboarding lives in spreadsheets and informal chats. | None. |
| 3 | Create a new WP account: full name, contact email, contact phone, username (nombre@wendy). | No standardized format — risk of typos in emails/phones that go unnoticed. | None. |
| 4 | Assign an initial password. | No password policy enforced; weak passwords are accepted. | None. |
| 5 | Hand the credentials to the new WP through a separate channel (chat, call). | Credentials travel outside the platform; no audit trail of the handoff. | WP is asked to change the password on first login (out of scope MVP). |
| 6 | Verify the new WP appears in the active list. | No confirmation that the WP successfully logged in. | Manual check via WhatsApp / call. |

### Disable a Wedding Planner

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Search for the WP by username. | No central directory; finding a WP depends on memory or side files. | None. |
| 2 | Disable the account. | The WP's weddings remain visible to others who manage them (Admin keeps edit rights). | None — by design in MVP. |
| 3 | Confirm the disabled WP can no longer log in. | No automatic test; relies on the WP reporting the lockout. | WP attempts to log in themselves. |

### Reset a Wedding Planner's password

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Locate the WP account. | Same as above — no central directory. | None. |
| 2 | Generate a new password and assign it. | No self-service recovery; every reset is manual. | Admin communicates the new password out-of-band. |
| 3 | Confirm the WP can log in with the new password. | No session invalidation for active sessions. | WP signs back in manually. |

## Journey — Wedding Planner

**Goal**: Log in, access the platform, and keep profile data up to date.

### Log in to the platform

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open Wendy Planner and reach the login screen. | No single canonical URL today; confusion about where to log in. | None. |
| 2 | Enter the username in the `nombre@wendy` format. | Format is not enforced at the input — typos silently fail. | None. |
| 3 | Enter the assigned password. | No "forgot password" path; if forgotten, WP must contact Admin. | Admin resets the password manually. |
| 4 | Land on the dashboard. | No personalized welcome or quick links. | None. |

### Manage own profile

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the profile screen. | Not applicable for first version — placeholder. | None. |
| 2 | Update full name, contact email, contact phone. | No validation of email format or phone format. | None. |
| 3 | Save changes. | No confirmation toast; uncertainty about whether changes were saved. | Reload the page to verify. |

## Opportunities

| # | Pain (from journey) | Opportunity | Source |
|---|---|---|---|
| 1 | Credentials travel out-of-band; no audit trail of the handoff. | Log the moment credentials are handed over (e.g., a "credentials delivered" event) for audit purposes. | assumption |
| 2 | No password strength enforcement. | Enforce a minimum length / complexity rule on Admin-assigned passwords. | known |
| 3 | No central directory of WPs for Admin actions (disable, reset). | Provide a searchable list of all WPs onboarded by the Admin, with status and last login. | known |
| 4 | No confirmation that a disabled WP can no longer log in. | Surface a clear status indicator and prevent login attempts in real time. | assumption |
| 5 | Active sessions are not invalidated after password reset. | Invalidate existing sessions on password change so the WP is forced to log back in. | assumption |
| 6 | No confirmation when profile changes are saved. | Add a success toast and reload the affected fields after save. | assumption |
| 7 | No standardized onboarding flow (format, required fields). | Provide a structured form with validation for email/phone and a clear "create" button. | known |
| 8 | The first Admin must be provisioned manually. | Document the manual provisioning step in the deployment runbook. | known |