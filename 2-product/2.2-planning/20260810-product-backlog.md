---
title: "Product Backlog"
date: 2026-08-10
type: management
scope: internal
version: 1.4.0
updated: 2026-08-12
revision-history:
  - v1.4.0 (2026-08-12): marked ARC-001, ARC-002, ARC-003 as completed. Refined ARC-003 description to reflect the corrected blueprint folder structure (shared/ instead of common/, no infra/).
  - v1.3.0 (2026-08-11): prior version
---

# Product Backlog

This backlog is derived from the user journey maps in `2-product/2.1-discovery/2.1.4-customer-journey/` and the architecture document in `3-architecture/3.1-architecture/architecture.md`. It captures user needs plus the technical tasks required to deliver the MVP.

**Story format:** `{Short title} - As a [role], I need [action] so that [benefit}` followed by metadata tags.

**MoSCoW priority values:**
- `[priority:: 3]` — **Must have** — Without this, the MVP cannot launch.
- `[priority:: 2]` — **Should have** — Important, but not critical for launch.
- `[priority:: 1]` — **Could have** — Nice to have if time allows.
- `[priority:: 0]` — **Won't have** — Explicitly excluded from this release.

> Priority distribution: ~57% Must, ~32% Should, ~11% Could. Ruthlessly focused on the MVP success metric: 2 end-to-end pilot weddings.

## User & Role Management

- [ ] US-001 Onboard a new Wedding Planner - As an Administrator, I need to register a new Wedding Planner so that they can start working on weddings [groupBy:: user-and-role-management] [priority:: 3]
- [ ] US-002 Set the new Wedding Planner's initial access - As an Administrator, I need to set how the new Wedding Planner will sign in for the first time so that they can begin using the platform [groupBy:: user-and-role-management] [priority:: 3]
- [ ] US-003 Find any Wedding Planner I onboarded - As an Administrator, I need to search and locate any Wedding Planner I have onboarded so that I can manage their account efficiently [groupBy:: user-and-role-management] [priority:: 2]
- [ ] US-004 Revoke a Wedding Planner's access - As an Administrator, I need to disable a Wedding Planner who is no longer part of the team so that they cannot reach the platform [groupBy:: user-and-role-management] [priority:: 3]
- [ ] US-005 Restore a Wedding Planner's access - As an Administrator, I need to give a Wedding Planner a new way to sign in so that they can regain access without self-service recovery [groupBy:: user-and-role-management] [priority:: 3]
- [ ] US-006 Confirm my identity to access the platform - As a Wedding Planner, I need to confirm who I am when I open the platform so that only I can reach my weddings [groupBy:: user-and-role-management] [priority:: 3]
- [ ] US-007 Keep my contact information current - As a Wedding Planner, I need to update my full name, email, and phone so that the Administrator can reach me when needed [groupBy:: user-and-role-management] [priority:: 2]
- [ ] US-008 Oversee the Wedding Planners I onboarded - As an Administrator, I need visibility into the Wedding Planners I have onboarded so that I can supervise their activity [groupBy:: user-and-role-management] [priority:: 2]

## Wedding Management

- [ ] US-009 Register a new wedding - As a Wedding Planner, I need to register a new wedding with the couple's names and date so that I have a canonical place to attach every other planning task [groupBy:: wedding-management] [priority:: 3]
- [ ] US-010 Update a wedding's basic details - As a Wedding Planner, I need to correct or update the couple's names and date on a wedding so that the data stays accurate [groupBy:: wedding-management] [priority:: 3]
- [ ] US-011 Find a specific wedding quickly - As a Wedding Planner, I need to search and filter my weddings so that I can pick the one I need without scrolling [groupBy:: wedding-management] [priority:: 2]
- [ ] US-012 Distinguish past and upcoming weddings - As a Wedding Planner, I need to see which weddings are upcoming, past, or archived so that I can prioritize my work [groupBy:: wedding-management] [priority:: 2]
- [ ] US-013 Archive a wedding that has already happened - As a Wedding Planner, I need to mark a wedding as archived so that it no longer clutters my active list [groupBy:: wedding-management] [priority:: 2]
- [ ] US-014 Oversee weddings across the WPs I onboarded - As an Administrator, I need visibility into the weddings run by the Wedding Planners I onboarded so that I can supervise their work [groupBy:: wedding-management] [priority:: 2]

