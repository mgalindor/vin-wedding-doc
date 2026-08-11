---
title: "Feature: Wedding Data Capture"
date: 2026-08-10
type: analysis
scope: client
---

# Feature: Wedding Data Capture

## Overview

| Field | Value |
| :---- | :---- |
| Feature ID | `FEAT-001` |
| Status | `draft` |
| Owner | Product Owner (TBD — Vineyards) |
| Date | 2026-08-10 |

> **Original request:** "Captura de datos del cliente (boda): Nombre de los novios. Fecha de la boda." (kickoff, 2026-08-10)

> **Summary**
> Ability for a Wedding Planner to register a new wedding by capturing the couple's names and the wedding date. This is the entry point of the platform and the container to which every other capability (guest list, invitation, photos) attaches.

## Problem & Trigger

- **Problem:** Weddings currently live in scattered Excel files with no shared structure, so the rest of the planning work has no consistent anchor.
- **Trigger:** A WP confirms a new wedding with a couple and needs a single place to register it before any other planning work begins.
- **Current workaround:** Each WP creates a new Excel file and defines their own columns; there is no common template.

## Affected Users

| Role | Description | Impact |
| :--- | :---------- | :----- |
| Wedding Planner | Manages weddings for Vineyards. | Gains a single, structured place to register a wedding instead of starting from scratch in Excel. |
| Administrator | Oversees WPs and their portfolios. | Gains visibility into the weddings each WP is handling. |

## Desired Outcome

- A WP can register a new wedding in under 2 minutes and immediately start working with it.
- Every other feature in the platform (guests, invitation, photos) can attach to the wedding without ambiguity.
- Vineyards has a canonical, queryable list of all active weddings.

## Business Rules & Constraints

| Rule | Description |
| :--- | :---------- |
| BR-01 | A wedding record must include, at minimum, the couple's names and the wedding date. |
| BR-02 | Each wedding is owned by exactly one Wedding Planner. |
| BR-03 | The wedding date drives downstream lifecycle events (invitation publication, photo auto-deletion). |

## Variations & Configuration

| Dimension | Variation |
| :-------- | :-------- |
| _None defined for MVP_ | Behavior is uniform across all WPs and all weddings. |

## Scope

### In Scope

- Create a wedding record with couple names and date.
- View and edit the captured data.
- List all weddings belonging to the logged-in Wedding Planner.
- Archive a wedding once the event has passed (operational definition TBD with client).

### Out of Scope

- Extended fields beyond couple names and date (e.g. couple email, phone, address).
- Bulk import or migration from existing Excel files.
- Cloning a previous wedding as a starting point for a new one.

## Proposed User Stories

> [!NOTE]
> User story decomposition is deferred until Vineyards validates this feature definition. Once approved, stories will be derived following the standard process (one need per story, grouped by actor, ordered by dependency).

## Decisions

| # | Decision | Rationale | Date |
| :- | :------- | :-------- | :--- |
| _None recorded yet_ | | | |

## Open Questions

- [X] Final list of required fields beyond couple names and date. Take information from the online invitation. 
- [X] Behavior when a wedding date is in the past (manual archive vs. automatic). Manual archive by the WP, but the system should warn if the date is in the past.
- [X] Whether the Administrator role can create weddings directly or only WPs do. Administrator can has the WP permissions
