---
title: "Architecture Audit — Wendy Planner (architecture.md + ADR-01..17)"
date: 2026-08-11
type: analysis
scope: internal
version: 1.0.1
updated: 2026-08-11
---

# Architecture Audit — Wendy Planner

> **Subject of audit:** `3-architecture/3.1-architecture/architecture.md` (v1.0.0) and ADR-01 through ADR-17 in `3-architecture/3.3-decision-record/`.
> **Audited against:** `1-management/1.1-kickoff/kickoff.md` (scope and constraints), `README.md` (project brief), `glossary.md` (ubiquitous language), and `2-product/2.1-discovery/2.1.5-features/20260810-official-photo-storage.md` (FEAT-004).
> **Nature of this document:** read-only audit. Nothing in the audited documents was modified. Findings are opinions and recommendations; each one cites its evidence.

## 1. Executive Summary

The architecture document is **above average for a project at this stage**: the arc42 structure is complete, every kickoff constraint is traced to an ID, the ADRs follow a consistent Context → Options → Decision → Consequences format with explicit trade-offs and "revisit when" triggers, and the documented pivots (ADR-02 v2 dropping Next.js for a Vite SPA, ADR-08 v2 dropping `next-intl`) show the team actually applying the reversibility principle it preaches. The fundamental decisions — modular monolith, NestJS + Vite/React monorepo, PostgreSQL, S3 with lifecycle deletion, Fargate + CloudFront — are pragmatic and well matched to a 2-person team with a 3-month MVP window.

**However, the document set should not be treated as "done".** The audit found a systemic problem — **revision hygiene** — plus a handful of **requirements traceability gaps**:

1. **Revision hygiene (the dominant issue).** Several documents were revised to v2.0.0 on 2026-08-10 (ADR-02, ADR-05, ADR-08, ADR-11), but the dependent documents were not swept for the consequences. There are stale references to Next.js, Zod, SSR, and "Fargate for the Web App" scattered across the architecture document and at least five ADRs. Three of these are direct internal contradictions that would confuse or mislead implementation (findings H-1, H-2, H-3).
2. **Traceability gaps against the kickoff and glossary.** Four business rules that exist in the kickoff/glossary/feature docs did not make it into the architecture: guest-photo **moderation before publishing**, **WP bulk download → USB delivery** (the architecture instead gives the couple a post-event download capability the kickoff does not grant), the **Administrator-can-also-be-a-WP dual role** with per-admin WP ownership, and the **compliance/data-protection** precondition (LFPDPPP/GDPR).
3. **A few technical claims need a second look**: the photo quality tier cannot be "enforced on the server side" with the chosen presigned-URL upload pattern, the S3 Lifecycle mechanism is described in a way S3 cannot execute as written, and the CDN topology (one vs. two CloudFront distributions) contradicts itself across documents.

None of this invalidates the architecture. All findings are fixable in a focused documentation pass plus 2–3 small design clarifications. **Recommendation: do not start sprint 1 implementation against the current text of findings H-1..H-3; schedule a v1.1.0 revision pass first.** Fixing a document costs an hour; fixing code written against a contradictory document costs a sprint.

**Readiness verdict:** fit to guide the first technical session with Vineyards; **not yet fit** as the sole implementation reference until the High findings are resolved.

## 2. What Is Good (and Should Be Preserved)

- **Constraint traceability.** Every technical and organizational constraint carries an ID (TC-x, OC-x, CV-x) mapped to a kickoff source. This is exactly how a small team keeps scope honest.
- **ADR discipline.** 17 ADRs, each with options considered, explicit pros/cons, follow-up actions with owners, and "revisit when" triggers. ADR-11's comparison matrix and ADR-13's collision math are exemplars of evidence-based decision making.
- **Pragmatism over dogma.** The Next.js → Vite SPA reversal (ADR-02 v2) with an honest cost table ($1–5/month static vs. $30–50/month Fargate) and a documented escape hatch (Option B: NestJS SSR) is textbook evolutionary architecture.
- **Runtime view prioritizes the primary flows.** WP onboarding, wedding capture, and guest capture come first — matching the MVP success metric of 2 end-to-end weddings.
- **Defense-in-depth mindset on cost control.** Photo lifecycle has two enforcement layers and the 200-photo cap is treated as a cost bound, not just a functional rule.
- **Honest risk table.** PO availability and the unvalidated backend stack are flagged as release-blockers rather than footnotes.
- **Kickoff precondition coverage is mostly good.** Of the ~17 preconditions in the kickoff, most are resolved or explicitly tracked (see §6 matrix).