## Guest List Management

- [ ] US-015 Add a guest to a wedding - As a Wedding Planner, I need to add a guest to a wedding so that they can be invited and tracked [groupBy:: guest-list-management] [priority:: 3]
- [ ] US-016 Update a guest's information - As a Wedding Planner, I need to correct or update a guest's information so that the guest list stays accurate [groupBy:: guest-list-management] [priority:: 3]
- [ ] US-017 Remove a guest from a wedding - As a Wedding Planner, I need to remove a guest who should no longer be invited so that they don't appear on the list or receive a link [groupBy:: guest-list-management] [priority:: 3]
- [ ] US-018 Track each guest's attendance status - As a Wedding Planner, I need to mark each guest as confirmed, declined, or pending so that I know who is coming [groupBy:: guest-list-management] [priority:: 3]
- [ ] US-019 Reach each guest with a personal invitation link - As a Wedding Planner, I need a unique invitation link per guest so that I can hand it out manually [groupBy:: guest-list-management] [priority:: 3]
- [ ] US-020 Move the guest list in and out of the platform - As a Wedding Planner, I need to import a guest list from a file and export it back so that I can share it with vendors and keep historical records [groupBy:: guest-list-management] [priority:: 1]
- [ ] US-021 See guest list metrics per wedding - As an Administrator, I need to see guest counts and attendance rates per wedding so that I can monitor operations [groupBy:: guest-list-management] [priority:: 1]

## Online Invitation

- [ ] US-022 Make wedding details available to invited guests - As a Wedding Planner, I need to publish an invitation for a wedding so that invited guests can see everything they need to attend [groupBy:: online-invitation] [priority:: 3]
- [ ] US-023 Preview the invitation before publishing - As a Wedding Planner, I need to see how the invitation looks with the current wedding data so that I can confirm it is ready to share [groupBy:: online-invitation] [priority:: 2]
- [ ] US-024 Keep the published invitation in sync with my edits - As a Wedding Planner, I need changes to wedding data to be reflected on the published invitation so that guests see accurate information [groupBy:: online-invitation] [priority:: 2]
- [ ] US-025 View my personal invitation on a big screen - As an Invited Guest, I need to open my personal invitation link on PC or tablet so that I can read all wedding details comfortably [groupBy:: online-invitation] [priority:: 3]
- [ ] US-026 Confirm my attendance through my invitation - As an Invited Guest, I need to submit my RSVP through my invitation link so that my response is recorded against my record [groupBy:: online-invitation] [priority:: 3]
- [ ] US-027 Contribute photos to the wedding album - As an Invited Guest, I need to upload photos from the event to the invitation's album so that my memories are shared with the couple [groupBy:: online-invitation] [priority:: 2]
- [ ] US-028 Moderate photos contributed by guests - As a Wedding Planner, I need to review and approve photos uploaded by guests so that inappropriate content is not published [groupBy:: online-invitation] [priority:: 3]
- [ ] US-029 See invitation status and RSVP progress - As an Administrator, I need to see which weddings have a published invitation and how RSVPs are progressing so that I can monitor engagement [groupBy:: online-invitation] [priority:: 1]

## Photo Storage (Official)

