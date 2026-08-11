---
title: "Feature: Online Invitation"
date: 2026-08-10
type: analysis
scope: client
---

# Feature: Online Invitation

## Overview

| Field | Value |
| :---- | :---- |
| Feature ID | `FEAT-003` |
| Status | `draft` |
| Owner | Product Owner (TBD — Vineyards) |
| Date | 2026-08-10 |

> **Original request:** "Invitación en línea: Selección de módulos a mostrar dentro de la invitación. Activación de invitación con ID de invitado para confirmar asistencia. Los links de invitación se entregan a mano por el WP." (kickoff, 2026-08-10) + modules list (Landing, Padres, Cuenta regresiva, Nuestra historia, Ubicación, Programa, Galería, Asistencia, Mesa de regalos, Dress code, Álbum de fotos, Alojamiento, Contacto).

> **Summary**
> Ability for a Wedding Planner to publish a public web invitation for a wedding using one of six fixed, pre-designed templates, and for each invited guest to access the invitation through a unique link to view wedding details and confirm attendance.

## Problem & Trigger

- **Problem:** Today each WP builds a one-off invitation (often external tools or static pages) with inconsistent look-and-feel and no integration with the guest list.
- **Trigger:** Once guests are registered, the WP needs to publish an invitation and send each guest their link to confirm attendance.
- **Current workaround:** External tools or static pages per WP, no integration with the guest list, manual reconciliation of RSVPs.

## Affected Users

| Role | Description | Impact |
| :--- | :---------- | :----- |
| Wedding Planner | Publishes the invitation and distributes links. | Gains a fast, standardized way to publish a polished invitation without leaving the platform. |
| Invited Guest | Receives a unique link tied to their record. | Gets a consistent invitation experience and a direct way to RSVP. |
| Administrator | Oversees WPs. | Gains visibility into which weddings have a published invitation and RSVP progress. |

## Desired Outcome

- The WP can publish an invitation using any of the 6 templates in under 5 minutes.
- A guest can open their unique link on PC or tablet and view all wedding details without errors.
- A guest can submit an RSVP through the link and the response is recorded against the correct guest in FEAT-002.
- Updating wedding data and republishing is reflected on the live invitation within minutes.

## Business Rules & Constraints

| Rule | Description |
| :--- | :---------- |
| BR-01 | The MVP ships exactly 6 fixed invitation templates; per-wedding layout customization is not allowed. |
| BR-02 | Each invited guest has a unique invitation link that includes the guest ID; RSVPs are attributed to that guest. |
| BR-03 | Invitation links are delivered manually by the WP (no automated email/SMS/WhatsApp in MVP). |
| BR-04 | The invitation is publicly reachable only through the per-guest link — there is no public listing or search. |
| BR-05 | The platform supports the 14 modules listed in the kickoff, distributed across the 6 templates. |

## Variations & Configuration

| Dimension | Variation |
| :-------- | :-------- |
| Template selection | The WP picks one of 6 fixed templates per wedding; data is bound automatically. |
| Dress code tooltip | Some weddings vary dress code by day — the template must surface this variation in a tooltip. |

## Scope

### In Scope

- 6 fixed invitation templates, each covering the standard modules:
  - Landing (couple names and date)
  - Parents
  - Countdown
  - Our Story (text + photo carousel)
  - Location(s) — photo, time, address, map link
  - Schedule / Program
  - Gallery
  - RSVP (attendance confirmation)
  - Gift table (multiple links) or bank transfer details with thank-you text
  - Dress code (with tooltip for multi-day variation)
  - Guest photo album (uploads by guests)
  - Accommodation (sub-page with links)
  - Contact (phone, name)
  - Per-guest link with embedded guest ID
- Template selection by the WP per wedding.
- Data binding — wedding data (FEAT-001) and guest list (FEAT-002) feed the selected template automatically.
- Public access through the per-guest link (no public listing or search of invitations).
- Manual distribution of the link by the WP (email, SMS, WhatsApp — all manual).

### Out of Scope

- Per-wedding selection of individual modules (replaced by template selection).
- Per-wedding customization of template layout, colors, fonts, or content order.
- Automated sending of invitation links via email, SMS, or WhatsApp.
- Automated reminders and re-sends.
- Automatic versioning when the WP edits wedding data after publishing.
- Custom domains per WP or per wedding (URL structure TBD).
- Mobile-first optimization (the MVP targets PC and tablet only).

## Proposed User Stories

> [!NOTE]
> User story decomposition is deferred until Vineyards validates this feature definition. Once approved, stories will be derived following the standard process (one need per story, grouped by actor, ordered by dependency).

## Decisions

| # | Decision | Rationale | Date |
| :- | :------- | :-------- | :--- |
| D-01 | The MVP ships **6 fixed invitation templates** instead of WP-driven module selection. | Simplifies scope and delivery for MVP; per-wedding layout customization is deferred to a later iteration. Template selection replaces module selection. | 2026-08-10 |

## Open Questions

- [ ] Final list and exact content of the 6 templates (design work by the Frontend Developer). Yes
- [X] URL structure for public invitations (subdomain, path under main domain, or custom domain per WP). Required being proposed by technical team
- [X] Operational definition of "RSVP submitted" (free-form, structured fields, optional message). Simple button with Confirm Message, the gest click in it and system register the RSVP. The WP can see the RSVP in the Guest List Management feature (FEAT-002).
- [X] Whether guests can edit their RSVP after submitting. No
- [X] Anti-abuse rules for the guest photo album (max file size, allowed formats, moderation). Yes Max file size 5MB, allowed formats JPG, PNG, GIF. Max 20 photos per guest. The WP can moderate the photos uploaded by the guests.
- [X] Support procedure for guests who report issues with their link (channel, owner, response time). Guest inform the couple for problems with the link.
