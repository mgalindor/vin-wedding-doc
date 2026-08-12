---
title: "Release Plan — Wendy Planner"
date: 2026-08-11
type: management
scope: internal
version: 1.0.0
updated: 2026-08-11
---

# Release Plan — Wendy Planner

> **Capacity**: 1 backend + 1 frontend developer (2 people total).
> **Window**: 6 sprints × 2 weeks = 12 weeks (2026-08-10 → 2026-11-01 build complete; 2026-11-10 hard MVP target).
> **Success metric**: 2 real weddings captured end-to-end (admin onboarding → wedding create → published invitation → RSVPs → photo download).
> **Strategy**: Vertical slices — every sprint ships a working, testable increment. Risk and infrastructure first, features in dependency order, Could-haves at the end.

---

## Sprint 1 — Foundations & Authentication (2026-08-10 → 2026-08-23)

**Goal**: Admin can onboard a Wedding Planner and reset a password; WP can log in and reach an empty dashboard. Monorepo, CI, and local dev environment are operational.

**Demo at end of sprint**: Admin opens the platform → creates a WP account → hands credentials out-of-band → WP logs in → sees a "no weddings yet" screen.

### Architecture & DevOps

- [ ] ARC-001 Bootstrap monorepo with pnpm workspaces [groupBy:: arq] [priority:: 3]
- [ ] ARC-003 Bootstrap NestJS API skeleton with module layout [groupBy:: arq] [priority:: 3]
- [ ] ARC-004 Bootstrap Vite + React Web skeleton [groupBy:: arq] [priority:: 3]
- [ ] ARC-005 Bootstrap `@wendy/contracts` package [groupBy:: arq] [priority:: 3]
- [ ] ARC-008 Initialize Prisma schema and first migration [groupBy:: arq] [priority:: 3]
- [ ] ARC-013 Implement JWT auth (RS256) + JWKS [groupBy:: arq] [priority:: 3]
- [ ] ARC-015 Implement passport-jwt strategy with RBAC guards [groupBy:: arq] [priority:: 3]
- [ ] ARC-036 Implement health checks (Terminus) [groupBy:: arq] [priority:: 3]
- [ ] ARC-002 Enforce ESLint boundary rules [groupBy:: arq] [priority:: 2]
- [ ] OPS-023 Author `docker-compose.yml` for local dev [groupBy:: devops] [priority:: 3]
- [ ] OPS-019 Author CI workflow (`ci.yml`) [groupBy:: devops] [priority:: 3]

### User Stories

- [ ] US-001 Onboard a new Wedding Planner [groupBy:: user-and-role-management] [priority:: 3]
- [ ] US-002 Set the new Wedding Planner's initial access [groupBy:: user-and-role-management] [priority:: 3]
- [ ] US-004 Revoke a Wedding Planner's access [groupBy:: user-and-role-management] [priority:: 3]
- [ ] US-005 Restore a Wedding Planner's access [groupBy:: user-and-role-management] [priority:: 3]
- [ ] US-006 Confirm my identity to access the platform [groupBy:: user-and-role-management] [priority:: 3]

---

## Sprint 2 — Weddings & Guests (2026-08-24 → 2026-09-06)

**Goal**: WP can register a wedding, fill its basic data and invitation modules, and add guests with per-guest invitation links. Guest list CRUD complete.

**Demo at end of sprint**: WP creates a wedding → fills story/location/program → adds guests → copies the first invitation link → opens it in an incognito tab and sees the invitation populated.

### Architecture & DevOps

