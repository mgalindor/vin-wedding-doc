---
title: "ADR-02 — Frontend stack: Vite + React + TypeScript (SPA)"
id: adr-02
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 2.0.0
updated: 2026-08-10
---

# ADR-02 — Frontend stack: Vite + React + TypeScript (SPA)

> **Revision history**
> - **v2.0.0 (2026-08-10):** Replaced Next.js 15 (App Router) with Vite + React + TypeScript (SPA). User pushback: Next.js was over-engineered for Wendy Planner's actual needs. Documented Option B (NestJS server-rendered HTML) as an escape hatch if first paint becomes a real problem in production.
> - v1.0.0 (2026-08-10): Original decision was Next.js 15 App Router.

## Context

Wendy Planner's frontend must deliver two distinct experiences from the same application:

1. **Admin / WP dashboard** — authenticated SPA-style views for managing weddings, guests, invitations, and photos.
2. **Public invitation** — guest-facing page at `/i/:token` that must load reasonably fast on the networks the guests are on (PC/tablet primary; mobile acceptable but not optimized, per kickoff TC-8).

Additional constraints that drive this decision:

- **No real-time reactivity required.** The dashboard does not need to live-update from the backend; lazy-loading API content and full page refreshes on actions are acceptable. This is a CRUD tool with ~10 internal users.
- **No SEO value** for public invitation pages (they are `noindex, nofollow`, see ADR-10).
- **Single frontend developer**.
- **PC and tablet are the primary targets**; mobile is acceptable but not optimized (TC-8).
- **Bilingual UI (EN default, ES)**, auto-detected from `Accept-Language`, extensible to more languages.
- **6 fixed invitation templates** that the WP picks; the platform fills them with wedding data.
- **No dedicated design team** at Vineyards.

## Decision

**Adopt Vite 5 + React 19 + TypeScript 5.x as a single-page application (SPA) deployed as static assets.**

The whole application — dashboard routes and public invitation routes — is one Vite project, code-split by route group. The public invitation is lazy-loaded so guests do not download the dashboard code (and vice versa).

**Concrete stack:**

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Build tool | **Vite 5** | Fastest dev experience, tiny prod bundle, no SSR complexity. |
| UI framework | **React 19** | Mature; the team's familiarity; sufficient for CRUD + 6 templates without RSC. |
| Language | **TypeScript 5.x** | Same language as the backend; shared types via `@wendy/contracts`. |
| Routing | **TanStack Router** (or `react-router` v7) | File-based or nested routes, lazy loading built-in, type-safe routes. |
| Server state | **`fetch` + `useState`** (or SWR if cache invalidation helps) | No real-time requirements; lazy loads are fine; page refresh on action is acceptable. |
| Forms | **React Hook Form** + **`class-validator`** (via `@wendy/contracts`) | Same DTOs as the API; single source of truth for validation rules (see ADR-14). |
| Styling | **Tailwind CSS** + **shadcn/ui** primitives | No design team; well-documented accessible primitives. |
| i18n | **`i18next` + `react-i18next`** (see ADR-08) | Mature, framework-agnostic, `Accept-Language` + cookie detection. |
| Tests | **Vitest** (unit/integration), **Playwright** (E2E) | Vitest is the natural pair for Vite; Playwright covers the public invitation flow. |

**Rendering model:** classic CSR. The application boots from a single `index.html`; React hydrates on the client. No SSR, no RSC, no server actions.

**Data freshness model:** explicit and intentional. After any mutation (create wedding, edit guest, submit RSVP), the relevant list re-fetches or the page reloads. No background polling, no websocket subscriptions.

**Deployment:** static assets (HTML + JS + CSS + images) are uploaded to S3 and served by CloudFront. **No Node.js runtime for the frontend** (see ADR-04 §Infrastructure and §7 of the architecture document).

## Options Considered

### Option A — Vite + React + TypeScript (SPA) — **Selected**

- **Pros**
  - **Simplest deploy**: `vite build` produces a `dist/` folder; upload to S3, serve via CloudFront. No container, no Node.js server.
  - **Smallest bundle**: ~90–150 KB gzipped for a CRUD SPA, vs ~280–400 KB for Next.js App Router.
  - **Simplest mental model**: components, hooks, routing, fetch. No server/client component split.
  - **Cheapest infra**: S3 + CloudFront ≈ $1–5/month at MVP scale vs ~$30–50/month for a Fargate task running Next.js 24/7.
  - **Fast dev cycle**: Vite HMR is sub-second.
  - **Lazy loading by route group** keeps the public invitation payload tiny (~30–60 KB gzipped for the template + React).
