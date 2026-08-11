---
title: "Product Backlog"
date: 2026-08-10
type: management
scope: internal
version: 1.0.0
updated: 2026-08-10
---

# Product Backlog

This backlog is derived from the user journey maps in `2-product/2.1-discovery/2.1.4-customer-journey/`. It captures user needs only — technical tasks (architecture, devops, spikes) are added in later planning steps.

Story format: `{Short title} - As a [role], I need [action] so that [benefit}` followed by metadata tags.

## User & Role Management

- [ ] US-001 Onboard a new Wedding Planner - As an Administrator, I need to register a new Wedding Planner so that they can start working on weddings [groupBy:: user-and-role-management]
- [ ] US-002 Set the new Wedding Planner's initial access - As an Administrator, I need to set how the new Wedding Planner will sign in for the first time so that they can begin using the platform [groupBy:: user-and-role-management]
- [ ] US-003 Find any Wedding Planner I onboarded - As an Administrator, I need to search and locate any Wedding Planner I have onboarded so that I can manage their account efficiently [groupBy:: user-and-role-management]
- [ ] US-004 Revoke a Wedding Planner's access - As an Administrator, I need to disable a Wedding Planner who is no longer part of the team so that they cannot reach the platform [groupBy:: user-and-role-management]
- [ ] US-005 Restore a Wedding Planner's access - As an Administrator, I need to give a Wedding Planner a new way to sign in so that they can regain access without self-service recovery [groupBy:: user-and-role-management]
- [ ] US-006 Confirm my identity to access the platform - As a Wedding Planner, I need to confirm who I am when I open the platform so that only I can reach my weddings [groupBy:: user-and-role-management]
- [ ] US-007 Keep my contact information current - As a Wedding Planner, I need to update my full name, email, and phone so that the Administrator can reach me when needed [groupBy:: user-and-role-management]
- [ ] US-008 Oversee the Wedding Planners I onboarded - As an Administrator, I need visibility into the Wedding Planners I have onboarded so that I can supervise their activity [groupBy:: user-and-role-management]

## Wedding Management

- [ ] US-009 Register a new wedding - As a Wedding Planner, I need to register a new wedding with the couple's names and date so that I have a canonical place to attach every other planning task [groupBy:: wedding-management]
- [ ] US-010 Update a wedding's basic details - As a Wedding Planner, I need to correct or update the couple's names and date on a wedding so that the data stays accurate [groupBy:: wedding-management]
- [ ] US-011 Find a specific wedding quickly - As a Wedding Planner, I need to search and filter my weddings so that I can pick the one I need without scrolling [groupBy:: wedding-management]
- [ ] US-012 Distinguish past and upcoming weddings - As a Wedding Planner, I need to see which weddings are upcoming, past, or archived so that I can prioritize my work [groupBy:: wedding-management]
- [ ] US-013 Archive a wedding that has already happened - As a Wedding Planner, I need to mark a wedding as archived so that it no longer clutters my active list [groupBy:: wedding-management]
- [ ] US-014 Oversee weddings across the WPs I onboarded - As an Administrator, I need visibility into the weddings run by the Wedding Planners I onboarded so that I can supervise their work [groupBy:: wedding-management]

## Guest List Management

- [ ] US-015 Add a guest to a wedding - As a Wedding Planner, I need to add a guest to a wedding so that they can be invited and tracked [groupBy:: guest-list-management]
- [ ] US-016 Update a guest's information - As a Wedding Planner, I need to correct or update a guest's information so that the guest list stays accurate [groupBy:: guest-list-management]
- [ ] US-017 Remove a guest from a wedding - As a Wedding Planner, I need to remove a guest who should no longer be invited so that they don't appear on the list or receive a link [groupBy:: guest-list-management]
- [ ] US-018 Track each guest's attendance status - As a Wedding Planner, I need to mark each guest as confirmed, declined, or pending so that I know who is coming [groupBy:: guest-list-management]
- [ ] US-019 Reach each guest with a personal invitation link - As a Wedding Planner, I need a unique invitation link per guest so that I can hand it out manually [groupBy:: guest-list-management]
- [ ] US-020 Move the guest list in and out of the platform - As a Wedding Planner, I need to import a guest list from a file and export it back so that I can share it with vendors and keep historical records [groupBy:: guest-list-management]
- [ ] US-021 See guest list metrics per wedding - As an Administrator, I need to see guest counts and attendance rates per wedding so that I can monitor operations [groupBy:: guest-list-management]

