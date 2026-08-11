---
title: "Specification: {short-title}"
date: {YYYY-MM-DD}
type: specification
scope: internal
story-id: "{story-id}"
status: draft  # draft | refined | approved
version: 1.0.0
updated: {YYYY-MM-DD}
---

# {short-title}

> **Status: Draft**

## User Story

<!-- Copy the story ID and one-liner exactly from the backlog -->

`{story-id}` {As a [role], I want to [action] so that [benefit]}

## Context

<!-- WHY this need exists — not HOW it will be solved. 2–4 short paragraphs. Plain language, no technical jargon. -->

{What problem or situation generates this need? What happens today without this capability?}

## Dependencies

<!-- Stories that must be completed before or after this one. Remove this table if there are no dependencies. -->

| Story | Type | Description |
|---|---|---|
| `{story-id}` {short-title} | Requires / Required by | {why this dependency exists} |

## Rules & Constraints

<!-- Define all system behaviors: happy path, edge cases, error conditions, and boundary states.
     Each rule answers one of these questions:
       - What must always be true? (invariant)
       - What happens when there is no data / empty state?
       - What happens when input is invalid or a limit is reached?
     Use declarative language — avoid "should" or "might".
     Add an Example: sub-bullet only when the behavior is non-obvious.
     Add ⚠️ Assumption for rules that need team confirmation.
     Every rule stated here is an acceptance condition — the story is done when all rules are satisfied. -->

- **Rule 1 — {name}**: {what must always be true — happy path behavior}
- **Rule 2 — {name}**: {edge case or error condition — what the system does when X is missing, invalid, or empty}
  - *Example: {concrete situation that makes the behavior unambiguous}*

> ⚠️ Assumption — {rule inferred from context, pending team confirmation}

## User Experience Notes

<!-- Optional — observable UI behaviors that are not captured in Rules & Constraints.
     Use this section for interactions visible to the user: empty states, field defaults,
     validation feedback, navigation behavior, and similar front-end expectations.
     Do NOT include architecture or implementation decisions — those belong in the tech spec.
     Examples of what belongs here:
       - What the user sees when a list or search returns no results.
       - Whether search or filter fields are pre-filled or blank when the screen loads.
       - Date range constraints (e.g. start date cannot be later than end date).
       - Confirmation messages, loading indicators, or disabled states. -->

- {Observable UI behavior or interaction expectation}