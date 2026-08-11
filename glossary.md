---
title: Project Glossary
date: 2026-08-10
type: reference
scope: internal
version: 1.0.0
updated: 2026-08-10
---

# Glossary

This document defines the key terms and concepts used in the Wendy Planner documentation. It serves as a shared reference (ubiquitous language) to keep the Product Manager, architect, and development team aligned.

> Terms are listed alphabetically for easy navigation.

| Term | Definition |
| ------- | ---------- |
| Administrator | A user who can onboard Wedding Planners, supervise their activity, disable accounts, reset passwords, and act as a Wedding Planner themselves. Initial Admin is provisioned manually as `admin@wendy`. |
| Archive (a wedding) | The act of marking a wedding as no longer active so it stops appearing in the WP's primary list while remaining reachable for history and audit. |
| Attendance Status | One of three values assigned to a guest: **Confirmed**, **Declined**, or **Pending**. May be updated by the WP manually or by the guest via the invitation link. |
| Bilingual UI | The platform's ability to render the interface in English (default) or Spanish, with automatic detection from the browser's `Accept-Language` header. Architecture must allow more languages in the future. |
| Capture (end-to-end) | The MVP success metric: the full lifecycle of a wedding inside the platform — from WP onboarding, wedding creation, published invitation, RSVPs received, to post-event photo download. The MVP is validated by capturing **2 real weddings** end-to-end. |
| Couple | The end recipients of a wedding. They receive the official photos on USB. They may also receive a shared link from the WP to contribute their own photos to the official album. They do **not** have direct access to the Wendy Planner platform. |
| Dashboard | The first screen a user lands on after signing in. For a WP, it shows their weddings grouped by status. For an Admin, it shows the WPs they have onboarded. |
| Engagement Model | The staffing arrangement with Vineyards: open-ended, paid by time, no hard budget cap. MVP must ship within 3 months. |
| Guest | A person invited to a wedding. Always belongs to exactly one wedding. Has a unique, stable invitation link. |
| Guest Group | A logical grouping of guests (family, couple, single). Captured at the Guest Group level — side (Bride/Groom) and contact info (email/phone) live there so they apply to all members of the group. |
| Guest Photo Album | The photo section of the public invitation where invited guests can upload their own photos (max 20 per guest, max 5MB, JPG/PNG/GIF). WP moderation is required before publishing. |
| Invitation | The public-facing web page for a wedding, generated from one of 6 fixed templates. Accessed only through a guest's unique link. Includes the 14 modules listed in the kickoff. |
| Invitation Link | A unique URL that includes the guest's ID and grants access to the invitation for that specific guest. RSVPs submitted through this link are attributed to the guest's record. |
| Modular Monolith | The chosen architecture: a single deployable unit organized into modules by bounded context. Avoids microservices complexity for the 2-person team while keeping doors open for future scale. |
| MVP | Minimum Viable Product. The first releasable version of Wendy Planner. Validated by capturing 2 real weddings end-to-end. Scope is fixed: in-scope features ship, out-of-scope features are deferred. |
| Official Photo Storage | The dedicated storage space per wedding for the official photos managed by the WP and (optionally) the couple. Configurable quality (high/low). Hard cap of 200 photos. Auto-deleted 1 month after the event date. |
| Photo Album (shared with couple) | The WP-generated link the couple uses to upload their own photos to the official album. The couple can only view and upload through this link — no platform access. |
| Quality Tier | The compression/quality level chosen for official photos per wedding: **High** (original) or **Low** (compressed similar to WhatsApp). Choice impacts storage cost. |
| RSVP | A guest's response to their invitation. Submitted through the per-guest link. Currently a single "Confirm attendance" button; no structured fields or follow-up message. Cannot be edited by the guest. |
| Side | The family side a guest belongs to: **Bride** or **Groom**. Captured at the Guest Group level. |
| `tenant_id` | Database column present on every relevant table from day one to prepare the schema for multi-tenancy. Row-level isolation is **not** enforced in MVP. |
| User Credential Format | Usernames follow the convention `nombre@wendy` (e.g., `miguel@wendy`). Passwords are assigned by the Administrator at account creation. No self-service password recovery in MVP. |
| Vineyards | The client organization. Operates ~10 in-house Wedding Planners handling 4–10 weddings per year each. The driving business behind Wendy Planner. |
| Wendy Planner | The product name. A web application to standardize the wedding planning workflow currently handled manually with Excel. |
| Wedding | The central entity in the platform. Contains, at minimum, the couple's names and the wedding date. Every other capability (guests, invitation, photos) attaches to a wedding. |
| Wedding Planner (WP) | The primary operational user. Manages their own weddings and the data attached to them. Each WP is owned by exactly one Administrator (the one who onboarded them). An Administrator can also be a WP. |