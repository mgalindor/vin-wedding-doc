---
title: "ADR-06 — Photo storage & lifecycle: S3 + Lifecycle Policy + Lambda sweeper"
id: adr-06
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 1.0.1
updated: 2026-08-11
---

# ADR-06 — Photo storage & lifecycle: S3 + Lifecycle Policy + Lambda sweeper

> **Revision history**
> - **v1.0.1 (2026-08-11):** Noted that guest uploads require WP moderation before public visibility (architecture TC-11), per the glossary and the kickoff's anti-abuse precondition (audit `20260811-architecture-audit.md`, finding M-4).
> - v1.0.0 (2026-08-10): Original decision.

## Context

Wendy Planner must:

- Store up to **200 photos per wedding** (TC-7).
- Support two quality tiers: **High** (original) and **Low** (compressed).
- Auto-delete photos **1 month after the event date** (TC-6).
- Support uploads from the WP (official photos) and from guests via a public link (max 5 MB per file, JPG/PNG/GIF, max 20 per guest). Guest uploads are subject to **WP moderation before public visibility** (architecture TC-11, scenario §6.6); rejected photos are deleted from the bucket.
- Serve downloads to the couple after the event.
- Stay cost-conscious (cost goal in §1.3).

## Options Considered

### Option A — S3 with Lifecycle Policy only

- **Pros**
  - **Cheapest mechanism** — S3 lifecycle rules cost nothing and run server-side.
  - Reliable; managed by AWS.
- **Cons**
  - Relies on accurate `event_date` metadata at the time of upload.
  - If the wedding's `event_date` is changed in the DB, S3 will not retroactively adjust the expiry.
  - No application-level audit trail of "photos were deleted".

### Option B — Application-level scheduled job only

- **Pros**
  - Full control over the deletion logic.
  - Easy to update when the business rule changes.
- **Cons**
  - Requires always-on compute (Fargate task or EC2 instance).
  - Risk of missed runs if the task fails.
  - Higher cost.

### Option C — S3 Lifecycle Policy + Lambda safety-net sweeper — **Selected**

- **Pros**
  - **Defense in depth**: S3 is the primary mechanism (cheapest, most reliable); Lambda is the safety net (handles retroactive event-date changes and missed lifecycle transitions).
  - Lambda runs daily, sees all weddings whose `event_date + 30d` is in the past, and reconciles S3 with the DB.
  - The cost is negligible (sub-cent per month for a daily scan).
- **Cons**
  - Two mechanisms to understand and test.
  - Slight code duplication of the deletion logic.

### Sub-decision: upload pattern

- **Direct-to-S3 via presigned URLs** (the client uploads directly to S3 with a URL the API signs).
  - Pros: the API does not stream multipart uploads, reducing API memory and time.
  - Cons: we must validate the object after upload (head request or S3 event).

## Decision

**Adopt AWS S3 as the object store, with two complementary deletion mechanisms:**

1. **Primary:** S3 Lifecycle Policy with an object tag `event_date=YYYY-MM-DD` and `Expiration` set to `event_date + 30d`. Tags are applied at upload time by the API.
2. **Safety net:** a daily Lambda (`lifecycle-sweeper`) triggered by EventBridge at 02:00 UTC. The Lambda:
   - Queries the DB for weddings where `event_date < today - 30d` and `photos_deleted_at IS NULL`.
   - For each, lists and deletes all objects under the prefix `s3://wp-photos-prod/{tenantId}/{weddingId}/`.
   - Updates `photos_deleted_at` on the wedding row.

**Bucket configuration:**

- Name: `wp-photos-prod`.
- Versioning: **off** (the lifecycle is the only deletion mechanism we want).
- Encryption: SSE-S3.
- Public access: **blocked** at the bucket level. All access via CloudFront signed URLs (for downloads) and presigned PUT URLs (for uploads).
- Lifecycle rule: scope limited to objects with the `event_date` tag.

**Upload flow (both official and guest uploads):**

1. Client requests a presigned URL from the API: `POST /photos/presign` with `{ weddingId, contentType, size }`.
2. API validates quota (≤ 200 photos; ≤ 5 MB per file for guests), generates a presigned PUT URL with the appropriate `event_date` tag, returns it.
3. Client uploads directly to S3.
4. Client notifies the API: `POST /photos` with `{ objectKey, qualityTier }`. API writes the photo row to the DB and tags the object if not already tagged.

**Quality tier definition:**

- **High:** original file as uploaded (within the 5 MB cap; clients can upload higher resolutions, but the API will compress to a reasonable upper bound for cost control — e.g. max 4096 px on the long edge).
- **Low:** compressed to ~70% JPEG quality, max 1920 px on the long edge (similar to WhatsApp sharing).

## Consequences

### Positive

- The cost of a wedding is bounded: 200 photos × 5 MB ≈ 1 GB max; with auto-deletion, the bucket stays small.
- Two layers of enforcement make the "1-month deletion" requirement robust.
- Direct-to-S3 uploads keep the API simple and responsive.

### Negative / Trade-offs

- The quality tier is decided per-wedding at upload time and applied per object — there is no in-place transcoding in MVP. If the WP chooses "High" and the couple later wants smaller files, the photos must be re-uploaded or a transcoding job added later.
- We accept the cost of running the Lambda daily (negligible) in exchange for the safety net.

### Follow-up actions

- [ ] Create the S3 bucket with the lifecycle policy and public access block [owner:: tech-lead] [priority:: high]
- [ ] Implement the presigned-URL flow in the API [owner:: backend] [priority:: high]
- [ ] Implement the Lambda lifecycle sweeper and the EventBridge schedule [owner:: backend] [priority:: high]
- [ ] Integration test: end-to-end "upload → wait → confirm deletion" with a synthetic wedding whose `event_date` is 31 days in the past [owner:: backend] [priority:: high]

### Revisit when

- The per-wedding photo cap grows beyond 200.
- In-place transcoding becomes a requirement.
- Multi-region storage is needed for cross-region disaster recovery.
