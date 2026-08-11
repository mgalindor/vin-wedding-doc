---
title: "Journey Map — Photo Storage (Official)"
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

# Journey Map — Photo Storage (Official)

## Actors

| Actor | Goal |
|---|---|
| Wedding Planner (WP) | Upload, manage, and deliver the official photos of a wedding via a bounded storage space. |
| Couple (end recipient) | Receive the official photos on USB after the event, and optionally contribute their own photos during/after the event. |
| Administrator | Monitor storage usage and the cost impact of the quality configuration. |

## Journey — Wedding Planner

**Goal**: Configure, populate, and deliver the official photo library per wedding.

### Configure photo storage on a wedding

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the target wedding. | Same as other journeys — no quick navigation. | None. |
| 2 | Open the Photos tab. | Today each WP uses personal cloud drives with no cost control. | None. |
| 3 | Enable/disable photo storage for this wedding. | Default is undefined — risk of leaving storage off by mistake. | None. |
| 4 | Choose upload quality (High / Low). | No estimate of the cost per wedding for each tier. | None. |
| 5 | Save the configuration. | No confirmation of the chosen tier's effective size limit. | None. |

### Upload official photos

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the Photos tab of a wedding. | No drag-and-drop UX today. | None. |
| 2 | Drag and drop or select files. | Errors (oversize, unsupported format) are silent. | None. |
| 3 | Watch the count approach the 200-photo cap. | No warning at 80% or 100% of the cap. | None. |
| 4 | Attempt to upload beyond the cap. | Upload rejected with no partial state — but no list of what failed. | None. |

### Download all photos as archive

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the Photos tab. | None in MVP. | None. |
| 2 | Click "Download all" and wait for the archive. | Long waits for big archives; no progress indicator. | None. |
| 3 | Receive the archive and prepare the USB. | No checksum or verification step. | Manual check. |

### Share couple upload link

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the Photos tab. | None. | None. |
| 2 | Copy the couple's upload link. | No way to rotate the link if leaked. | None. |
| 3 | Send the link to the couple out-of-band. | Same hand-off issue as guest links. | None. |

## Journey — Couple

**Goal**: Receive the official photos and contribute their own.

### Receive photos on USB

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Receive the USB from the WP. | No confirmation that the archive contains all photos. | None. |
| 2 | View the photos on a personal device. | None in MVP. | None. |

### Couple uploads photos via shared link

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Receive the shared link from the WP. | Same handoff pain as guest links. | None. |
| 2 | Open the link. | Same — no mobile-first experience. | None. |
| 3 | Drag and drop photos to upload. | Same upload error UX issues as the official upload. | None. |
| 4 | See the photos in the album. | Couple can only view and upload — no other actions. | None. |

## Journey — Administrator

**Goal**: Monitor storage cost and operational risk.

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the platform overview. | No aggregated storage usage today. | None. |
| 2 | Inspect per-wedding photo counts and storage tier. | Not available. | Asks each WP. |

## Opportunities

| # | Pain (from journey) | Opportunity | Source |
|---|---|---|---|
| 1 | No estimate of the cost per wedding for High vs Low quality. | Show an estimated storage size and monthly cost based on the chosen tier and current count. | known |
| 2 | Upload errors are silent. | Surface explicit error messages for size, format, and per-wedding count limits. | known |
| 3 | No warning near the 200-photo cap. | Show a progress bar and warn at 80% of the cap. | assumption |
| 4 | No progress indicator for archive download. | Show download progress and a final checksum. | assumption |
| 5 | No way to rotate the couple link. | Add a "regenerate link" action; old link stops working immediately. | assumption |
| 6 | Couple has no confirmation that the USB archive is complete. | Provide a per-wedding photo count comparison (server vs USB) on the WP's Photos tab. | assumption |
| 7 | No aggregated storage view for Admin. | Surface per-wedding photo count, tier, and estimated storage cost in the Admin overview. | known |
| 8 | Default for "enable photo storage" is undefined. | Default to enabled, with a one-click toggle to disable per wedding. | assumption |
| 9 | Couples cannot view photos in the platform (only on USB). | Optionally allow the couple link to also display the official photos, in addition to uploading. | assumption |
| 10 | Auto-deletion +1 month after event is invisible to the WP. | Show the scheduled deletion date on the Photos tab and warn the WP 7 days before deletion. | known |