- [ ] ARC-009 Implement Prisma Migrate deploy pipeline [groupBy:: arq] [priority:: 3]
- [ ] ARC-010 Seed initial Admin (`admin@wendy`) [groupBy:: arq] [priority:: 3]
- [ ] ARC-019 Implement Wedding bounded context [groupBy:: arq] [priority:: 3]
- [ ] ARC-020 Implement per-template payload (JSONB) [groupBy:: arq] [priority:: 3]
- [ ] ARC-021 Ensure S3 prefix provisioning on wedding creation [groupBy:: arq] [priority:: 2]
- [ ] ARC-022 Implement Guest bounded context [groupBy:: arq] [priority:: 3]
- [ ] ARC-023 Implement attendance-status state machine [groupBy:: arq] [priority:: 3]
- [ ] ARC-035 Implement Validation Pipe with shared DTOs [groupBy:: arq] [priority:: 3]
- [ ] ARC-006 Configure shared typed-config classes [groupBy:: arq] [priority:: 2]
- [ ] ARC-016 Implement public-token strategy (invitations, photo-album) [groupBy:: arq] [priority:: 3]
- [ ] ARC-018 Implement disable + password reset endpoints [groupBy:: arq] [priority:: 3]
- [ ] ARC-011 Model WP ownership and Admin-as-WP dual role [groupBy:: arq] [priority:: 2]
- [ ] ARC-012 Move contact fields to Guest Group [groupBy:: arq] [priority:: 2]
- [ ] OPS-025 Provide a seed script for local dev [groupBy:: devops] [priority:: 2]
- [ ] OPS-024 Document the local dev setup [groupBy:: devops] [priority:: 2]

### User Stories

- [ ] US-009 Register a new wedding [groupBy:: wedding-management] [priority:: 3]
- [ ] US-010 Update a wedding's basic details [groupBy:: wedding-management] [priority:: 3]
- [ ] US-015 Add a guest to a wedding [groupBy:: guest-list-management] [priority:: 3]
- [ ] US-016 Update a guest's information [groupBy:: guest-list-management] [priority:: 3]
- [ ] US-017 Remove a guest from a wedding [groupBy:: guest-list-management] [priority:: 3]
- [ ] US-019 Reach each guest with a personal invitation link [groupBy:: guest-list-management] [priority:: 3]

---

## Sprint 3 — Invitation Publish & Bilingual UI (2026-09-07 → 2026-09-20)

**Goal**: WP can publish an invitation with one of 6 templates; guests can view the invitation in English or Spanish on PC/tablet. All 6 invitation templates shipped.

**Demo at end of sprint**: WP opens a wedding → selects a template → publishes → copies a guest link → opens the link in a browser with `Accept-Language: es` → sees the invitation in Spanish with the guest's name pre-loaded.

### Architecture & DevOps

- [ ] ARC-025 Implement Invitation bounded context [groupBy:: arq] [priority:: 3]
- [ ] ARC-026 Implement 6 invitation templates [groupBy:: arq] [priority:: 3]
- [ ] ARC-038 Implement i18n (i18next + Accept-Language detection) [groupBy:: arq] [priority:: 3]
- [ ] ARC-014 Implement OIDC-style auth endpoints [groupBy:: arq] [priority:: 2]
- [ ] ARC-007 Wire OpenAPI 3 generation [groupBy:: arq] [priority:: 2]
- [ ] OPS-008 Provision S3 buckets [groupBy:: devops] [priority:: 3]
- [ ] OPS-013 Provision CloudFront distribution(s) [groupBy:: devops] [priority:: 3]
- [ ] OPS-014 Deploy static Web App [groupBy:: devops] [priority:: 3]
- [ ] OPS-020 Author Web deploy workflow (`deploy-web.yml`) [groupBy:: devops] [priority:: 3]

### User Stories

- [ ] US-018 Track each guest's attendance status [groupBy:: guest-list-management] [priority:: 3]
- [ ] US-022 Make wedding details available to invited guests [groupBy:: online-invitation] [priority:: 3]
- [ ] US-025 View my personal invitation on a big screen [groupBy:: online-invitation] [priority:: 3]
- [ ] US-038 See the platform in my preferred language [groupBy:: platform] [priority:: 3]
- [ ] US-007 Keep my contact information current [groupBy:: user-and-role-management] [priority:: 2]
- [ ] US-023 Preview the invitation before publishing [groupBy:: online-invitation] [priority:: 2]