- **Cons**
  - **First paint of the public invitation requires JS execution** (~1–1.5s on a 4G connection for a 60 KB bundle + skeleton).
  - No SSR SEO benefit (irrelevant — pages are `noindex`).
  - No streaming SSR (irrelevant for this workload).

### Option B — NestJS server-renders the invitation HTML with `react-dom/server` — **Escape hatch (not MVP)**

- **When to consider:** after the pilot, if guest feedback or production metrics show that first paint of `/i/:token` is a real problem (e.g. > 1.5s consistently on real devices).
- **How it works:** the 6 invitation templates become React components living in `packages/invitation-templates/`. The NestJS API imports them and uses `react-dom/server`'s `renderToString` to produce HTML on the request. The HTML response includes the full invitation + a tiny hydration script (just for the RSVP form).
- **Trade-offs gained:** sub-500ms first paint; the guest sees content immediately, no React boot on slow connections.
- **Trade-offs lost:** adds server-side rendering complexity to NestJS; the templates have to be hydration-aware (no browser-only APIs at render time); one more failure mode (server rendering errors).
- **Migration cost:** low. The templates already exist as React components in the SPA. Moving them into a NestJS-rendered route is moving files, not rewriting.

### Option C — Next.js 15 (App Router) — **Rejected after re-evaluation**

- **Why we considered it initially:** SSR for the invitation, `next-intl`, single framework for both surfaces.
- **Why we rejected it after review:**
  - We do not need SSR for SEO (`noindex` on invitations).
  - We do not need SSR for first paint at MVP scale (CloudFront caching + lazy loading + skeleton is good enough).
  - We do not need server components (the dashboard is fully interactive, the invitation is mostly static).
  - The runtime cost (Fargate task, Node.js server, ~30–50 USD/month) is unjustified.
  - The dev experience penalty (server vs client component decisions, server actions, streaming) does not buy us anything for this workload.
- **Reverted** based on user feedback during architecture review (2026-08-10).

### Option D — Astro (static-first, islands)

- **Pros:** excellent for content sites with sparse interactivity, ships very little JS.
- **Cons:** Wendy Planner's dashboard is not a content site (it's a CRUD app); Astro's "all islands" model would defeat the purpose for the dashboard.
- **Verdict:** good fit for the invitation alone, awkward for the dashboard. Not worth splitting the stack.

## Consequences

### Positive

- One framework, one mental model, one build, one deploy target (S3 + CloudFront).
- Smallest feasible bundle for the dashboard.
- No Node.js runtime for the frontend → simpler ops, cheaper bill.
- Onboarding a new FE developer is "learn React" — no SSR-specific concepts.
- The 6 invitation templates stay as React components. If Option B (server rendering) becomes desirable later, the migration is mechanical.

### Negative / Trade-offs

- First paint of `/i/:token` is ~700ms slower than an SSR solution would be. Acceptable for MVP; documented as an escape hatch (Option B).
- Every public invitation page requires JS to render. If a guest has JS disabled, they see a skeleton and a "loading" indicator (acceptable; less than 1% of the target audience).
- No streaming SSR (irrelevant for this workload).

### Follow-up actions

- [ ] Bootstrap the Vite + React + TS project at `apps/web/` [owner:: frontend] [priority:: high] [due:: end of sprint 1]
- [ ] Configure TanStack Router (or React Router v7) with two route groups: `(dashboard)` and `(public)` [owner:: frontend] [priority:: high]
- [ ] Set up Tailwind + shadcn/ui [owner:: frontend] [priority:: high]
- [ ] Wire `i18next` + `react-i18next` (see ADR-08) [owner:: frontend] [priority:: high]
- [ ] Build the proof-of-concept public invitation with one template; measure first paint locally and on a staging CloudFront distribution [owner:: frontend] [priority:: high] [due:: end of sprint 1]
- [ ] Document the local dev setup (one paragraph in the README) — `pnpm install`, `pnpm dev`, open `http://localhost:5173` [owner:: frontend] [priority:: high]

### Revisit when

- Production metrics show first paint of `/i/:token` > 1.5s on real devices → activate **Option B** (NestJS SSR with `react-dom/server`).
- A new client engagement needs full SSR for SEO on public pages → revisit Next.js for that engagement only.
- The team grows past 3 FE developers and the lack of SSR conventions starts to bite (rare; SPA conventions are stable).