- [ ] US-030 Configure photo storage for a wedding - As a Wedding Planner, I need to enable photo storage and choose the upload quality for a wedding so that storage costs are predictable [groupBy:: photo-storage] [priority:: 3]
- [ ] US-031 Upload the official photos for a wedding - As a Wedding Planner, I need to upload the official photos of the event so that they are stored in one place [groupBy:: photo-storage] [priority:: 3]
- [ ] US-032 Be warned before hitting the photo cap - As a Wedding Planner, I need a warning when the photo count approaches the 200-photo cap so that I can plan accordingly [groupBy:: photo-storage] [priority:: 1]
- [ ] US-033 Download all photos for USB delivery - As a Wedding Planner, I need to download all the photos of a wedding as a single archive so that I can deliver them to the couple [groupBy:: photo-storage] [priority:: 3]
- [ ] US-034 Give the couple a way to share their own photos - As a Wedding Planner, I need to share a link with the couple where they can upload their own photos so that the album reflects both sides [groupBy:: photo-storage] [priority:: 3]
- [ ] US-035 Upload photos through the shared link - As a Couple, I need to upload photos through the link the Wedding Planner shares with me so that my photos are included in the album [groupBy:: photo-storage] [priority:: 3]
- [ ] US-036 Know when photos will be automatically deleted - As a Wedding Planner, I need to see when the photos of a wedding will be automatically deleted so that I can deliver them on time [groupBy:: photo-storage] [priority:: 2]
- [ ] US-037 Monitor photo storage usage per wedding - As an Administrator, I need to see per-wedding photo count and chosen quality tier so that I can monitor operational cost [groupBy:: photo-storage] [priority:: 1]

## Cross-Cutting — Bilingual UI

- [ ] US-038 See the platform in my preferred language - As any user, I need the interface to display in my preferred language so that I can use the platform comfortably [groupBy:: platform] [priority:: 3]

## Architecture — Repository & Tooling

> Technical tasks derived from the architecture document and ADRs. Not user stories — these enable the development team to start coding.

- [X] ARC-001 Bootstrap monorepo with pnpm workspaces - Initialize the `wendy-planner` monorepo with `apps/api`, `apps/web`, and `packages/contracts` workspaces, shared `tsconfig.base.json`, ESLint, and Prettier configs. Per ADR-12. [groupBy:: arq] [priority:: 3] [completion:: 2026-08-12]
- [X] ARC-002 Enforce ESLint boundary rules - Configure ESLint to prevent cross-app imports (`apps/api` ⇄ `apps/web`) and ensure `packages/*` never imports from `apps/*`. CI fails on violation. Per ADR-12. [groupBy:: arq] [priority:: 2] [completion:: 2026-08-12]
- [X] ARC-003 Bootstrap NestJS API skeleton with module layout - Generate `apps/api` with the bounded-context folder structure (identity, weddings, guests, invitation, photos, audit) and the cross-cutting `shared/` folder (guards/interceptors/errors/events) per ADR-09 and the backend blueprint §3. Include `app.module.ts`, `main.ts`, typed config (ADR-16), and a health-check module. [groupBy:: arq] [priority:: 3] [completion:: 2026-08-12]
- [ ] ARC-004 Bootstrap Vite + React Web skeleton - Generate `apps/web` with route groups `(dashboard)` and `(public)` (TanStack Router), i18n directory, and a placeholder layout. Per ADR-02 v2. No Node.js runtime, static build only. [groupBy:: arq] [priority:: 3]
- [ ] ARC-005 Bootstrap `@wendy/contracts` package - Create `packages/contracts` with `tsconfig.json` (`experimentalDecorators`, `emitDecoratorMetadata`), branded NanoId types module, and a `fe-adapter` exporting `classValidatorResolver` for React Hook Form. Per ADR-13 and ADR-14. [groupBy:: arq] [priority:: 3]
- [ ] ARC-006 Configure shared typed-config classes - Set up ADR-16 typed config classes (env-based, validated at boot) for API and Web. Each config module fails fast on invalid environment. [groupBy:: arq] [priority:: 2]
- [ ] ARC-007 Wire OpenAPI 3 generation - Install `@nestjs/swagger` in `apps/api` and document every controller endpoint using DTO classes from `@wendy/contracts`. Single source of truth for the API contract. [groupBy:: arq] [priority:: 2]

## Architecture — Data Layer