---

## Sprint 4 — RSVP, Guest Photos & Photo Storage (2026-09-21 → 2026-10-04)

**Goal**: Guests can RSVP and contribute photos; WP can moderate photos, configure photo storage, upload official photos, and download all photos as a single archive. Public infrastructure deployed.

**Demo at end of sprint**: A second browser session opens a guest link, RSVPs, and uploads 3 photos; the WP sees the pending photos in the moderation queue, approves 2 and rejects 1; the WP uploads 5 official photos for the wedding and clicks "Download all" and gets a single archive.

### Architecture & DevOps

- [ ] ARC-027 Implement Guest Photo moderation flow [groupBy:: arq] [priority:: 3]
- [ ] ARC-028 Implement WP moderation queue + approve/reject endpoints [groupBy:: arq] [priority:: 3]
- [ ] ARC-029 Implement guest-photo upload caps enforcement [groupBy:: arq] [priority:: 3]
- [ ] ARC-030 Implement Photo Storage bounded context [groupBy:: arq] [priority:: 3]
- [ ] ARC-031 Implement WP bulk archive download [groupBy:: arq] [priority:: 3]
- [ ] ARC-033 State the official-upload size cap explicitly [groupBy:: arq] [priority:: 3]
- [ ] ARC-034 Implement S3 Lifecycle Policy for photos [groupBy:: arq] [priority:: 3]
- [ ] ARC-037 Implement Audit module [groupBy:: arq] [priority:: 2]
- [ ] ARC-039 Wire Sentry across Web, API, and Lambda [groupBy:: arq] [priority:: 2]
- [ ] OPS-005 Provision RDS PostgreSQL 15 instance [groupBy:: devops] [priority:: 3]
- [ ] OPS-009 Configure S3 Lifecycle Policy [groupBy:: devops] [priority:: 3]
- [ ] OPS-011 Provision ECS Fargate cluster and API service [groupBy:: devops] [priority:: 3]
- [ ] OPS-012 Provision Application Load Balancer (ALB) [groupBy:: devops] [priority:: 3]
- [ ] OPS-021 Author API deploy workflow (`deploy-api.yml`) [groupBy:: devops] [priority:: 3]

### User Stories

- [ ] US-026 Confirm my attendance through my invitation [groupBy:: online-invitation] [priority:: 3]
- [ ] US-028 Moderate photos contributed by guests [groupBy:: online-invitation] [priority:: 3]
- [ ] US-030 Configure photo storage for a wedding [groupBy:: photo-storage] [priority:: 3]
- [ ] US-031 Upload the official photos for a wedding [groupBy:: photo-storage] [priority:: 3]
- [ ] US-033 Download all photos for USB delivery [groupBy:: photo-storage] [priority:: 3]
- [ ] US-034 Give the couple a way to share their own photos [groupBy:: photo-storage] [priority:: 3]
- [ ] US-035 Upload photos through the shared link [groupBy:: photo-storage] [priority:: 3]
- [ ] US-012 Distinguish past and upcoming weddings [groupBy:: wedding-management] [priority:: 2]
- [ ] US-027 Contribute photos to the wedding album [groupBy:: online-invitation] [priority:: 2]
- [ ] US-024 Keep the published invitation in sync with my edits [groupBy:: online-invitation] [priority:: 2]

---

## Sprint 5 — Hardening, Staging & AWS Foundation (2026-10-05 → 2026-10-18)

**Goal**: Staging environment is live with the full flow. AWS foundation is provisioned (VPC, IAM, Route 53, ACM, Secrets Manager, RDS backups). Observability stack is up. Runbooks are written.

**Demo at end of sprint**: End-to-end pilot-wedding dry run on staging, captured in a Loom video. CloudWatch alarms fire when a test lambda errors. Backup/DR drill completes successfully.