## Online Invitation

- [ ] US-022 Make wedding details available to invited guests - As a Wedding Planner, I need to publish an invitation for a wedding so that invited guests can see everything they need to attend [groupBy:: online-invitation]
- [ ] US-023 Preview the invitation before publishing - As a Wedding Planner, I need to see how the invitation looks with the current wedding data so that I can confirm it is ready to share [groupBy:: online-invitation]
- [ ] US-024 Keep the published invitation in sync with my edits - As a Wedding Planner, I need changes to wedding data to be reflected on the published invitation so that guests see accurate information [groupBy:: online-invitation]
- [ ] US-025 View my personal invitation on a big screen - As an Invited Guest, I need to open my personal invitation link on PC or tablet so that I can read all wedding details comfortably [groupBy:: online-invitation]
- [ ] US-026 Confirm my attendance through my invitation - As an Invited Guest, I need to submit my RSVP through my invitation link so that my response is recorded against my record [groupBy:: online-invitation]
- [ ] US-027 Contribute photos to the wedding album - As an Invited Guest, I need to upload photos from the event to the invitation's album so that my memories are shared with the couple [groupBy:: online-invitation]
- [ ] US-028 Moderate photos contributed by guests - As a Wedding Planner, I need to review and approve photos uploaded by guests so that inappropriate content is not published [groupBy:: online-invitation]
- [ ] US-029 See invitation status and RSVP progress - As an Administrator, I need to see which weddings have a published invitation and how RSVPs are progressing so that I can monitor engagement [groupBy:: online-invitation]

## Photo Storage (Official)

- [ ] US-030 Configure photo storage for a wedding - As a Wedding Planner, I need to enable photo storage and choose the upload quality for a wedding so that storage costs are predictable [groupBy:: photo-storage]
- [ ] US-031 Upload the official photos for a wedding - As a Wedding Planner, I need to upload the official photos of the event so that they are stored in one place [groupBy:: photo-storage]
- [ ] US-032 Be warned before hitting the photo cap - As a Wedding Planner, I need a warning when the photo count approaches the 200-photo cap so that I can plan accordingly [groupBy:: photo-storage]
- [ ] US-033 Download all photos for USB delivery - As a Wedding Planner, I need to download all the photos of a wedding as a single archive so that I can deliver them to the couple [groupBy:: photo-storage]
- [ ] US-034 Give the couple a way to share their own photos - As a Wedding Planner, I need to share a link with the couple where they can upload their own photos so that the album reflects both sides [groupBy:: photo-storage]
- [ ] US-035 Upload photos through the shared link - As a Couple, I need to upload photos through the link the Wedding Planner shares with me so that my photos are included in the album [groupBy:: photo-storage]
- [ ] US-036 Know when photos will be automatically deleted - As a Wedding Planner, I need to see when the photos of a wedding will be automatically deleted so that I can deliver them on time [groupBy:: photo-storage]
- [ ] US-037 Monitor photo storage usage per wedding - As an Administrator, I need to see per-wedding photo count and chosen quality tier so that I can monitor operational cost [groupBy:: photo-storage]

## Cross-Cutting — Bilingual UI

- [ ] US-038 See the platform in my preferred language - As any user, I need the interface to display in my preferred language so that I can use the platform comfortably [groupBy:: platform]