## 3. High-Severity Findings (contradictions that block or mislead implementation)

### H-1 — ADR-05 contradicts itself on the JWT signing algorithm (HS256 vs RS256)

**Evidence:**
- `adr-05-auth-jwt-bcrypt.md` §Token mechanics: *"Access token: 15-minute lifetime, signed with **HS256** (RS256 is a future option if the IdP requires it)"*.
- Same file, two bullets later, §Framework: *"RS256 signing; public key served at `/.well-known/jwks.json`; private key in Secrets Manager."*
- `adr-15-auth-framework-passport.md` dedicates a whole section to *"Why RS256, not HS256"* and configures `algorithms: ['RS256']` in the `JwtStrategy`.
- `architecture.md` §8.1 also states RS256 + JWKS.

**Why it matters:** HS256 and a public JWKS endpoint are mutually exclusive — you do not publish a shared symmetric secret. An implementer reading §Token mechanics first will build the wrong thing or have to stop and ask. This is the single most consequential line-level bug in the document set.

**Recommendation:** fix the §Token mechanics bullet in ADR-05 to RS256 and bump the ADR to v2.0.1 with a revision note.

### H-2 — ASR-3 claims server-side rendering; ADR-02 v2 explicitly rejected SSR

**Evidence:**
- `architecture.md` §1.2, ASR-3 *Architectural impact* column: *"Drives the choice of **server-side rendering** for invitation pages (SEO + first paint)"*.
- `adr-02-frontend-stack-vite-react.md` v2.0.0: classic CSR SPA, no SSR, `noindex` pages, first paint handled via CloudFront caching + lazy route + skeleton.
- `architecture.md` §6.7 correctly says *"CSR for both surfaces"* — so the document contradicts itself.

**Why it matters:** this is a leftover from the v1 (Next.js) era. SEO is explicitly a non-goal (`noindex` per ADR-10), so the stated rationale is also wrong, not just the mechanism. Anyone deriving FE work from §1.2 will design for SSR that will never exist.

**Recommendation:** rewrite ASR-3's impact column to reference CSR + lazy-loaded public route + skeleton + CloudFront caching (per ADR-02 v2).

### H-3 — WP onboarding runtime scenario contradicts the password semantics decided in ADR-05

**Evidence:**
- `architecture.md` §6.1: `POST /api/v1/wedding-planners { fullName, email, role }` → response `201 { userId, username, initialPassword }`, *"shows username + initial password (one-time display in UI)"*. The password is **system-generated and returned in the API response**.
- `adr-05-auth-jwt-bcrypt.md` (and `architecture.md` §8.1): *"WP password (assigned by Admin): the value the Admin enters is stored bcrypt-hashed"* — the password is **chosen by the Admin**, never generated by the system.
- Kickoff: *"La contraseña la asigna el administrador."*

**Why it matters:** two different flows will be implemented depending on which document the developer reads. Additionally, returning a password in an HTTP response body is a security smell (it lands in logs, browser history, and Sentry payloads unless scrubbed). If the Admin types the password, it never needs to travel back at all.

**Recommendation:** align §6.1 with ADR-05 — the create request carries the Admin-entered password; the response contains no password; the "one-time display" UI disappears.

## 4. Medium-Severity Findings (close before the first pilot wedding)

### M-1 — CDN topology contradicts itself: one distribution vs. two, and "same-origin rewrites" is Next.js vocabulary