### Architecture & DevOps

- [ ] ARC-032 Decide and implement photo quality-tier enforcement [groupBy:: arq] [priority:: 2]
- [ ] ARC-043 Decide and document CDN topology [groupBy:: arq] [priority:: 3]
- [ ] ARC-040 Add data-protection & retention section [groupBy:: arq] [priority:: 2]
- [ ] ARC-041 Add backup/DR paragraph to architecture §7 [groupBy:: arq] [priority:: 2]
- [ ] ARC-044 Author backend blueprint (`apps/api/BLUEPRINT.md`) [groupBy:: arq] [priority:: 2]
- [ ] ARC-045 Author frontend blueprint (`apps/web/BLUEPRINT.md`) [groupBy:: arq] [priority:: 2]
- [ ] OPS-001 Provision AWS account and base networking [groupBy:: devops] [priority:: 3]
- [ ] OPS-002 Create IAM roles and policies [groupBy:: devops] [priority:: 3]
- [ ] OPS-003 Configure Route 53 hosted zone and ACM certificates [groupBy:: devops] [priority:: 3]
- [ ] OPS-004 Provision Secrets Manager entries [groupBy:: devops] [priority:: 3]
- [ ] OPS-006 Configure RDS automated backups + point-in-time recovery [groupBy:: devops] [priority:: 3]
- [ ] OPS-007 Wire Prisma Migrate deploy task [groupBy:: devops] [priority:: 3]
- [ ] OPS-010 Enable S3 server access logging and CloudTrail data events [groupBy:: devops] [priority:: 2]
- [ ] OPS-015 Deploy EventBridge + Lambda lifecycle sweeper [groupBy:: devops] [priority:: 2]
- [ ] OPS-016 Configure CloudWatch Logs and log groups [groupBy:: devops] [priority:: 2]
- [ ] OPS-017 Configure CloudWatch alarms [groupBy:: devops] [priority:: 2]
- [ ] OPS-018 Wire Sentry DSNs into Web, API, Lambda [groupBy:: devops] [priority:: 2]
- [ ] OPS-022 Author staging deploy workflow (`deploy-staging.yml`) [groupBy:: devops] [priority:: 2]
- [ ] OPS-028 Author the deployment runbook [groupBy:: devops] [priority:: 2]
- [ ] OPS-029 Author the on-call runbook [groupBy:: devops] [priority:: 2]
- [ ] OPS-030 Author the backup/DR runbook [groupBy:: devops] [priority:: 2]

### User Stories

- [ ] US-003 Find any Wedding Planner I onboarded [groupBy:: user-and-role-management] [priority:: 2]
- [ ] US-008 Oversee the Wedding Planners I onboarded [groupBy:: user-and-role-management] [priority:: 2]
- [ ] US-011 Find a specific wedding quickly [groupBy:: wedding-management] [priority:: 2]
- [ ] US-013 Archive a wedding that has already happened [groupBy:: wedding-management] [priority:: 2]
- [ ] US-014 Oversee weddings across the WPs I onboarded [groupBy:: wedding-management] [priority:: 2]
- [ ] US-036 Know when photos will be automatically deleted [groupBy:: photo-storage] [priority:: 2]

---

## Sprint 6 — Pilot Wedding Rehearsal, Could-Haves & Buffer (2026-10-19 → 2026-11-01)

**Goal**: Pilot wedding end-to-end rehearsal completed in staging; Could-have items delivered if time allows; buffer for the 2nd pilot wedding before the 2026-11-10 target.

**Demo at end of sprint**: Both pilot weddings' rehearsal videos posted. Could-have items in the backlog are either delivered or explicitly deferred with PO sign-off. Release notes drafted.

### Architecture & DevOps