- [ ] ARC-008 Initialize Prisma schema and first migration - Define `schema.prisma` in `apps/api/prisma/` with models for users, weddings, guest groups, guests, RSVPs, photos, guest photos, and audit events. Every model carries `tenant_id`. Run `prisma migrate dev` for the initial migration. Per ADR-07 and ADR-11. [groupBy:: arq] [priority:: 3]
- [ ] ARC-009 Implement Prisma Migrate deploy pipeline - Add a one-shot ECS task that runs `prisma migrate deploy` before the API container starts; document in the backend blueprint. Per ADR-11. [groupBy:: arq] [priority:: 3]
- [ ] ARC-010 Seed initial Admin (`admin@wendy`) - Write the deploy-time seed script that creates the first Administrator with a generated random password, logs it to the deployer's terminal, and stores the bcrypt hash. The same password is permanent (no forced rotation). Per architecture §8.1 and ADR-05. [groupBy:: arq] [priority:: 3]
- [ ] ARC-011 Model WP ownership and Admin-as-WP dual role - Extend the `users` table with `onboarded_by_admin_id` (nullable FK) and a `roles` array column (or `is_admin` flag) to express that an Administrator can also be a Wedding Planner and that an Admin only sees WPs they onboarded. Update ADR-05 / ADR-07 or add a new ADR. Per audit M-6. [groupBy:: arq] [priority:: 2]
- [ ] ARC-012 Move contact fields to Guest Group - Re-model guest contact info (email, phone) to live at the `guest_groups` level, with the Guest rows referencing the group. Update DTOs in `@wendy/contracts`. Per audit L-4. [groupBy:: arq] [priority:: 2]

## Architecture — Identity & Access

- [ ] ARC-013 Implement JWT auth (RS256) + JWKS - Implement RS256 JWT issuance/verification with private key in Secrets Manager, public key served at `/.well-known/jwks.json`. 15-min access tokens, 7-day refresh tokens in `HttpOnly; Secure; SameSite=Lax` cookies. Per ADR-05 and audit H-1. [groupBy:: arq] [priority:: 3]
- [ ] ARC-014 Implement OIDC-style auth endpoints - Expose `/oauth/token`, `/oauth/refresh`, `/oauth/revoke`, `/oauth/userinfo`, `/oauth/logout`, `PUT /oauth/user/password`, and `/.well-known/wendy-configuration`. Per ADR-05 §Standards-aligned URLs. [groupBy:: arq] [priority:: 2]
- [ ] ARC-015 Implement passport-jwt strategy with RBAC guards - Wire `@nestjs/passport` + `passport-jwt` (ADR-15) with role-based guards (`Administrator`, `WeddingPlanner`) and tenant scoping at the repository level. [groupBy:: arq] [priority:: 3]
- [ ] ARC-016 Implement public-token strategy (invitations, photo-album) - Build a separate `PublicTokenStrategy` for `/api/v1/public/*` routes that validates a signed token's `aud` claim (`invitation`, `photo-album`, `guest-photos`) and `exp`. Per audit L-1: reuse the invitation token for guest photos (drop the separate `/g/` token) with `exp: event_date + 30d`. [groupBy:: arq] [priority:: 3]
- [ ] ARC-017 Implement WP onboarding endpoint - `POST /api/v1/wedding-planners` accepts Admin-entered password; bcrypt cost 12; response contains no password. Audit event `user.created` written in the same DB transaction. Per audit H-3 and architecture §6.1. [groupBy:: arq] [priority:: 3]
- [ ] ARC-018 Implement disable + password reset endpoints - `POST /api/v1/wedding-planners/{id}/disable` and `POST /api/v1/wedding-planners/{id}/reset-password`. Invalidate active sessions on reset. Audit events `user.disabled` and `password.reset` in the same DB transaction. [groupBy:: arq] [priority:: 3]

## Architecture — Wedding Management

- [ ] ARC-019 Implement Wedding bounded context - NestJS module with controller (CRUD + publish + archive), service, Prisma repository, and DTOs from `@wendy/contracts`. `tenant_id` enforced in every query. Statuses: `draft`, `published`, `archived`. [groupBy:: arq] [priority:: 3]
- [ ] ARC-020 Implement per-template payload (JSONB) - Store wedding-specific invitation data in `wedding_data.payload` (JSONB) keyed by module (`landing`, `story`, `location`, etc.). Each module's shape is a typed DTO in `@wendy/contracts`. Per architecture §6.2. [groupBy:: arq] [priority:: 3]
- [ ] ARC-021 Ensure S3 prefix provisioning on wedding creation - On wedding create, ensure the S3 prefix `s3://wp-photos-prod/{tenantId}/{weddingId}/` exists. Per architecture §6.2. [groupBy:: arq] [priority:: 2]

