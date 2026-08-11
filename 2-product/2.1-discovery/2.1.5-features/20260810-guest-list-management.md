---
title: "Feature: Guest List Management"
date: 2026-08-10
type: analysis
scope: client
---

# Feature: Guest List Management

## Overview

| Field | Value |
| :---- | :---- |
| Feature ID | `FEAT-002` |
| Status | `draft` |
| Owner | Product Owner (TBD — Vineyards) |
| Date | 2026-08-10 |

> **Original request:** "Gestión de lista de invitados: Agregar invitados. Editar invitados. Eliminar invitados. Confirmar asistencia." (kickoff, 2026-08-10)

> **Summary**
> Ability for a Wedding Planner to build and maintain the list of people invited to a wedding and to track each guest's attendance status, replacing today's per-WP Excel files with a single shared tool that is the source of truth for the invitation flow.

## Problem & Trigger

- **Problem:** Guest lists live in personal Excel files per WP, with no shared structure, and are reconciled manually against invitation responses.
- **Trigger:** After a wedding is registered, the WP begins adding guests and needs a stable, queryable list to support invitation distribution and capacity planning.
- **Current workaround:** Each WP maintains a separate Excel file; attendance is reconciled by hand against WhatsApp / phone confirmations.

## Affected Users

| Role | Description | Impact |
| :--- | :---------- | :----- |
| Wedding Planner | Owns the guest list for each wedding. | Gains a single source of truth and stable per-guest invitation links. |
| Invited Guest | Receives a per-guest link tied to the WP's list. | Indirect impact: their RSVP is correctly attributed to their record. |
| Administrator | Oversees WPs. | Gains visibility into guest counts and attendance rates per wedding. |

## Desired Outcome

- The WP can add, edit, and delete guests in seconds without leaving the platform.
- Attendance status is reflected accurately across list views, exports, and invitation statistics.
- Each guest has a unique, stable invitation link that does not change when other guests are added or removed.

## Business Rules & Constraints

| Rule | Description |
| :--- | :---------- |
| BR-01 | Each guest belongs to exactly one wedding. |
| BR-02 | Each guest has a unique, stable invitation link generated at creation time. |
| BR-03 | Guest attendance status can be one of: confirmed attending, declined, pending. |
| BR-04 | Hard cap of 200 invited guests per wedding is **not** enforced at the guest-list level; it applies to photos (see FEAT-004). |

## Variations & Configuration

| Dimension | Variation |
| :-------- | :-------- |
| _None defined for MVP_ | Behavior is uniform across all WPs and all weddings. |

## Scope

### In Scope

- Add a guest (name, contact, and any additional fields the client confirms).
- Edit guest details.
- Delete a guest.
- Mark a guest as confirmed attending, declined, or pending — manually by the WP.
- Generate a unique, stable invitation link per guest, consumed by the Online Invitation feature (FEAT-003).
- Import / export the guest list as CSV (TBD with client — convenient for handoff to vendors and historical reconciliation).

### Out of Scope

- Online RSVP triggered by the guest via their invitation link — handled inside the Online Invitation feature (FEAT-003).
- Grouping of guests (families, plus-ones) — defer to a later iteration if requested.
- Seating / table assignment.
- Guest-to-guest relationships (e.g. partner of, child of).

## Proposed User Stories

> [!NOTE]
> User story decomposition is deferred until Vineyards validates this feature definition. Once approved, stories will be derived following the standard process (one need per story, grouped by actor, ordered by dependency).

## Decisions

| # | Decision | Rationale | Date |
| :- | :------- | :-------- | :--- |
| _None recorded yet_ | | | |

## Open Questions

- [X] Minimum required fields per guest (kickoff is silent beyond "agregar invitados"). First and last name. We need to register something called Guest Group (family, couple, etc.) to support the invitation flow. Side (Groom or Bride), contact (email and/or phone) are optional but recommended for RSVP follow-up and this information is captured at the Guest Group Level.
- [X] Whether group / plus-one modeling is needed in MVP (affects data model and invitation links). yes
- [X] Whether the WP can edit a guest after the guest has already RSVP'd online. Yes, but the WP should be warned that changing the guest's name or contact info may invalidate their invitation link and require a new one to be sent.
- [X] Whether CSV import / export is desired in MVP or deferred. Yes, it is desired for handoff to vendors and historical reconciliation.
