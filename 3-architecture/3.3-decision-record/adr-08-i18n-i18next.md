---
title: "ADR-08 — i18n: i18next + react-i18next + Accept-Language detection"
id: adr-08
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 2.0.0
updated: 2026-08-10
---

# ADR-08 — i18n: i18next + react-i18next + Accept-Language detection

> **Revision history**
> - **v2.0.0 (2026-08-10):** Replaced `next-intl` (Next.js-coupled) with `i18next` + `react-i18next` (framework-agnostic) to match the Vite + React SPA decision in ADR-02.
> - v1.0.0 (2026-08-10): Original decision was `next-intl` on Next.js.

## Context

Wendy Planner's UI must be **bilingual (English default, Spanish)** in MVP and ready to add more languages later (TC-5). Requirements:

- English is the default.
- Spanish is auto-detected from the browser's `Accept-Language` header.
- The user can switch languages via a UI control; the choice persists.
- Adding a third language (e.g. Portuguese) must not require architectural changes.
- The architecture supports i18n from day one — no hard-coded English strings.

The frontend stack decision changed (ADR-02 v2): we are now on Vite + React, not Next.js. This invalidates the previous `next-intl` choice because `next-intl` is tightly coupled to Next.js's App Router conventions.

## Decision

**Adopt `i18next` + `react-i18next` + `i18next-browser-languagedetector` for internationalization in the Vite + React SPA.**

**Concrete configuration:**

- **Core library:** `i18next` for the framework-agnostic engine.
- **React bindings:** `react-i18next` for hooks (`useTranslation`) and `<Trans>`.
- **Detection:** `i18next-browser-languagedetector` for `Accept-Language` lookup, with cookie override.
- **Locales supported:** `en` (default), `es`.
- **Message catalogs:** `apps/web/src/i18n/locales/{en,es}/common.json`, `{en,es}/invitations.json`, etc. (split by feature for maintainability).
- **Locale resolution priority:**
  1. Explicit user choice (stored in a cookie `wendy_locale`).
  2. `Accept-Language` header (e.g. `es-MX` → `es`).
  3. Default `en`.
- **Locale switcher:** a UI control in the dashboard header; updates the cookie and reloads the active route.
- **Server-side strings:** the API emits error **codes** (e.g. `errors.QUOTA_EXCEEDED`); the FE maps them to localized messages via i18next. No server-side locale resolution.
- **Wedding data entered by WPs:** stored once in the canonical language (English recommended); the invitation template renders the wedding's data **as entered**. Cross-locale content of weddings is not in scope for MVP.

**CI guardrail:**

- A CI step fails the build if any locale catalog is missing a key that exists in `en.json` (or vice versa, modulo optional keys).
- The check is implemented with a small Node script (or `i18next-parser` in non-write mode).

## Options Considered

### Option A — Build a custom i18n system

- **Pros:** full control.
- **Cons:** reinventing ICU, locale fallback, pluralization. High maintenance burden. **Rejected.**

### Option B — `i18next` + `react-i18next` — **Selected**

- **Pros**
  - **Framework-agnostic core** — works with Vite, plain React, Next.js, anything. Future-proof against framework changes.
  - **Mature ecosystem**: `react-i18next`, `i18next-browser-languagedetector`, `i18next-icu` (for advanced pluralization if needed later).
  - **Battle-tested** in thousands of production apps.
  - **Lazy-loaded namespaces**: a locale's messages are fetched on demand, keeping the initial bundle small.
  - **Pluralization** built-in (CLDR rules).
  - **Type-safe keys** via `i18next` + TS tooling.
- **Cons**
  - Slightly more boilerplate than `next-intl` (the latter has tight Next.js integration).
  - Some configuration is required (init, detector, backend).

### Option C — `next-intl` — **Rejected after ADR-02 v2**

- **Why we considered it initially:** first-class integration with Next.js App Router.
- **Why we rejected it:** we are no longer on Next.js (see ADR-02 v2). `next-intl` would force us to keep Next.js for the i18n story, undoing the simplification.

### Option D — FormatJS / `react-intl`

- **Pros:** strong ICU support; backed by a standards-driven community.
- **Cons:** API ergonomics lag behind `react-i18next` for typical React apps; the format-message pattern is verbose.
- **Verdict:** equivalent in capability; we pick the one with broader React adoption (`react-i18next`).

## Consequences

### Positive

- The i18n layer is decoupled from the framework. We can change frontend frameworks in the future without touching i18n.
- Adding a third locale (e.g. `pt-BR`) is a JSON file + a config entry.
- The CI guardrail prevents locale drift.
- Lazy-loaded namespaces keep the initial bundle small.

### Negative / Trade-offs

- Slightly more setup than `next-intl`. Acceptable; the FE developer configures it once.

### Follow-up actions

- [ ] Set up `i18next` + `react-i18next` + `i18next-browser-languagedetector` in `apps/web/` [owner:: frontend] [priority:: high]
- [ ] Create the two locale catalogs with the initial set of keys [owner:: frontend] [priority:: high]
- [ ] Wire the locale switcher in the dashboard header [owner:: frontend] [priority:: high]
- [ ] Add the CI guardrail for missing keys [owner:: frontend] [priority:: high]
- [ ] Audit existing components for hard-coded strings [owner:: frontend] [priority:: medium]

### Revisit when

- A third locale is requested.
- The API is consumed by a third-party client that needs localized error messages.
- A formal translation workflow is needed (consider Crowdin / Lokalise as a CI integration step).
