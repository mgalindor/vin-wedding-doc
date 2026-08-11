---
name: arq-create-decision-record
description: "Creates a Decision Record (DR) document capturing any significant project decision — architectural, business, process, or team behavior — along with its context, options considered, rationale, and consequences. Trigger: When user asks to create, write, log, register, or document a decision — or wants to capture why a choice was made, track a project decision, record an architectural trade-off, document a team agreement, justify a business call, or structure a decision that was taken or is being considered. Also triggers when user asks 'how should we document this decision?' or 'let's record this choice'."
user-invocable: false
metadata:
    type: skill
    version: "1.0.0"
    updated-at: "2026-05-15"
---

# Critical Patterns

## Scope: Not just architecture

Decision Records cover **any significant project decision**, including:

| Category | Examples |
|---|---|
| Architecture | Framework selection, database choice, API style, deployment model |
| Business | Pricing model, feature prioritization, go-to-market scope |
| Process | Branching strategy, release cadence, code review policy |
| Team behavior | Ways of working, communication norms, on-call agreements |
| Technology | Third-party service adoption, library inclusion, deprecation |
| Product | UX patterns, accessibility standards, supported platforms |

## When a decision deserves a DR

Create a DR when one or more of the following apply:
- The decision is **costly to reverse** or has long-term implications
- **Multiple viable alternatives** existed and one was chosen
- Team members may **question or re-debate** the choice in the future
- The decision involves a **trade-off** between competing concerns
- **Stakeholder input or advice** was gathered before deciding
- The decision **supersedes or modifies** a previous decision

**Do NOT create a DR for:** trivial choices, purely implementation details with no meaningful alternatives, or decisions that are easily reversible with no significant impact.
Warn the user when they attempt to create a DR for a decision that does not meet these criteria, and suggest alternative ways to capture the information (e.g., meeting notes, comments in code, or a simple log entry).

## Immutability rule

DRs are **immutable** once recorded:
- Never alter the original decision or context
- Add new information as addenda at the bottom
- When a decision is reversed or replaced, create a **new DR** with status `Superseded` and reference the original

## Status lifecycle

| Status | Meaning |
|---|---|
| `Draft` | Being written, not yet finalized |
| `Proposed` | Finalized and awaiting approval or team review |
| `Taken` | Decision has been made and is in effect |
| `Superseded` | Replaced by a newer DR (include reference) |
| `Retired` | No longer applicable (context has changed) |

## File naming

- File name format: `YYYYMMDD-short-title.md`  
  Example: `20260317-db-engine.md`

## Considered Options table format

The comparison table in **Considered Options** uses rows as features/criteria and columns as options.  
Use ✅ for best or positive, ❌ for worst or negative, and ⚠️ for neutral or partial.  
This makes trade-offs scannable at a glance.

## Advice Process

The **Advice** section implements the [Advice Process](https://corporate-rebels.com/advice-process/):  
Before taking a decision, the decision-maker gathers input from those who will be affected and those with expertise — without requiring consensus. Record all advice given here.

# Guidelines

- Place DRs in the decision records folder (see workspace organization for the correct path)
- One DR per decision — do not bundle multiple decisions in a single document
- Front-matter fields follow workspace conventions: `title`, `date`, `type: decision-record`, `scope`, `author`, `status`
- Link related DRs (predecessor, successor, or related decisions) in the **Consequences** section
- Keep the **Decision** section short (2–4 sentences) — the rationale lives in **Justification**
- During architecture work, significant technology decisions documented as DRs should also be referenced from the solution strategy section of the architecture document

# Document

- **Template**: See [assets/template.md](assets/template.md) for the Decision Record template

# Verification

- **Checklist**: See [assets/checklist.md](assets/checklist.md) for verification checklist