## Architecture — Guest Management

- [ ] ARC-022 Implement Guest bounded context - NestJS module: guest groups (CRUD), guests (CRUD), per-guest invitation-token minting (signed JWT `aud: 'invitation'`, `exp: event_date + 30d`). [groupBy:: arq] [priority:: 3]
- [ ] ARC-023 Implement attendance-status state machine - Guest status transitions: `Pending` → `Confirmed` (link click) | `Declined` (WP manual). WP can override at any time. Idempotent re-submission returns 200 with a flag, not 409. Per audit L-5. [groupBy:: arq] [priority:: 3]
- [ ] ARC-024 Implement CSV import/export for guest lists - `POST /api/v1/weddings/{id}/guests/bulk` with conflict-resolution strategy (skip duplicates with a report). `GET /api/v1/weddings/{id}/guests/export` returns CSV including the per-guest invitation URL column. [groupBy:: arq] [priority:: 1]

## Architecture — Invitation

- [ ] ARC-025 Implement Invitation bounded context - Public routes: `GET /api/v1/public/invitations/{token}` returns invitation payload + guest context; `POST /api/v1/public/invitations/{token}/rsvp` records the RSVP (Confirmed only from the link). [groupBy:: arq] [priority:: 3]
- [ ] ARC-026 Implement 6 invitation templates - Ship 6 fixed template renderers consumed by the `(public)` route group on the Web App. Each template is parameterized by `wedding_data.payload` and only renders `Approved` guest photos. [groupBy:: arq] [priority:: 3]
- [ ] ARC-027 Implement Guest Photo moderation flow - `GuestPhoto` states: `Pending` (created on upload, NOT visible publicly) → `Approved` (renders on invitation) | `Rejected` (S3 object deleted, DB row kept for audit). Per audit M-4 and architecture §6.6. [groupBy:: arq] [priority:: 3]
- [ ] ARC-028 Implement WP moderation queue + approve/reject endpoints - `GET /api/v1/weddings/{id}/guest-photos?status=Pending` returns pending photos with short-lived signed GET URLs. `POST /api/v1/guest-photos/{id}/approve` and `POST /api/v1/guest-photos/{id}/reject`. Audit events `guest_photo.approved` / `guest_photo.rejected`. [groupBy:: arq] [priority:: 3]
- [ ] ARC-029 Implement guest-photo upload caps enforcement - Per-guest cap (20 photos, 5 MB, JPG/PNG/GIF) and per-wedding cap enforced at presign time. Rejected uploads consume a slot (anti-spam). Per TC-10 and audit M-4. [groupBy:: arq] [priority:: 3]

## Architecture — Photo Storage

- [ ] ARC-030 Implement Photo Storage bounded context - `POST /api/v1/weddings/{id}/photos/presign` (official, WP) and `POST /api/v1/public/photo-album/{token}/presign` (couple). Clients upload directly to S3 with presigned PUTs. Per architecture §6.5. [groupBy:: arq] [priority:: 3]
- [ ] ARC-031 Implement WP bulk archive download - `POST /api/v1/weddings/{id}/photos/download-archive` triggers an async zip job (Lambda or ECS one-shot) that produces a single archive; the WP gets a signed download URL. Per audit M-5 (kickoff says the WP downloads and delivers the USB). [groupBy:: arq] [priority:: 3]
- [ ] ARC-032 Decide and implement photo quality-tier enforcement - Pick one mechanism and document it: (a) client-side compression before PUT, (b) post-upload Lambda triggered by S3 events that transcodes, or (c) explicit "tier is a hint, not enforced" with PO sign-off. Per audit M-3 and FEAT-004 BR-02. [groupBy:: arq] [priority:: 2]
- [ ] ARC-033 State the official-upload size cap explicitly - Decide and document the per-file size limit for official photos (separate from the 5 MB guest cap in TC-10). Re-derive the per-wedding cost bound. Per audit L-8. [groupBy:: arq] [priority:: 3]
- [ ] ARC-034 Implement S3 Lifecycle Policy for photos - Tag uploaded objects with `event_date`; configure a Lifecycle rule per wedding prefix that expires objects at `event_date + 30d`. Document rule housekeeping (max 1,000 rules per bucket). Per ADR-06 and audit L-3. [groupBy:: arq] [priority:: 3]

