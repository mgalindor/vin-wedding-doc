---
title: "Feature: Official Photo Storage"
date: 2026-08-10
type: analysis
scope: client
---

# Feature: Official Photo Storage

## Overview

| Field | Value |
| :---- | :---- |
| Feature ID | `FEAT-004` |
| Status | `draft` |
| Owner | Product Owner (TBD — Vineyards) |
| Date | 2026-08-10 |

> **Original request:** "Almacenamiento de fotos: Espacio dedicado para guardar fotos del evento. Calidad de subida alta/baja configurable por el cliente. Las fotos se descargan después del evento y se entregan al cliente en USB. Borrado automático del almacenamiento 1 mes después del evento. Máximo 200 fotos por boda." (kickoff, 2026-08-10)

> **Summary**
> A dedicated storage space per wedding where the Wedding Planner (and where applicable the couple, via the WP) stores the official photos of the event, with configurable upload quality, a hard cap of 200 photos per wedding, bulk download for USB delivery, and automatic deletion one month after the event.

## Problem & Trigger

- **Problem:** Photos of a wedding must be stored somewhere accessible to the WP and delivered to the couple, but unmanaged storage drives cost up over time and creates an unbounded liability for Vineyards.
- **Trigger:** After the event, the WP needs a place to consolidate the official photos and a mechanism to deliver them to the couple on USB.
- **Current workaround:** WP stores photos in personal cloud drives; delivery to the couple is ad-hoc and often manual.

## Affected Users

| Role | Description | Impact |
| :--- | :---------- | :----- |
| Wedding Planner | Uploads, manages, and downloads photos for a wedding. | Gains a bounded, predictable-cost storage space and a one-click download for USB delivery. |
| Couple (end recipient) | Receives the photos on USB. | Indirect impact: receives a curated set of photos without depending on personal cloud accounts. |
| Administrator | Oversees WPs and operational cost. | Gains visibility into storage usage and the cost impact of the quality configuration. |

## Desired Outcome

- The WP can upload photos at the configured quality and the chosen tier is enforced on the server side.
- Upload beyond the 200-photo cap is rejected with a clear message and no partial state.
- After the event date + 1 month, the photos are automatically removed and no longer accessible.
- The WP can download all photos for a wedding as a single archive suitable for USB delivery.

## Business Rules & Constraints

| Rule | Description |
| :--- | :---------- |
| BR-00 | The Official Photo Storage feature can be enabled or disabled per wedding; when disabled, no uploads or downloads are permitted for that wedding. |
| BR-01 | Each wedding has at most 200 photos; uploads beyond the cap are rejected. |
| BR-02 | Upload quality (high / low) is configurable per wedding at creation or before the first upload. |
| BR-03 | Photos are automatically deleted one month after the configured event date. |
| BR-04 | The WP can download all photos for a wedding as a single archive (intended for USB delivery to the couple). |
| BR-05 | Photos are visible to the WP and (where applicable) the Administrator, not to invited guests. |

## Variations & Configuration

| Dimension | Variation |
| :-------- | :-------- |
| Feature enabled | On / Off — configurable per wedding; default TBD with client. |
| Upload quality | High / Low — configurable per wedding, impacts storage cost. |
| Couple upload access | Direct couple upload TBD; default is upload via the WP. |

## Scope

### In Scope

- A photo library per wedding, visible to the WP (and to the Administrator where applicable).
- Upload by the WP (direct couple upload TBD with client).
- Configurable upload quality at the wedding level (high / low) — choice impacts storage cost.
- Hard cap of 200 photos per wedding (enforced at upload time).
- Bulk download by the WP, intended for delivery to the couple on USB after the event.
- Automatic deletion of the photo library one month after the configured event date.

### Out of Scope

- In-app photo editing, cropping, or filters.
- Face recognition, tagging, or visual search.
- Public sharing links for individual photos.
- Guest uploads — handled separately by the Guest Photo Album capability inside the Online Invitation feature (FEAT-003).
- Long-term archival of photos in cold storage.

## Proposed User Stories

> [!NOTE]
> User story decomposition is deferred until Vineyards validates this feature definition. Once approved, stories will be derived following the standard process (one need per story, grouped by actor, ordered by dependency).

## Decisions

| # | Decision | Rationale | Date |
| :- | :------- | :-------- | :--- |
| _None recorded yet_ | | | |

## Open Questions

- [X] Concrete resolution and compression definitions for "high" and "low" quality tiers, and the resulting cost per wedding. High: Original, Low: we need a proposal for compression similar than whatsapp. The cost per wedding will depend on the storage provider and the expected number of photos per wedding.
- [X] Storage technology and auto-deletion mechanism (provider lifecycle policy vs. internal scheduled job). Recommended by technical people
- [X] Exact reference date for the +1 month countdown: event date or last upload date (kickoff pending). Event Date
- [X] Retention policy for non-photo wedding data (separate question raised in kickoff preconditions). No restriction to save the information, but the photos will be deleted after 1 month of the event date. 
- [X] Whether the couple themselves get login credentials or only receive the photos via USB from the WP. Invitation have to include a link to upload the photos. Guests and couple will upload the photos entering in this link page. Asking for drag and drop upload. The WP has access in the main of the Wedding a link to the Photo Album he can share this link to the couple couple just can see the uploaded photos and upload new ones. The couple will not have access to the main platform, only to the Photo Album link.
