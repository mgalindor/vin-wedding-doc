---
name: pm-create-functional-spec
description: "Applies when writing or generating a functional specification for a user story, or elaborating and refining a backlog item into a story spec."
user-invocable: false
metadata:
    type: skill
    version: "2.0.0"
    updated-at: "2026-07-29"
---

# What is a Functional Specification

A functional specification is the **authoritative document** that defines what must be built for a user story and how to validate it. It bridges the user need (expressed in one line in the backlog) and the team that will design, build, and test it.

**Very important**: Focus on WHAT users need and WHY

# Output Document

- **Template**: See [assets/template.md](assets/template.md)
- **Naming**: `functional-spec.md` in the story's specification folder
- **Location**: Find the workspace location folder convention

## Document Lifecycle

The specification has a lifecycle — understand it to write and use it correctly:

| Status | Meaning |
|---|---|
| `draft` | Created from workspace context. Contains known facts, inferred proposals, and open questions. Used to initiate the refinement conversation with functional experts, UX/UI, QA, and technical stakeholders. |
| `refined` | Updated after the refinement session. All ⚠️ assumptions resolved. Rules and criteria agreed by the team. Ready to be used as the implementation reference. |
| `approved` | Validated by the product owner. Developers and QA use this version as the source of truth during development and testing. |

The document starts as a draft and evolves. When it reaches `approved` status, it defines the rules that developers implement and QA validates. Changes after approval require explicit revision with the team.

## Scope

It is **NOT**:
- An architecture or design document — no data models, no technology decisions, no API contracts
- A wireframe description — no button labels, no field names, no screen layouts
- A fully exhaustive requirements catalog — edge cases are discovered progressively during refinement and development

It **IS**:
- **Need-focused** — Focused on behavior, describes the WHY and WHAT, never the HOW
- **Implementation-agnostic** — describes rules and expected outcomes, not technical steps. This preserves solution space for architects, developers, and UX/UI designers
- **The team's shared understanding** — when the team disagrees about a rule or scenario, the specification is updated to reflect the agreed truth

> **Critical**: Write in plain language. The primary audience in the draft phase is a product owner or functional expert, not a developer. Technical observations belong only in the Technical Notes section, kept at a high level and clearly sourced. The specification must not prescribe how the story is implemented — it must define what must be true when it is done.

# Process

## Step 1 — Identify the Story

Receive or locate the user story to specify:
- Accept the story ID and full text directly from the user, or
- Search the workspace backlog for the story by ID or short title

If the story cannot be found, ask the user to provide it before proceeding.

## Step 2 — Gather Context from the Workspace

Search the workspace for all documents related to the story's domain:
- Journey maps covering the same actor or domain
- Analysis and discovery documents
- Product requirement document (PRD) or project brief
- Decision records related to the domain

From these sources, extract:
- Pain points and workarounds the story addresses
- Opportunities already identified in journey maps
- Constraints or assumptions already flagged in discovery
- Related stories that may create dependencies

## Step 3 — Build the Draft

Build the specification using the template.
Do not use people names instead use roles
For each section:

- **User Story**: copy the story exactly as it appears in the backlog — do not paraphrase
- **Context**: short explanation of why this need exists. Less than 5 lines is enough. Mark anything inferred and not yet confirmed with `> ⚠️ Assumption`
- **Dependencies**: list backlog stories this story depends on or that depend on it. If none are obvious, say so explicitly — do not leave the section blank
- **Rules & Constraints**: propose rules derived from journey opportunities and known business constraints. Cover all three types:     
    - (1) invariants — what must always be true in the happy path; 
    - (2) edge cases — what happens when there is no data or an empty state; 
    - (3) error conditions — what happens when input is invalid or a limit is reached. Each rule is a statement of what must be true — not how it is implemented. Add an `Example:` sub-bullet only when the behavior is non-obvious. Mark uncertain rules with `> ⚠️ Assumption`. The story is considered done when all rules are satisfied.
- **User Experience Notes**: only include observable UI behaviors not captured in the rules — empty states, field defaults, validation feedback, navigation behavior. Do NOT propose architecture or implementation decisions — those belong in the tech spec.

## Step 4 — Create the Output

Create `functional-spec.md` using the template.

After creating the file, present a brief summary that distinguishes:
- What was inferred from existing workspace context
- What is marked as assumption and needs confirmation in the refinement session