## Architecture — Cross-Cutting

- [ ] ARC-035 Implement Validation Pipe with shared DTOs - Configure NestJS global `ValidationPipe` against DTOs from `@wendy/contracts`. The Web forms use the same DTOs via the `classValidatorResolver` adapter. Per ADR-14. [groupBy:: arq] [priority:: 3]
- [ ] ARC-036 Implement health checks (Terminus) - Expose `/health/live` (process is up) and `/health/ready` (DB reachable, S3 reachable, signing keys loaded) via `@nestjs/terminus`. ALB target group uses `/health/ready`. Per ADR-17. [groupBy:: arq] [priority:: 3]
- [ ] ARC-037 Implement Audit module - Subscribe to domain events on the in-process bus; write `audit_events` rows in the same DB transaction as the action for: `user.created`, `user.disabled`, `password.reset`, `wedding.published`, `wedding.archived`, `rsvp.submitted`, `guest_photo.approved`, `guest_photo.rejected`, `photo.downloaded`, `photos.deleted`. [groupBy:: arq] [priority:: 2]
- [ ] ARC-038 Implement i18n (i18next + Accept-Language detection) - Configure `i18next` with `en` (default) and `es` catalogs in `apps/web/src/i18n/locales/`. Auto-detect via `i18next-browser-languagedetector` from `Accept-Language`. Persist user override in a cookie. Per ADR-08. [groupBy:: arq] [priority:: 3]
- [ ] ARC-039 Wire Sentry across Web, API, and Lambda - Configure `@sentry/browser` (Web), `@sentry/node` (API, Lambda) with the API's `traceId` as a tag. Ensure no PII captured in breadcrumbs. [groupBy:: arq] [priority:: 2]
- [ ] ARC-040 Add data-protection & retention section - Document the applicable regulation stance (LFPDPPP / GDPR — confirm with Vineyards), non-photo data retention (retained indefinitely), guest PII deletion procedure (manual on request for MVP), and the PII inventory (RDS + S3 + Sentry). Per audit M-7. [groupBy:: arq] [priority:: 2]
- [ ] ARC-041 Add backup/DR paragraph to architecture §7 - State backup schedule (RDS automated + nightly export to S3), 7-day retention, RTO ≤ 4 h, RPO ≤ 1 h. Per audit L-6. [groupBy:: arq] [priority:: 2]
- [ ] ARC-042 Add monthly cost model to architecture §7 - NAT + ALB + RDS + Fargate + S3 + CloudFront + Secrets Manager → expected $85–150/month at MVP scale. Evaluate VPC endpoints vs. NAT. Per audit L-7. [groupBy:: arq] [priority:: 1]
- [ ] ARC-043 Decide and document CDN topology - Adopt one CloudFront distribution with `/api/*` behavior routed to the ALB origin; align ADR-10, §5.2, §7.1; document CORS/cookie policy. Per audit M-1. [groupBy:: arq] [priority:: 3]
- [ ] ARC-044 Author backend blueprint (`apps/api/BLUEPRINT.md`) - Coding conventions, folder layout per ADR-09, how to add a new bounded context, how to add a DTO, how to write a Prisma migration, how to write a controller. Per ADR-09 §Follow-up. [groupBy:: arq] [priority:: 2]
- [ ] ARC-045 Author frontend blueprint (`apps/web/BLUEPRINT.md`) - Coding conventions, route-group structure, form pattern (React Hook Form + classValidatorResolver), i18n usage, how to add a public route, how to add a dashboard page. Per ADR-02 v2. [groupBy:: arq] [priority:: 2]

## DevOps & Infrastructure

> Infrastructure, CI/CD, observability, and delivery-enablement tasks. Not user stories — these make the team able to ship reliably.

### AWS Foundation

