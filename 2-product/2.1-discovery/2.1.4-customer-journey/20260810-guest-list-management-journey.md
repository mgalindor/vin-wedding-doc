---
title: "Journey Map — Guest List Management"
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

# Journey Map — Guest List Management

## Actors

| Actor | Goal |
|---|---|
| Wedding Planner (WP) | Build and maintain the canonical guest list for each wedding so invitations and RSVPs are correctly attributed. |
| Administrator | Get visibility into guest counts and attendance rates per wedding. |

## Journey — Wedding Planner

**Goal**: Maintain a complete and accurate guest list per wedding.

### Add a guest to a wedding

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the target wedding from the weddings list. | No quick navigation if many weddings exist. | None. |
| 2 | Open the Guests tab. | Not applicable in current Excel-based workflow. | None. |
| 3 | Click "Add guest". | No bulk add — one record at a time. | None. |
| 4 | Choose or create the Guest Group (family, couple, single). | No group concept in Excel — guests are listed as individuals. | None. |
| 5 | Enter first name, last name, side (Groom/Bride), contact (email/phone — optional but recommended). | Side and contact are not consistently captured today. | None. |
| 6 | Save the guest. | Need confirmation that the unique invitation link has been generated. | None. |
| 7 | Repeat steps 3–6 for every guest. | Time-consuming for 100+ guests. | None. |

### Edit a guest

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Locate the guest in the list. | No search/filter on the guest list. | Scroll or filter by export. |
| 2 | Open the guest detail. | Noisy layout if many guests. | None. |
| 3 | Update name, group, side, or contact. | If the guest has already RSVP'd via the invitation link, the WP is warned that editing may invalidate their RSVP. | Re-send the link out-of-band if needed. |
| 4 | Save changes. | Unclear if the invitation link changed. | None. |

### Delete a guest

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Locate the guest. | Same as edit — no search. | None. |
| 2 | Click "Delete". | No undo; the link stops working immediately. | None. |
| 3 | Confirm deletion. | Risk of accidental delete. | None. |

### Mark attendance status

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Locate the guest. | Same as edit — no search. | None. |
| 2 | Set status to Confirmed / Declined / Pending. | Today status is reconciled manually from WhatsApp/phone. | None. |
| 3 | Save changes. | No bulk update — must be done one by one. | None. |

### Generate per-guest invitation links

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | After adding a guest, copy the unique link. | No bulk copy/export of links. | None. |
| 2 | Deliver the link manually (chat, WhatsApp, email). | Today each WP keeps links in a side document. | None. |
| 3 | Track which guests have received their link. | No status flag for "link delivered". | None. |

### Import / export guest list as CSV

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the import/export controls. | Not available in current Excel workflow for handoff. | Manual copy-paste. |
| 2 | Export the current list as CSV. | No standard column mapping. | None. |
| 3 | Edit the CSV externally. | Risk of breaking the import format. | None. |
| 4 | Import the updated CSV. | Conflicts (duplicate guests) are not handled. | None. |

## Journey — Administrator

**Goal**: Monitor attendance across weddings.

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the weddings overview. | No aggregated metrics today. | None. |
| 2 | Inspect per-wedding guest counts and RSVP rates. | Not available. | Asks each WP. |

## Opportunities

| # | Pain (from journey) | Opportunity | Source |
|---|---|---|---|
| 1 | No bulk add for guests. | Allow CSV import of guests at creation time. | known |
| 2 | No search/filter on the guest list. | Provide a search field and side/group filters on the guest list. | known |
| 3 | Risk of accidental deletion with no undo. | Require explicit confirmation and surface a soft-delete / undo window before permanent removal. | known |
| 4 | No bulk attendance update. | Allow bulk set: "mark all pending guests as confirmed/declined". | known |
| 5 | No "link delivered" flag per guest. | Add a per-guest flag (or auto-detect first link open) to track distribution status. | assumption |
| 6 | No bulk copy of invitation links. | Provide a "Copy all links" button and a CSV export including the per-guest URL column. | known |
| 7 | No aggregated attendance metrics for Admin. | Surface per-wedding RSVP counts (confirmed / declined / pending) in the Admin view. | known |
| 8 | CSV import has no conflict resolution. | Define an import strategy: skip duplicates, replace, or fail with report. | assumption |
| 9 | Editing a guest who has RSVP'd may invalidate their RSVP. | Show a clear warning and capture the old/new link in the audit trail. | known |
| 10 | Group / side / contact not consistently captured today. | Make Guest Group required and Side required at creation; contact optional but recommended. | known |