**Evidence:**
- `adr-10-invitation-url-strategy.md`, Option C pros: *"one domain, **one CloudFront distribution**, one ALB rule"*.
- `architecture.md` §5.2 container table and §7.1 diagram: **two** CloudFront distributions (`web` and `api`).
- `architecture.md` §5.2 *Important Interfaces*: *"Web → API: same-origin via **rewrites** in production"* — "rewrites" is Next.js terminology; the SPA has no server to rewrite anything. With static hosting, same-origin is achieved with a CloudFront behavior routing `/api/*` to the ALB origin — which implies **one** distribution.
- If the answer is two distributions (`wendy.app` + `api.wendy.app`), then CORS-with-credentials, the refresh-token cookie's `Domain`/`SameSite` behavior, and preflight caching all need documenting. None of that exists today.

**Recommendation:** pick one topology (one distribution with an `/api/*` behavior is the simplest and preserves same-origin cookies), then align ADR-10, §5.2, §7.1, and document the CORS/cookie policy accordingly.

### M-2 — Stale Next.js / Zod / Fargate-for-web references survived the v2 revisions

**Evidence (non-exhaustive):**

| Location | Stale text | Superseded by |
|----------|-----------|---------------|
| `architecture.md` §4, cloud row | *"AWS ECS Fargate for both the Web App and the API"* | ADR-02 v2: web is static on S3 + CloudFront; §7.1 agrees |
| `adr-04-cloud-aws-ecs-fargate.md` §Decision | *"Deploy both the Web App and the API as ECS Fargate services"* | Same as above (ADR-04 is still v1.0.0) |
| `adr-01-backend-stack-nestjs.md` Option B pros | *"…with the **Next.js** frontend. Shared types, shared validation schemas (**Zod**)"* | ADR-02 v2 (Vite), ADR-14 (class-validator) |
| `adr-03-database-postgresql-rds.md` Option A pros | *"…and **Next.js** ecosystems"* | ADR-02 v2 |
| `adr-09-modular-monolith-organization.md` folder tree | `packages/contracts/` *"shared **Zod** schemas"* | ADR-14 (class-validator DTOs) |
| `adr-12-monorepo-pnpm-workspaces.md` Context + CI section | *"a **Next.js** Web App… (**Zod** schemas)"*; CI bullet *"`apps/web` changed → build Web image… push to ECR"* | ADR-02 v2 / ADR-14; §8.8 correctly describes `vite build` → S3 sync → CloudFront invalidation |

**Why it matters:** individually each is a one-line fix; collectively they signal that the "panel review: done" status in the front matter did not include a cross-document consistency sweep. ADR-12 additionally describes a web CI pipeline (image → ECR) that contradicts §8.8 of the architecture document, and its `apps/web/Dockerfile` "for staging bake only" conflicts with §7.2 where staging mirrors prod (static S3 + CloudFront).

**Recommendation:** one sweep pass; bump affected ADRs a patch version; bump `architecture.md` to v1.1.0 with a changelog entry.

### M-3 — The photo quality tier cannot be enforced as documented

**Evidence:**
- `adr-06-photo-storage-s3-lifecycle.md` defines High as *"original file as uploaded… the API will compress to a reasonable upper bound"* and Low as *"compressed to ~70% JPEG quality, max 1920 px"*.
- Same ADR, upload pattern: **direct-to-S3 via presigned URLs** — the API never sees the bytes, so it cannot compress anything.
- Same ADR, trade-offs: *"there is no in-place transcoding in MVP"* — contradicting the "API will compress" sentence.
- FEAT-004 *Desired Outcome*: *"the chosen tier is enforced on the server side"* — an explicit requirement the current design cannot meet.

**Recommendation:** pick and document the enforcement mechanism explicitly. Options: (a) client-side compression in the browser before the PUT (canvas API; cheap, but "server-side enforced" becomes untrue), (b) post-upload Lambda triggered by S3 events that compresses/replaces the object (keeps direct upload, adds a moving part), or (c) soften the requirement with the PO to "tier is a hint applied best-effort". Any of the three is defensible; silence is not.

### M-4 — Guest photo moderation is required by the glossary and the kickoff, and appears nowhere in the architecture

**Evidence:**
- `glossary.md`, *Guest Photo Album*: *"**WP moderation is required before publishing**."*
- Kickoff preconditions: *"Subida de fotos por invitados: reglas anti-abuso — tamaño máximo por archivo, formato permitido, **moderación antes de publicar**."*
- The architecture covers size (5 MB) and format (JPG/PNG/GIF) caps (TC-10) but there is **no moderation state, no WP review queue, no publish transition** in any bounded context, runtime scenario, or ADR.