- [ ] OPS-001 Provision AWS account and base networking - Create `wendy-planner-prod` account (or use existing), single region (`us-east-1`). Set up VPC `wendy-vpc` with public + private subnets across 2 AZs, NAT Gateway, route tables, and security groups. Per architecture §7.1 and ADR-04. [groupBy:: devops] [priority:: 3]
- [ ] OPS-002 Create IAM roles and policies - ECS task execution role, ECS task role (S3 + Secrets Manager + CloudWatch), Lambda execution role for the lifecycle sweeper, GitHub Actions OIDC role for CI/CD. [groupBy:: devops] [priority:: 3]
- [ ] OPS-003 Configure Route 53 hosted zone and ACM certificates - One hosted zone (`wendy.app` or TBD), ACM certs for the API and Web distributions with auto-renewal, DNS validation. [groupBy:: devops] [priority:: 3]
- [ ] OPS-004 Provision Secrets Manager entries - `db/credentials` (RDS master), `jwt/signing-keys` (RS256 keypair), `s3/access-keys` (upload/download service account), `secrets/admin-seed-password` (initial `admin@wendy` password). Manual rotation policy. [groupBy:: devops] [priority:: 3]

### Database

- [ ] OPS-005 Provision RDS PostgreSQL 15 instance - `db.t4g.micro`, 20 GB gp3, single-AZ for MVP (multi-AZ switch documented). Parameter group tuned for Prisma. Master credentials stored in Secrets Manager. [groupBy:: devops] [priority:: 3]
- [ ] OPS-006 Configure RDS automated backups + point-in-time recovery - 7-day retention, daily snapshots to S3. Verify RTO ≤ 4 h, RPO ≤ 1 h (per ARC-041). [groupBy:: devops] [priority:: 3]
- [ ] OPS-007 Wire Prisma Migrate deploy task - One-shot ECS task that runs `prisma migrate deploy` before the API service starts; documented in the backend runbook. [groupBy:: devops] [priority:: 3]

### Object Storage

- [ ] OPS-008 Provision S3 buckets - `wp-web-static-prod` (versioning off, public-read via CloudFront OAC), `wp-photos-prod` (versioning off, no public access, lifecycle enabled). Block all public access; access only via signed URLs or VPC origin. [groupBy:: devops] [priority:: 3]
- [ ] OPS-009 Configure S3 Lifecycle Policy - Per-prefix expiration at `event_date + 30d`; tag uploaded objects with `event_date` so the rule applies. Document rule-count housekeeping (max 1,000 rules/bucket). [groupBy:: devops] [priority:: 3]
- [ ] OPS-010 Enable S3 server access logging and CloudTrail data events on `wp-photos-prod` - For audit and forensics; logs delivered to a dedicated log bucket. [groupBy:: devops] [priority:: 2]

### Compute & CDN

- [ ] OPS-011 Provision ECS Fargate cluster and API service - Cluster `wendy-cluster`; service `api` (2 tasks, auto-scaling on CPU). Multi-stage Docker build (`apps/api/Dockerfile`); image pushed to ECR. ALB target group health-checks `/health/ready`. [groupBy:: devops] [priority:: 3]
- [ ] OPS-012 Provision Application Load Balancer (ALB) - Internal HTTP :80 in public subnets, ACM on CloudFront VPC origin, path rule `/api/*` → API target group. [groupBy:: devops] [priority:: 3]
- [ ] OPS-013 Provision CloudFront distribution(s) - One distribution with two origins (S3 static for `/`, ALB for `/api/*`). OAC for the S3 bucket. TLS via ACM. Cache static assets and short-lived signed photo downloads. [groupBy:: devops] [priority:: 3]
- [ ] OPS-014 Deploy static Web App - `vite build` outputs `dist/`; `aws s3 sync` to `wp-web-static-prod`; CloudFront invalidation on deploy. No Node.js runtime for the Web. [groupBy:: devops] [priority:: 3]

### Lifecycle Sweeper

- [ ] OPS-015 Deploy EventBridge + Lambda lifecycle sweeper - Daily 02:00 UTC; idempotent; scans weddings with `event_date < today - 30d` and deletes remaining S3 objects under the wedding prefix. Updates `photos_deleted_at`. CloudWatch Logs group for observability. [groupBy:: devops] [priority:: 2]

