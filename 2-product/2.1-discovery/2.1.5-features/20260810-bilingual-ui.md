---
title: "Feature: Bilingual UI"
date: 2026-08-10
type: analysis
scope: client
---

# Feature: Bilingual UI

## Overview

| Field | Value |
| :---- | :---- |
| Feature ID | `FEAT-006` |
| Status | `draft` |
| Owner | Product Owner (TBD — Vineyards) |
| Date | 2026-08-10 |

> **Original request:** "Internacionalización: El código se escribe en inglés. La UI debe soportar i18n desde el inicio: inglés y español. Idioma por defecto: inglés. Detección automática según Accept-Language del navegador: español si está disponible, inglés en cualquier otro caso. La arquitectura debe permitir agregar más idiomas en el futuro." (kickoff, 2026-08-10)

> **Summary**
> The user-facing interface of Wendy Planner is available in English and Spanish from day one, with English as the default and automatic detection of the user's preferred language from the browser's `Accept-Language` header. The architecture is built so additional languages can be added in future iterations without code restructure.

## Problem & Trigger

- **Problem:** Vineyards serves weddings where couples and guests may prefer either English or Spanish. Shipping monolingual UI and retrofitting translation later is more expensive and disruptive.
- **Trigger:** Day-one product launch — i18n must be in place from the first release.
- **Current workaround:** Not applicable — the MVP is the first version of the platform.

## Affected Users

| Role | Description | Impact |
| :--- | :---------- | :----- |
| Wedding Planner | Operates the platform. | Sees the UI in their preferred language without manual configuration. |
| Invited Guest | Accesses the public invitation. | Sees the UI in their preferred language without manual configuration. |
| Administrator | Oversees WPs. | Sees the UI in their preferred language without manual configuration. |

## Desired Outcome

- A browser with `Accept-Language: es` receives the UI in Spanish on first visit.
- A browser with `Accept-Language: en` (or any unsupported language) receives the UI in English.
- Adding a new locale file and registering it results in that locale being served without code changes.
- No hardcoded user-facing strings remain in the source code (verified by a simple code scan).

## Business Rules & Constraints

| Rule | Description |
| :--- | :---------- |
| BR-01 | Supported languages in MVP are English and Spanish. |
| BR-02 | English is the default language. |
| BR-03 | Language detection uses the browser's `Accept-Language` header. |
| BR-04 | If the detected language is not supported, the UI falls back to English. |
| BR-05 | All user-visible strings are externalized; no hardcoded strings in source code. |
| BR-06 | Date, time, and number formatting follow the selected language's locale. |

## Variations & Configuration

| Dimension | Variation |
| :-------- | :-------- |
| Detected language | English vs Spanish — drives every user-visible string and formatting. |

## Scope

### In Scope

- All user-visible strings externalized and translated for English (default) and Spanish.
- Automatic language detection via the browser's `Accept-Language` header.
- Default to English if the detected language is not supported.
- Architecture (resource bundles, message catalogs, locale routing) ready to add additional languages without code restructure.
- Date, time, and number formatting localized per selected language.

### Out of Scope

- Languages other than English and Spanish.
- In-app manual language switcher visible to the user (auto-detection only — TBD if added later).
- Per-user saved language preference (auto-detect only — TBD if added later).
- Translation of user-generated content (guest names, wedding stories, etc.).
- Right-to-left (RTL) language support.

## Proposed User Stories

> [!NOTE]
> User story decomposition is deferred until Vineyards validates this feature definition. Once approved, stories will be derived following the standard process (one need per story, grouped by actor, ordered by dependency).

## Decisions

| # | Decision | Rationale | Date |
| :- | :------- | :-------- | :--- |
| _None recorded yet_ | | | |

## Open Questions

- [X] Whether a manual language switcher is desired in MVP (small UI addition). Yes
- [X] Whether per-user language preference should be persisted once logged in. No
- [X] Source of truth for translations: who provides and approves the Spanish copy (Vineyards content team, dedicated translator, or the Frontend Developer with review)?Front end developer will provide the initial translation, and Vineyards content team will review and approve it.
