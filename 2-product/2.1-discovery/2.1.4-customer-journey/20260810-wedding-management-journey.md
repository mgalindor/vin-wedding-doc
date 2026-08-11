---
title: "Journey Map — Wedding Management"
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

# Journey Map — Wedding Management

## Actors

| Actor | Goal |
|---|---|
| Wedding Planner (WP) | Register and organize the weddings they handle so every other capability (guests, invitation, photos) has a place to attach. |
| Administrator | Oversee weddings across the WPs they have onboarded. |

## Journey — Wedding Planner

**Goal**: Register, edit, and organize the weddings they own.

### Register a new wedding

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Log in to Wendy Planner. | If credentials are forgotten, no self-service recovery. | Contact Admin to reset. |
| 2 | Open the weddings list. | Today the WP's weddings live in separate Excel files — no shared view. | None. |
| 3 | Click "New wedding". | No quick entry; depends on starting from a blank file. | None. |
| 4 | Enter couple names. | No guidance on naming conventions or character limits. | None. |
| 5 | Enter the wedding date. | No warning if the date is in the past. | None. |
| 6 | Save the new wedding. | Unclear if the wedding is now "active" or what the next step is. | None. |

### Edit wedding details

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the wedding from the list. | No search/filter on the weddings list. | None. |
| 2 | Update names or date. | No history of changes; no way to revert. | None. |
| 3 | Save changes. | If the invitation was already published, the live invitation may not reflect the update until republishing. | Manually republish the invitation. |

### List and view own weddings

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Open the dashboard or weddings list. | Past and future weddings are mixed — no status grouping. | None. |
| 2 | Search / filter by name or date. | Not available. | None. |
| 3 | Open a wedding to inspect its details. | No at-a-glance summary of guests, invitation, photos. | None. |

### Archive a past wedding

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Identify weddings whose date is in the past. | No automatic identification of past weddings. | WP reviews dates manually. |
| 2 | Archive the wedding. | No clear "archive" action in the current process. | The WP closes the Excel file and creates a "past" folder. |
| 3 | Confirm the archived wedding is hidden from the default list. | Archived weddings should still be reachable for history/audit but not in the active view. | None. |

## Journey — Administrator

**Goal**: Get visibility into the weddings run by the WPs they have onboarded.

| # | Action | Pain | Workaround |
|---|---|---|---|
| 1 | Log in as Administrator. | No aggregated view across all onboarded WPs. | Asks each WP separately. |
| 2 | Open the weddings overview. | Not available in MVP. | None. |
| 3 | Inspect a wedding to support an WP. | No drill-down view. | WP shares their screen or exports the data. |

## Opportunities

| # | Pain (from journey) | Opportunity | Source |
|---|---|---|---|
| 1 | No warning if the wedding date is in the past at creation. | Show a soft warning ("Date is in the past — confirm?") but allow save. | known |
| 2 | No search/filter on the weddings list. | Add a search field and date-range filter. | known |
| 3 | Past and future weddings are mixed. | Group weddings by status: Upcoming, Past, Archived. | known |
| 4 | No at-a-glance summary per wedding. | Show counts of guests, RSVP progress, photo count, and invitation status on the wedding card. | known |
| 5 | No history of changes on a wedding. | Record created/updated timestamps and last-edited user. | assumption |
| 6 | Admin has no aggregated weddings view across WPs. | Provide a read-only Admin view of weddings belonging to WPs they onboarded. | known |
| 7 | Editing a published wedding does not propagate to the live invitation. | Document the requirement: re-publish is required after edits, or show a clear "changes pending" indicator on the invitation. | known |
| 8 | No clear "next step" after creating a wedding. | Show a checklist (add guests → publish invitation → configure photos) on the wedding detail page. | assumption |