### Observability

- [ ] OPS-016 Configure CloudWatch Logs and log groups - `/ecs/api`, `/aws/lambda/lifecycle-sweeper`. Structured JSON. Retention: 30 days hot, 1 year cold (S3). [groupBy:: devops] [priority:: 2]
- [ ] OPS-017 Configure CloudWatch alarms - 5xx error rate > 1% over 5 min, ALB target unhealthy, RDS CPU > 70%, Fargate CPU > 80%, S3 4xx DELETE > 10/min. SNS topic for the delivery team. [groupBy:: devops] [priority:: 2]
- [ ] OPS-018 Wire Sentry DSNs into Web, API, Lambda - Sentry project per surface; `traceId` tag propagated from the API; ensure no PII captured in breadcrumbs. [groupBy:: devops] [priority:: 2]

### CI/CD

- [ ] OPS-019 Author CI workflow (`ci.yml`) - Per-app change detection (via `pnpm changed`); jobs: lint + typecheck + unit tests + build; required checks on PRs. [groupBy:: devops] [priority:: 3]
- [ ] OPS-020 Author Web deploy workflow (`deploy-web.yml`) - Triggered by `apps/web` or `packages/contracts` changes on main → `pnpm build` → `aws s3 sync` → CloudFront invalidation. [groupBy:: devops] [priority:: 3]
- [ ] OPS-021 Author API deploy workflow (`deploy-api.yml`) - Triggered by `apps/api` or `packages/contracts` changes on main → Docker build → ECR push → ECS rolling deploy. ECS runs the Prisma Migrate deploy task first. [groupBy:: devops] [priority:: 3]
- [ ] OPS-022 Author staging deploy workflow (`deploy-staging.yml`) - Same as prod but targets the staging account / cluster; used for dress rehearsal and pilot weddings before prod hardening. [groupBy:: devops] [priority:: 2]

### Local Development

- [ ] OPS-023 Author `docker-compose.yml` for local dev - Postgres 15, MinIO (S3 emulation), MailHog (future), Redis (future). One command (`pnpm dev`) brings up the full stack. Per architecture §7.2. [groupBy:: devops] [priority:: 3]
- [ ] OPS-024 Document the local dev setup - One section in the README: clone, `pnpm install`, `docker compose up -d`, `pnpm db:migrate`, `pnpm dev`. Verify a new dev is productive in < 30 min. Per ADR-12 follow-up. [groupBy:: devops] [priority:: 2]
- [ ] OPS-025 Provide a seed script for local dev - Generates a test `admin@wendy`, a couple of WPs, a couple of weddings with guests and RSVPs, and a few photos. Lets the FE dev render real screens without backend data entry. [groupBy:: devops] [priority:: 2]

### Cost & Hygiene

- [ ] OPS-026 Set up AWS Budgets + cost anomaly alerts - Monthly budget at the agreed cap (e.g. $200); alert at 80% and 100% via SNS. Tag every resource with `Project=wendy-planner`, `Env=dev|staging|prod`. [groupBy:: devops] [priority:: 1]
- [ ] OPS-027 Enable VPC endpoints for S3 and Secrets Manager - Avoid NAT data charges; evaluate endpoint cost vs. NAT cost at MVP scale. Per audit L-7. [groupBy:: devops] [priority:: 1]

### Operations

- [ ] OPS-028 Author the deployment runbook - Step-by-step first-time deploy, Prisma Migrate sequence, secret rotation, scaling events, and rollback procedure. Stored in `5-document-references/runbooks/`. [groupBy:: devops] [priority:: 2]
- [ ] OPS-029 Author the on-call runbook - Triage matrix (5xx → API, photo upload 4xx → S3 / token, login failures → auth), Sentry dashboard, CloudWatch dashboards, RDS console link, escalation contact. [groupBy:: devops] [priority:: 2]
- [ ] OPS-030 Author the backup/DR runbook - Snapshot restore procedure, RTO/RPO verification drill, RPO failure escalation path. Verify with the first quarterly test in week 12. [groupBy:: devops] [priority:: 2]