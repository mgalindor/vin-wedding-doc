---
title: "Web Frontend Tier Blueprint"
date: 2026-08-11
type: architecture
scope: internal
version: 1.1.0
updated: 2026-08-11
tier: web-frontend
---

# Web Frontend Tier Blueprint

> Concise technical guide for the Vite + React SPA (`apps/web/`). Read this end-to-end before opening a PR that touches frontend code.
> Length: ~8 minutes. Operational commands and design-token references live in `apps/web/README.md`, not here.

Design System Reference: [DESIGN.md](../../2-product/2.1-discovery/2.1.6-design/DESIGN.md)

## 1. Runtime & Platform

| Dimension | Value |
|-----------|-------|
| Language | TypeScript 5.x (`experimentalDecorators: true` for `class-validator` DTOs) |
| Runtime | Browser — Chrome / Edge / Firefox / Safari (latest 2 versions) |
| Platform | Static assets on S3 behind CloudFront; no Node.js runtime for the FE (ADR-02) |
| Build & PM | Vite 5 + pnpm 9.x — monorepo workspaces (ADR-12) |
| Min targets | PC and tablet; mobile acceptable but not optimized (TC-8) |

---

## 2. Tech Stack

| Library / Tool | Version | Purpose |
|----------------|---------|---------|
| `react` | 19.x | UI framework |
| `vite` | 5.x | Build tool with sub-second HMR; emits static `dist/` |
| `@tanstack/react-router` | latest | Type-safe routing with two lazy route groups (ADR-02) |
| `react-hook-form` | latest | Form state and validation orchestration |
| `@wendy/contracts` | `workspace:*` | Shared DTOs + `classValidatorResolver` adapter (ADR-14) |
| `tailwindcss` | 4.x | Utility-first styling |
| `@wendy/ui` | `workspace:*` | shadcn/ui primitives wrapped as the project design system |
| `i18next` + `react-i18next` | latest | Framework-agnostic i18n (ADR-08) |
| `i18next-browser-languagedetector` | latest | `Accept-Language` + cookie override |
| `nanoid` | 5.x | Same ID generator as the BE for optimistic-UI IDs (ADR-13) |
| `vitest` + `@testing-library/react` | latest | Unit + component tests |
| `playwright` | latest | Multi-browser E2E (Chromium, Firefox, WebKit); PC + tablet viewport emulation (TC-8); auto-wait + parallel execution |
| `@sentry/browser` | latest | Error + performance reporting tagged with API `traceId` |

---

## 3. Scaffolding

**Architecture style:** feature-based with two lazy route groups sharing one design system and one API client.

```
apps/web/src/
├── routes/                      # router config; one folder per route group
│   ├── (dashboard)/             # authenticated routes; lazy chunk
│   └── (public)/                # /i/:token + /c/:token; lazy chunk
├── features/                    # one folder per business feature
│   ├── {feature}/
│   │   ├── components/          # presentational + container components
│   │   ├── hooks/               # feature-scoped React hooks
│   │   └── {feature}.service.ts # talks to the API via shared/api-client
│   ├── weddings/                # example
│   ├── guests/                  # example
│   └── ...                      # photos, audit, auth — same pattern
├── shared/
│   ├── ui/                      # shadcn-based primitives wrapped per project
│   ├── api-client/              # fetch wrapper, token refresh, traceId
│   ├── auth/                    # token store, login/logout hooks, route guards
│   └── lib/                     # small generic utils (date, format, etc.)
├── i18n/
│   ├── locales/{en,es}/         # message catalogs split by feature namespace
│   └── config.ts                # i18next + detector + react-i18next wiring
└── main.tsx                     # bootstrap: providers + router
```

---

## 4. Internal Layers

| Layer | Responsibility | Cannot |
|-------|---------------|--------|
| Feature | Domain-specific components, hooks, and a service that talks to the API. Encapsulates one user-visible capability. | Import from another feature; reach into the API directly (must go through `shared/api-client`). |
| Route group | Maps URLs to feature components; declares auth guards and lazy boundaries. | Contain business logic; import server-side code. |
| Shared (ui, lib, api-client, auth) | Reusable primitives, design system, API plumbing, auth state. | Import from any feature (one-way dependency). |

---

## 5. Data Flow

**Typical request flow:**

```
Browser → Route → Feature component → React Hook Form hook
  → api-client (shared) → fetch → API
  → typed DTO response → state → re-render
```

**Module communication:** features do not import each other. Cross-feature reuse happens by promoting code to `shared/`. The two route groups `(dashboard)` and `(public)` are lazy boundaries — they ship different chunks to authenticated users vs. guests, so the public invitation never downloads dashboard code (ADR-02 §Option A).

---

## 6. Cross-cutting Concerns

### Logging
- Mechanism: `console` in dev + Sentry capture in production
- Location: Sentry initialized once in `main.tsx`; the `api-client` logs request failures with the API `traceId`
- Rule: never log PII (guest full names, emails, phones); log only error codes + `traceId`