**Recommendation:** add the moderation flow to the Guest Management/Invitation context: `GuestPhoto` states (`Pending`/`Approved`/`Rejected`), a WP review screen, and the rule that only approved photos render on the public invitation. Small in scope, but it touches the data model, the API, and the dashboard — expensive to retrofit after sprint 3.

### M-5 — Photo delivery flow deviates from the kickoff: architecture gives the couple a download; kickoff says the WP downloads and delivers USB

**Evidence:**
- Kickoff: *"Las fotos se descargan después del evento y se entregan al cliente en USB (**la descarga la realiza el WP**)."*
- `glossary.md`, *Couple*: *"They receive the official photos on USB… They do not have direct access to the Wendy Planner platform"* — the shared link is for viewing/uploading only.
- FEAT-004 BR-04: *"The WP can download all photos for a wedding as a **single archive** (intended for USB delivery)."*
- `architecture.md` §1.4, §3.1, §3.2: the **couple** *"downloads photos post-event"* via *"Browser → CDN → Object Storage"*, and no WP-side bulk-archive mechanism exists anywhere. S3 has no server-side zip; a "single archive" needs a Lambda/ECS zip job or a documented multi-file download UX.

**Recommendation:** realign with the kickoff: couple link = view + upload (per the FEAT-004 open-question answer); WP dashboard gets a "download all" that produces a single archive. Decide and document the archive mechanism (async zip job + notification, or browser-driven batch download). Also confirm with the PO whether the couple-download capability is an intentional scope addition — if yes, update the glossary and FEAT-004, not just the architecture.

### M-6 — The Administrator dual role and WP ownership are not modeled

**Evidence:**
- `glossary.md`, *Wedding Planner*: *"Each WP is **owned by exactly one Administrator** (the one who onboarded them). An **Administrator can also be a WP**."*
- Kickoff: an Admin *"puede ver y editar todos los proyectos de los WPs que él haya dado de alta"* and *"también puede ser WP"*.
- The architecture models a **single `role` claim** in the JWT (`Administrator` | `WeddingPlanner`) and never mentions an `onboarded_by`/`owner_admin_id` relationship or admin override authorization rules.

**Why it matters:** a user who is both Admin and WP cannot be expressed with one enum claim; "admin sees only the WPs they onboarded" requires an ownership column and query scoping that QS-04's "100% blocked" scenario doesn't cover (admin→WP access must be allowed, WP→WP blocked). Retrofitting role multiplicity into JWT claims, guards, and every repository query is exactly the kind of change that is cheap now and painful later.

**Recommendation:** decide the model now — e.g. a `roles` array claim or separate `is_admin` flag, plus `users.onboarded_by_admin_id` — and record it in ADR-05/ADR-07 or a short new ADR.

### M-7 — Compliance and data-protection view is missing (kickoff precondition)

**Evidence:** kickoff preconditions: *"Cumplimiento aplicable: confirmar la regulación específica (LFPDPPP, GDPR u otra) y derechos de eliminación / acceso del invitado final."* The architecture stores guest PII (names, emails, phones) and photos of identifiable people, yet has no compliance section. Related: the retention precondition for non-photo data was answered in FEAT-004 (*"No restriction to save the information, but the photos will be deleted after 1 month"*) but that stance is not reflected in the architecture document.

