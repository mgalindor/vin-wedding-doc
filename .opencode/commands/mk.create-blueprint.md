---
name: mk.create-blueprint
description: "Create a Tier Blueprint for a specific application tier (backend, frontend, mobile, etc.). Guides the architect through discovering existing architecture docs, proposing a blueprint structure, and collaboratively refining it with the user."
agent: architect
metadata:
    type: prompt
    version: "1.0.0"
    updated-at: "2026-05-15"
---

The user wants to create a Tier Blueprint for the **$ARGUMENTS** tier.

If no tier was provided in `$ARGUMENTS`, ask the user which tier they want to create a blueprint for before continuing. Do not proceed without this information.

## Step 1 — Discover context
Search the workspace for:
1. Any existing architecture document
2. Any skill related to tier blueprints

## Step 2 — Propose & collaborate
Based on what you found, propose a blueprint outline for the requested tier.
Present the proposal clearly and ask the user if they agree or want to adjust before writing anything.

## Step 3 — Create the blueprint
Once the user approves, follow the blueprint skill instructions to create the document.

## Step 4 — Validate architecture impact
Review whether any decision made during blueprint creation alters or contradicts the existing architecture document.
If yes, propose the specific updates needed and ask the user for approval before applying them.
