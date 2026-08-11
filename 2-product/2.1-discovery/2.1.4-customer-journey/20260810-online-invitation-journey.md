---
title: "Journey Map — Online Invitation"
date: 2026-08-10
type: analysis
scope: internal
version: 1.0.0
updated: 2026-08-10
work-style: yolo
progress:
  - step: initialize
    status: done
  - step: identify-actors-and-goals
    status: done
  - step: map-steps
    status: done
  - step: identify-opportunities
    status: done
---

# Journey Map — Online Invitation

## Actors

| Actor | Goal |
|---|---|
| Wedding Planner (WP) | Publish a polished invitation for a wedding and distribute unique links to guests. |
| Invited Guest | View their personal invitation on PC or tablet and confirm attendance. |
| Administrator | See which weddings have a published invitation and track RSVP progress. |

## Journey — Wedding Planner

**Goal**: Publish and operate the invitation.

### Publish an invitation

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the target wedding. | Same as Guest List — quick navigation not always trivial. | None. |
| 2 | Open the Invitation tab. | Today each WP uses external tools or static pages. | None. |
| 3 | Choose one of the 6 fixed templates. | No preview of how data fills the template before publishing. | None. |
| 4 | Verify the data pulled from FEAT-001 and FEAT-002 (names, date, story, location, dress code, gifts, contact). | Missing or wrong data is only visible after publishing. | None. |
| 5 | Publish the invitation. | No rollback if wrong template was chosen. | Republish with the right template. |
| 6 | Verify the published invitation opens correctly. | No automated link-check. | WP opens one guest link manually. |

### Update wedding data after publishing

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Edit the wedding data (names, date, location, etc.). | Changes do not automatically reflect on the live invitation. | Republish the invitation manually. |
| 2 | Confirm the live invitation shows the new data. | No indicator that the published version is stale. | None. |

## Journey — Invited Guest

**Goal**: View the invitation and confirm attendance.

### View invitation via per-guest link

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Receive the personal link (chat, WhatsApp, email — out of band). | Links are hand-delivered by the WP — risk of typos. | Couple relays the correct link to the WP. |
| 2 | Open the link on PC or tablet. | If the link is broken, the guest must contact the couple first. | Couple relays the issue to the WP. |
| 3 | See the wedding details, story, location, schedule, dress code, gifts, contact. | No mobile optimization in MVP — hard to read on phone. | Open on PC/tablet. |
| 4 | Browse the gallery and/or upload photos (album). | Upload limits (5MB, JPG/PNG/GIF, max 20 per guest) must be discovered via error messages. | None. |

### Submit RSVP via per-guest link

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Locate the RSVP section in the invitation. | No clear "RSVP" button placement guidance. | None. |
| 2 | Click "Confirm attendance". | No structured form — just a single button. | None. |
| 3 | See confirmation. | No follow-up email (out of scope in MVP). | None. |
| 4 | Try to change the response later. | Not allowed — the response is final. | Contact the couple, who asks the WP to update. |

### Upload photos to guest album

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the album section of the invitation. | May require scrolling through the invitation. | None. |
| 2 | Drag and drop one or more photos. | Files >5MB or unsupported formats are silently rejected. | Resize and re-upload. |
| 3 | Reach the 20-photo cap per guest. | Cap discovered only by trying to upload more. | None. |
| 4 | Wait for WP moderation. | No status indicator on whether the photo is approved. | None. |

## Journey — Wedding Planner

### Moderate guest-uploaded photos

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the moderation queue. | No clear inbox for pending photos. | None. |
| 2 | Review each photo (approve / reject). | No reason field for rejection. | None. |
| 3 | Publish approved photos to the gallery. | No batch action. | One by one. |

## Journey — Administrator

**Goal**: Oversee invitation status and RSVP progress.

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the weddings overview. | No aggregated "published?" indicator. | None. |
| 2 | Inspect per-wedding RSVP metrics. | Not available. | Asks each WP. |

## Opportunities

| # | Pain (from journey) | Opportunity | Source |
|---|---|---|---|
| 1 | No template preview before publishing. | Add a "Preview" button that renders the chosen template with the wedding's current data. | known |
| 2 | Editing wedding data does not reflect on the live invitation. | Surface a "Changes pending republish" indicator on the invitation tab. | known |
| 3 | Guest photo upload errors are silent. | Surface explicit error messages for size, format, and per-guest count limits. | known |
| 4 | No status indicator for moderation. | Show per-photo status (pending / approved / rejected) and a reason for rejection. | assumption |
| 5 | RSVP cannot be changed by the guest. | Document the operational rule and provide a WP-side override (mark declined/confirmed again). | known |
| 6 | No aggregated invitation status for Admin. | Surface per-wedding indicators: invitation published (Y/N), template used, RSVP counts. | known |
| 7 | Guest link hand-off via chat introduces typos. | Provide the WP with a "copy link" affordance per guest and a "copy all" bulk action. | known |
| 8 | Couple must relay support issues to the WP. | Document the support channel and expected response time in the platform runbook. | known |
| 9 | No batch moderation action. | Add "Approve all" and "Reject all" buttons to the moderation queue. | assumption |