**Recommendation:** add a short §8.x "Data protection & retention" stating: applicable regulation (confirm with Vineyards — likely LFPDPPP given the Mexican context), the fact that Vineyards holds the data-processing agreements with end customers (per kickoff), non-photo data retention stance (retained; no auto-deletion), guest PII deletion procedure (manual on request is acceptable for MVP — say so), and where PII lives (RDS tables + S3 + Sentry — make sure Sentry doesn't capture PII in breadcrumbs).

## 5. Low-Severity Findings (clarifications and technical nits)

| # | Finding | Evidence | Suggestion |
|---|---------|----------|------------|
| L-1 | **Guest-photo token expiry blocks real usage.** `/g/{token}` has `exp: event_date`, but guests upload photos during/after the event. The glossary also implies guest uploads happen via the invitation link (`/i/{token}`), making the third token type possibly redundant. | ADR-10; architecture §8.1; glossary *Guest Photo Album* | Either drop `/g/` and reuse the invitation token (`aud: 'invitation'`, `exp: event_date + 30d`), or extend the guest-photos expiry to `event_date + Nd`. |
| L-2 | **URL-length claims are wrong for RS256 JWTs.** ADR-10 claims links *"fit in a WhatsApp preview (~80 chars)"*; ADR-13 estimates ~150 chars. An RS256 JWT is ~500–600 chars (342 for the signature alone). | ADR-10 §URL preview; ADR-13 §URL table | Links still work fine in WhatsApp — just correct the rationale, or if short links truly matter, evaluate opaque NanoId tokens with a server-side lookup (trade-off: revocation comes free, statelessness is lost). |
| L-3 | **S3 Lifecycle cannot expire "tag value + 30d".** Lifecycle rules expire by days-since-creation or by absolute date; the design needs one rule per wedding with an absolute expiration date (max 1,000 rules/bucket, rule housekeeping required). Meanwhile ADR-06 Option B was rejected as *"requires always-on compute"* — which is false for a Lambda. QS-03's measure (deleted within 24h) is satisfied by the daily sweeper alone. | ADR-06; architecture §8.7 | Either document the per-wedding absolute-date rules + cleanup, or simplify to Lambda-only deletion and drop a mechanism. Pragmatically, the second option wins at this volume. |
| L-4 | **Contact info is modeled on the wrong entity.** Glossary: email/phone live at the **Guest Group** level; §6.3 creates guests with per-guest `email?, phone?`. | glossary *Guest Group* vs architecture §6.3 | Move contact fields to the guest-group payload in §6.3 (and the DTOs). |
| L-5 | **RSVP state machine is inconsistent across docs.** ASR-2 says the guest submits one of three states via the link; the glossary says the link has a single "Confirm attendance" button, cannot be edited, and Declined is set by the WP manually. | ASR-2; §6.4; glossary *RSVP* / *Attendance Status* | Align: link = Confirm only; WP sets Declined/Pending in the dashboard. Also define the re-submission response (409 vs. idempotent 200). |
| L-6 | **Backup/DR is absent from the main document.** RTO ≤ 4h / RPO ≤ 1h and the 7-day backup retention exist only in ADR-03/ADR-04 decisions and follow-up tasks. | ADR-03 §Decision; ADR-04 follow-ups | One paragraph in §7 or §8 stating backup schedule, retention, RTO/RPO. |
| L-7 | **No cost model despite cost being quality goal #2.** A rough estimate: NAT ~$32 + ALB ~$18 + RDS t4g.micro ~$14 + 2 Fargate tasks ~$17 + misc ≈ **$85–100/month** — within "low hundreds", but NAT + ALB are half the bill and VPC endpoints (S3 gateway endpoint is free) are never mentioned. | §1.3 goal 2; §7.1 | Add a monthly cost table to §7; evaluate S3/Secrets Manager VPC endpoints vs. NAT. |
| L-8 | **Official-photo size cap is ambiguous.** ADR-06 says High is *"original… within the 5 MB cap"*, but the 5 MB cap is defined (TC-10, glossary) for **guest** photos. Professional photos often exceed 5 MB; the "1 GB per wedding" cost bound depends on the cap. | ADR-06 §Quality tier; TC-10 | State the official-upload size limit explicitly (or "no cap, tier-dependent compression") and re-derive the cost bound. |
| L-9 | **Deployment diagram TLS labeling.** ALB is shown as *"internal HTTP :80"* in public subnets, while §10 claims *"TLS 1.2+ everywhere (ALB, CloudFront, RDS)"* and ADR-04 puts ACM on the ALB. Also, an internal ALB behind CloudFront requires CloudFront VPC origins — name it, or make the ALB internet-facing with origin verification. | §7.1 diagram; §10.1; ADR-04 | Align diagram, ADR-04, and the TLS quality row on one story. |
| L-10 | **Unexplained diagram edge.** §5.2 shows `api -. "object events" .-> cron`, but no S3-event → Lambda notification is described anywhere (the sweeper is purely schedule-driven). §3.2's table also lists the S3 Lifecycle Policy as if it were triggered by the scheduler — they are independent mechanisms. | §5.2; §3.2 | Remove the edge or document the event flow; fix the §3.2 row. |
| L-11 | **Minor wording issues.** QS-02 *"1 WPs concurrently"*; ASR-6 *"locale-aware routing on invitations"* (no locale routing exists — detection is header-based); §10.1 *"Bilingual invitation content"* row claims the invitation renders in the guest's locale, but ADR-08 says wedding content renders as entered (only template chrome is localized); §10.1 *"no AWS-specific code"* while the API uses the AWS SDK for presigning; ADR-05 *"fully stateless"* while refresh tokens are persisted server-side. | Various | One-line fixes during the v1.1.0 pass. |
| L-12 | **Guest-facing support procedure** (kickoff precondition: channel, owner, response time when a guest's link/RSVP fails) is operational, not architectural — but nobody owns it yet. | Kickoff preconditions | Track it in the backlog/management docs, not here. |

## 6. Kickoff Preconditions — Coverage Matrix

| Kickoff precondition | Status in architecture set |
|----------------------|----------------------------|
| Product Owner / client contact (name, hours, SLA) | Tracked as top risk (§11) — still open |
| Backend stack decision (Java vs Node) | ADR-01 (NestJS) + validation spike planned — pending client sign-off |
| Frontend stack proposal | ADR-02 v2 — done, pending client validation |
| Cloud provider and region | ADR-04 (AWS, us-east-1) — done |
| Database technology | ADR-03 (PostgreSQL 15 / RDS) — done |
| Photo storage + auto-deletion mechanism | ADR-06 — done, but see M-3 and L-3 |
| `tenant_id` schema strategy | ADR-07 — done |
| Public invitation URL structure | ADR-10 — done, but see M-1, L-1, L-2 |
| Operational definition of "successful capture" (checklist) | Not covered — product artifact, track in backlog |
| Retention policy for non-photo data | Answered in FEAT-004, not reflected in architecture (see M-7) |
| Photo deletion reference date | Resolved: event date (ADR-06, FEAT-004) — done |
| Guest support procedure | Not covered (L-12) |
| Backup and recovery strategy (RTO/RPO) | Partially — only inside ADRs (L-6) |
| Photo quality tier definitions | ADR-06 — defined but not enforceable as written (M-3) |
| Applicable compliance (LFPDPPP/GDPR) + guest rights | **Not covered (M-7)** |
| Minimal audit trail | §8.6 — done, covers all events the kickoff lists |
| CI/CD and environments strategy | §8.8 + §7.2 — done |
| Guest upload anti-abuse rules (size, format, moderation) | Partially — caps done; **moderation missing (M-4)** |
| Initial backend spike | ADR-01 follow-up + §11 risk — planned |

## 7. Recommended Actions (prioritized, nothing executed)

> [!IMPORTANT]
> Per the audit's read-only mandate, none of these actions has been applied. They are proposals for the team to schedule.

**Priority 1 — before sprint 1 starts (contradictions):**

- [X] Fix ADR-05 §Token mechanics: HS256 → RS256 (H-1) [owner:: tech-lead] [priority:: high] [completion:: 2026-08-11]
- [X] Rewrite ASR-3 architectural impact: remove SSR, reference ADR-02 v2 CSR strategy (H-2) [owner:: tech-lead] [priority:: high] [completion:: 2026-08-11]
- [X] Align §6.1 with ADR-05: Admin-entered password in the request; no password in the response (H-3) [owner:: tech-lead] [priority:: high] [completion:: 2026-08-11]
- [ ] Decide CDN topology (recommend: one distribution, `/api/*` behavior to the ALB) and align ADR-10 + §5.2 + §7.1 + CORS/cookie notes (M-1) [owner:: tech-lead] [priority:: high]
- [X] Sweep stale Next.js/Zod/Fargate-for-web references in §4, ADR-01, ADR-03, ADR-04, ADR-09, ADR-12; bump `architecture.md` to v1.1.0 with a changelog (M-2) [owner:: tech-lead] [priority:: high] [completion:: 2026-08-11]

**Priority 2 — before the first pilot wedding (traceability gaps):**

- [ ] Document the photo quality-tier enforcement mechanism and reconcile with FEAT-004's "server-side enforced" (M-3) [owner:: backend] [priority:: high]
- [X] Add guest-photo moderation (states, WP queue, publish rule) to the architecture and data model (M-4) [owner:: backend] [priority:: high] [completion:: 2026-08-11]
- [ ] Realign photo delivery with the kickoff: WP bulk-archive download → USB; couple link = view + upload only — or escalate the scope change to the PO and update glossary/FEAT-004 (M-5) [owner:: tech-lead] [priority:: high]
- [ ] Model Admin-as-WP dual role + WP ownership by Admin; update ADR-05 claims and QS-04 (M-6) [owner:: backend] [priority:: high]
- [ ] Add a data-protection & retention subsection (LFPDPPP stance, non-photo retention, PII inventory, guest deletion procedure) (M-7) [owner:: tech-lead] [priority:: medium]

**Priority 3 — hardening (can wait for the v1.1.0 pass):**

- [ ] Resolve guest-photo token: drop `/g/` or extend expiry past the event date (L-1) [owner:: backend] [priority:: medium]
- [ ] Correct URL-length claims in ADR-10/ADR-13 (L-2) [owner:: backend] [priority:: low]
- [ ] Decide S3 lifecycle mechanics (absolute-date rules + housekeeping) or simplify to Lambda-only deletion (L-3) [owner:: backend] [priority:: medium]
- [ ] Move guest contact fields to Guest Group in §6.3 (L-4) [owner:: backend] [priority:: medium]
- [ ] Align RSVP state machine with the glossary; define re-submission semantics (L-5) [owner:: backend] [priority:: medium]
- [ ] Add backup/DR paragraph (RTO ≤ 4h, RPO ≤ 1h) to §7/§8 (L-6) [owner:: backend] [priority:: medium]
- [ ] Add monthly cost estimate table; evaluate VPC endpoints vs. NAT (L-7) [owner:: tech-lead] [priority:: medium]
- [ ] State the official-photo size cap and re-derive the per-wedding cost bound (L-8) [owner:: backend] [priority:: low]
- [ ] Fix §7.1 ALB/TLS labeling; name CloudFront VPC origins or internet-facing ALB (L-9) [owner:: tech-lead] [priority:: low]
- [ ] Remove/explain the "object events" edge; fix the §3.2 lifecycle row (L-10) [owner:: tech-lead] [priority:: low]
- [ ] Batch-fix wording nits (L-11) [owner:: tech-lead] [priority:: low]

## 8. Final Opinion

This is a **good architecture document with a hygiene problem, not a bad architecture**. The significant decisions — monolith over microservices, SPA over SSR, Prisma over TypeORM/Drizzle, Fargate over EKS, class-validator DTOs shared across the wire — are all defensible, well-argued, and appropriately reversible for a 3-month MVP. I would not reopen any of them.

What I would not do is start coding against the current text. Three self-contradictions (H-1..H-3) and four missing business rules (M-4..M-7) are exactly the class of issue that is nearly free to fix in markdown and disproportionately expensive to fix in code. The pattern behind most findings is telling: the v2.0.0 revisions on 2026-08-10 changed decisions but the blast radius of those changes was not swept. The fix is process, not heroics — when an ADR is revised, grep for the old terms across the repo before marking the revision done.

Two strategic notes worth keeping:

1. **The self-review in §12 claims "no critical issues found."** This audit disagrees. For a 2-person team, a lightweight external review (even one hour from a peer architect) before declaring "panel review: done" would have caught every High finding here — they are all visible from cross-reading, not from deep analysis.
2. **The reversibility story is the document's biggest asset.** Keep the "revisit when" sections honest and dated; they are what will let this MVP evolve into the post-MVP iterations (budget, vendors, multi-tenancy) without a rewrite — which is the actual business goal.

*End of audit report.*