- [ ] ARC-042 Add monthly cost model to architecture §7 [groupBy:: arq] [priority:: 1]
- [ ] OPS-026 Set up AWS Budgets + cost anomaly alerts [groupBy:: devops] [priority:: 1]
- [ ] OPS-027 Enable VPC endpoints for S3 and Secrets Manager [groupBy:: devops] [priority:: 1]

### User Stories (Could-have — deliver if time allows)

- [ ] US-020 Move the guest list in and out of the platform [groupBy:: guest-list-management] [priority:: 1]
- [ ] US-021 See guest list metrics per wedding [groupBy:: guest-list-management] [priority:: 1]
- [ ] US-029 See invitation status and RSVP progress [groupBy:: online-invitation] [priority:: 1]
- [ ] US-032 Be warned before hitting the photo cap [groupBy:: photo-storage] [priority:: 1]
- [ ] US-037 Monitor photo storage usage per wedding [groupBy:: photo-storage] [priority:: 1]

### Architecture Tasks (Could-have — paired with US items)

- [ ] ARC-024 Implement CSV import/export for guest lists [groupBy:: arq] [priority:: 1]

### Buffer

The last week of Sprint 6 (2026-10-26 → 2026-11-01) is reserved as buffer for:
- Any Must-have item that slipped from earlier sprints.
- Pilot-wedding-specific adjustments (e.g. URL structure, extra invitation module).
- Documentation, deployment runbook polish.
- Hardening for the 2026-11-10 target.

---

## Summary — Item Distribution by Sprint

| Sprint | Must | Should | Could | Total | Sprint Goal Theme |
|---|---|---|---|---|---|
| Sprint 1 (Aug 10–23) | 14 | 1 | 0 | 15 | Foundations & Authentication |
| Sprint 2 (Aug 24–Sep 6) | 14 | 4 | 0 | 18 | Weddings & Guests |
| Sprint 3 (Sep 7–20) | 9 | 3 | 0 | 12 | Invitation Publish & Bilingual UI |
| Sprint 4 (Sep 21–Oct 4) | 16 | 4 | 0 | 20 | RSVP, Guest Photos & Photo Storage |
| Sprint 5 (Oct 5–18) | 6 | 14 | 0 | 20 | Hardening, Staging & AWS Foundation |
| Sprint 6 (Oct 19–Nov 1) | 0 | 0 | 9 | 9 | Pilot Rehearsal, Could-Haves & Buffer |
| **Total** | **59** | **26** | **9** | **94** | |

> Note: 113 backlog items − 94 sprint items = 19 items. The remaining items are deferred Must/Should work that the team will pull in during sprint planning if capacity allows, or moved to Sprint 6 buffer if they slip. They are listed in the backlog but not pre-assigned to a sprint.

### Risk callouts

- **Sprint 1 is dense.** 15 items including 11 architecture/infra tasks. The team's first 2 weeks are largely setup; the first user-visible milestone arrives late in Sprint 1 or early Sprint 2. Front-load the conversation with the PO about progress expectations.
- **Sprint 4 is the largest.** 20 items including 10 architecture tasks (mostly the AWS production deploy chain) and 10 user stories. This is the sprint where pilot-wedding functionality comes together. If it slips, Sprint 5/6 absorb the impact.
- **Sprint 6 is light on purpose.** It is buffer and Could-haves. If the team is on track after Sprint 4, Sprint 5 can absorb hardening work and Sprint 6 becomes pure rehearsal + polish. If Sprint 5 slips, Sprint 6 absorbs the slip.

### Dependencies that drive the order

- Auth (ARC-013/015) → every dashboard route.
- Wedding (ARC-019) → Guest (ARC-022) → Invitation (ARC-025) → Photo Storage (ARC-030).
- Monorepo (ARC-001) → every code change.
- AWS foundation (OPS-001/002/003/004) → every production deploy.
- S3 buckets (OPS-008) → photo upload flow (ARC-027/030).
- ECS + ALB (OPS-011/012) → API in production (ARC-019/022/025/030).

If any of these slip, the dependent items must move with them.