### Error Handling
- Mechanism: API returns the standard envelope `{ code, message, details?, traceId }`; the `api-client` throws a typed `ApiError(code, details, traceId)`; the UI maps `code` → i18n message via a central registry
- Location: `shared/api-client/errors.ts` + `shared/lib/api-error-map.ts`
- Rule: every user-facing error is shown in the active locale; raw `code` is sent to Sentry, never displayed

### Validation
- Mechanism: `class-validator` decorators on the same DTO classes from `@wendy/contracts`, executed via the `classValidatorResolver` adapter for React Hook Form (ADR-14)
- Location: DTOs in `packages/contracts/src/dtos/`; adapter in `@wendy/contracts/fe-adapter`
- Rule: same decorators, same rules, same error codes as the API — one source of truth

### Authentication (AuthN)
- Mechanism: access token kept in memory (Zustand store or React Context); refresh token in an `HttpOnly` cookie set by the API; the `api-client` transparently POSTs to `/oauth/refresh` on 401
- Location: `shared/auth/` (token store, login/logout hooks); guards in `routes/(dashboard)/_auth-guard.tsx`
- Rule: tokens are never written to `localStorage`; logout calls `POST /oauth/logout` and clears the in-memory store

### Authorization (AuthZ)
- Mechanism: role read from the JWT at login; the dashboard router hides routes the user is not authorized for
- Location: `shared/auth/use-role.ts`; per-feature components may additionally check role before rendering sensitive actions
- Rule: UI hides what the user cannot do; the API is the source of truth — any forbidden call returns 403

### Internationalization (i18n)
- Mechanism: `i18next` + `react-i18next` + `i18next-browser-languagedetector` (ADR-08)
- Location: `i18n/config.ts` (provider wiring) + `i18n/locales/{en,es}/<namespace>.json`
- Rule: priority is explicit user choice (cookie) → `Accept-Language` → default `en`; CI step fails the build if any key is missing in a locale

### API client
- Mechanism: a thin `fetch` wrapper that injects the access token, refreshes on 401, and tags every request with a `traceId`
- Location: `shared/api-client/`
- Rule: features call `apiClient.get<DTO>(path)` and trust the returned type; never call `fetch` directly

---

## 7. Testing Strategy

| Type | What | Tool | NOT tested here |
|------|------|------|-----------------|
| Component | UI components in isolation: rendering, props, RTL interactions | Vitest + `@testing-library/react` | Routing, full form submission, network calls |
| Integration | Form behavior with the `classValidatorResolver`; route guard behavior; locale switching | Vitest + RTL + Mock Service Worker (MSW) | Full app boot, real network, i18n message catalog content |
| E2E | Critical flows: WP login, create wedding, add guests, guest opens `/i/:token`, guest submits RSVP, WP moderates guest photo | Playwright | Internal implementation details, edge cases covered by unit tests |

**Coverage target:** unit tests for shared utilities and form validation paths; one Playwright scenario per primary user journey in §6 of the architecture document.

**Mocking rule:** mock at the network boundary (MSW for integration; Playwright's request interception for E2E) — never mock React state.

**What not to test:** trivial getters, design-system internals, third-party UI primitives.

**E2E tool rationale — Playwright over Karate and Cypress:** Playwright covers the browser-compatibility matrix in §10.1 (Chrome, Edge, Firefox, Safari) from a single TypeScript-native tool and supports the PC + tablet viewport emulation required by TC-8 out of the box. Cypress was considered: its DX is excellent, but the historically Chromium-first coverage and the single-tab execution model make it weaker for our bilingual + multi-browser matrix, and adopting it would require updating ADR-02. Karate is API-focused (DSL-driven) and is a poor fit for SPA E2E. Playwright also gives us auto-wait and parallel execution so the 2-person team's CI stays fast — already committed in ADR-02 §Decision, so no ADR change is needed.

---

## 8. Naming Conventions

- Files: `kebab-case.ts(x)`. Components: `PascalCase.tsx`. Hooks: `use-camelCase.ts`. Folders: `kebab-case`.
- Locales: always lowercase codes (`en`, `es`); keys organized by feature namespace (`weddings.create.title`, `errors.QUOTA_EXCEEDED`).
- No hard-coded user-facing strings — every visible string comes from `useTranslation()`.
- Branded IDs imported from `@wendy/contracts` (same types as the BE).
- Imports: `shared/` is the only allowed direction; features never import each other (enforced by ESLint boundary rules — ADR-12).

---

## Related Decisions

- [ADR-02 — Frontend stack: Vite + React + TypeScript (SPA)](../3.3-decision-record/adr-02-frontend-stack-vite-react.md)
- [ADR-08 — i18n: i18next + react-i18next + Accept-Language](../3.3-decision-record/adr-08-i18n-i18next.md)
- [ADR-14 — Validation: class-validator](../3.3-decision-record/adr-14-validation-class-validator.md)
