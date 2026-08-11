---
name: pm-create-release-plan
description: "Creates or updates a release plan by grouping product backlog items into sprints, respecting sequencing dependencies and domain cohesion Trigger: When user asks to create, write, generate, build, update, edit, or modify a release plan, iteration plan, or sprint plan — or wants to group backlog items into delivery batches, schedule work into sprints, or plan how features will be released incrementally"
user-invocable: false
metadata:
    type: skill
    version: "1.0.0"
    updated-at: "2026-05-15"
---

# What is a Release Plan

A release plan groups backlog items into sprints — ordered batches of work that the team commits to delivering together. Each sprint produces a working, testable increment of the product.

The release plan answers: **in what order do we deliver the work, and what goes in each sprint?**

It does NOT assign items to specific people. The team owns the sprint goal collectively.

# Input

The release plan is built from the product backlog. For each item, it reads:

```
{id} {Short title — verb + object} [groupBy:: {domain}]
```

All backlog item types are included: user stories, technical tasks, and research tasks.

# Sequencing Rules

These rules govern the order of items across and within sprints. Apply them strictly:

**Dependency rule**: An item that depends on another must be placed in a later sprint than its dependency. You cannot deliver a search feature before the create feature exists. You cannot query data before it can be stored.

Common dependency patterns:
- Create → Read/Search/List (read operations require data to exist first)
- Create → Update → Delete (CRUD follows creation order)
- Infrastructure/scaffolding → any feature that runs on it
- Authentication/login → any feature that requires a logged-in user
- Data model → any feature that reads or writes that data

**Domain cohesion**: Group items from the same domain into the same or consecutive sprints when possible. A developer working in one domain builds context and momentum — switching domains mid-sprint has a cost.

**Risk-first**: Place high-risk or high-uncertainty items earlier. Discovering a problem in sprint 1 is cheap. Discovering it in sprint 5 is expensive.

**Must items before Should items**: Items tagged `[priority:: 3]` (Must) go before `[priority:: 2]` (Should), which go before `[priority:: 1]` (Could). Items tagged `[priority:: 0]` (Won't) are excluded from the plan.

**End-to-end slice over completeness**: Prefer sprints that deliver a thin working slice across domains over sprints that complete one domain fully. The goal of each sprint is a demonstrable increment, not a finished module.

# Process

## Step 0 — Validate Prerequisites

Before creating anything, verify that the two required inputs exist in the workspace.

**Required input 1 — Product Backlog**
Search the planning folder for the product backlog file. It must exist and contain at least one backlog item with a `[groupBy::]` tag.

**Required input 2 — Project Brief**
Search the workspace for the project brief or README. It must contain:
- Number of sprints available for the project
- Number of developers available

**If either input is missing or incomplete, stop immediately.** Do not create the release plan file. Instead, inform the user:

| Missing | Message |
|---|---|
| Product backlog not found | "The product backlog does not exist yet. Create it first" |
| Backlog exists but has no items | "The product backlog is empty. Add backlog items before creating a release plan." |
| Project brief not found | "The project brief does not exist yet. Create it first" |
| Sprint count not found in brief | "The project brief does not specify how many sprints are available. Add that information to the brief before proceeding." |
| Team size not found in brief | "The project brief does not specify how many developers are available. Add that information to the brief before proceeding." |

Only proceed to Step 1 when both inputs are confirmed present and complete.

## Step 1 — Initialize

Create the release plan file in the planning folder of the workspace using project naming conventions (date prefix, lowercase, hyphens).

The file must contain ONLY the front matter and the document title as H1. No content yet.

## Step 2 — Read the Backlog

Read the product backlog file from the planning folder. Extract every backlog item in this format:

```
{id} {Short title} [groupBy:: {domain}] [priority:: {value}]
```

Exclude items tagged `[priority:: 0]` (Won't). If no priority tags exist, include all items and note the absence.

Also read from the project brief: number of sprints available and number of developers. These are already validated in Step 0.

## Step 3 — Identify Dependencies

Before grouping into sprints, map the dependencies between backlog items.

For each item, ask: does this item require another item to be delivered first? Apply the dependency patterns from the Sequencing Rules above.

Build a simple dependency list:
```
{id} depends on {id}
```

If no explicit dependencies are found, note it — but always apply the CRUD pattern heuristic to items within the same domain.

## Step 4 — Group into Sprints

Assign each item to a sprint number. Apply the sequencing rules in this order:

1. Dependencies first — items with no dependencies are candidates for Sprint 1
2. Domain cohesion — keep same-domain items together when possible
3. Priority — Must items before Should before Could
4. Balance — distribute the load roughly evenly across sprints given the available developers

Each sprint should deliver a working, testable slice of the product — not a set of unrelated tasks.

## Step 5 — Review and Adjust

Present the draft release plan grouped by sprint. For each sprint, show:
- The sprint number
- The items included, with their domain tag
- The sprint goal — a one-sentence statement of what the team will be able to demonstrate at the end

Ask the user: does this order make sense? Are there dependencies or constraints not captured?

Adjust based on feedback before finalizing.

# Output Document

- **Template**: See [assets/template.md](assets/template.md)
- Place the release plan in the planning folder of the workspace
