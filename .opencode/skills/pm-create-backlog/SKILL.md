---
name: pm-create-backlog
description: "Creates or updates a product backlog by transforming user journey actions into user stories grouped by domain. Trigger: When user asks to create, write, generate, build, update, edit, or modify a product backlog or user stories list — or wants to transform journey maps into backlog items, extract stories from discovery documents, or structure the work as a list of user needs."
user-invocable: false
metadata:
    type: skill
    version: "1.1.0"
    updated-at: "2026-05-15"
---

# What is a Product Backlog

A product backlog is a flat list of **backlog items** that represents the total scope of work for a product. A backlog item is anything the team needs to do to move the product forward. Items can be of different types:

- **User story** — a user need expressed as a short title and a job story. The primary type during initial creation.
- **Technical task** — work needed to enable development: scaffolding, repository setup, infrastructure, architecture spikes.
- **Research task** — an investigation or spike needed to reduce uncertainty before committing to a solution.

The backlog is not a detailed specification — it is a tool to see the full picture of the work, grouped by domain, so the team can understand the size and shape of the project.

**Initial creation**: the process below creates only user stories, derived from user journey maps. Other item types are added in later stages by specialist agents (architect, devops).

**Adding to an existing backlog**: if the backlog already exists, ask the user which item type they want to add before proceeding. Then follow only the steps relevant to that type.

# Information Sources

When gathering context, search the workspace for documents by their purpose:

- User journey maps
- Analysis and discovery documents
- Product requirement documents (PRD)
- Project brief or README
- Kickoff documents

**Excluded sources**: Do not use raw audio transcripts or email threads. Only use processed interview notes or analysis documents derived from those sources.

# Process

## Step 0 — Initialize

Create the backlog file in the planning folder of the workspace using project naming conventions (date prefix, lowercase, hyphens).

The file must contain ONLY the front matter and the document title as H1. No content yet.

```yaml
---
title: "Product Backlog"
date: YYYY-MM-DD
type: specification
scope: internal
version: 1.0.0
updated: YYYY-MM-DD
---

# Product Backlog
```

## Step 1 — Read the Journey Maps

Search the workspace for all existing user journey maps. For each journey map found:

- Identify the domain it covers
- Extract every user action from the journey tables
- Note the actor performing each action

If no journey maps exist, ask the user before proceeding — the backlog must be grounded in journey actions, not invented from scratch.

## Step 2 — Transform Actions into Stories

> **Before writing stories**: Check if this project has a skill available that defines user story guidelines, format, and quality criteria. The format and quality rules for writing a well-formed user story are defined by the project's user story skill, if available.

For each user action extracted from the journey maps, write one story per real user need — not one per journey row. Related micro-actions can be combined. A journey action is an input, not a copy target: it describes what the user does, not what the user needs.

## Step 3 — Group by Domain and Review

Organize all stories by domain using the `groupBy` tag. Present the full list grouped by domain.

This grouping gives the team visibility into:
- Which domains have the most work
- Whether any domain seems underrepresented given what the journeys showed
- Whether the total scope feels right given the project constraints

## Step 4 — Verify Coverage

Go back to each journey map and verify that every user action has a corresponding backlog item.

For each journey table row, confirm a story exists that captures that action. Build a coverage check:

- If an action is covered → no action needed
- If an action was intentionally combined into a broader story → note which story covers it
- If an action has no corresponding story → add it or explicitly mark it as out of scope with a reason

This step ensures no user need falls through the gap between discovery and the backlog.

# Output Document

- The backlog follows the structure defined in the template:
- **Template**: See [assets/template.md](assets/template.md)
- Place the backlog in the planning folder of the workspace

# Backlog entry

The ID prefix determines how the story is counted in the dashboard:
- `US-` — User story, counted in the backlog progress bar
- `ARC-` — Architecture task, counted in the backlog progress bar
- `OPS-` — Operations task, counted in the backlog progress bar
- `SPIKE-` — Technical task, counted in the backlog progress bar
- `BUG-` — Bug, counted in the bug progress bar

### Metadata Tags

The following tags are added at the end of each story

| Tag | Dashboard column | Filter | Notes |
|-----|-----------------|--------|-------|
| `[groupBy:: domain]` | Domain | Domain | Groups stories by functional area |
| `[owner:: name]` | Owner | Owner | Responsible person or team |
| `[sprint:: identifier]` | Sprint | Sprint | e.g. `Sprint-1` |
| `[priority:: number]` | Priority | — | 1-5 (5=highest) |
| `[weight:: number]` | Weight or complexity | — | 1-5 (5=highest) |
| `[due:: YYYY-MM-DD]` | — | — | Due date, stored but not shown as a column |
