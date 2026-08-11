---
name: pm-capture-feature
description: "Guides the process of capturing a raw feature idea Trigger: When user wants to capture a feature idea, decompose a feature into stories, interview a product person about a new capability, turn a business description into user stories, or asks 'how do we break down this feature?'."
user-invocable: false
metadata:
    version: "1.2.0"
---

Read the full document before start

# Critical Patterns

- A feature idea arrives as **informal business language** — do not force format on the person describing it.
- The goal of the interview is to reach enough clarity to decompose into stories — not to produce a specification.
- Every proposed story must express a **user need**, never a technical task or system behavior.
- Stories are grouped by actor and ordered from most foundational to most incremental.
- Scope exclusions are as important as inclusions — always state what is NOT part of the feature.
- When behavior varies by country, role, or plan — represent it explicitly in the story, not as duplicated stories.
- Never ask technical questions (stack, architecture, database) — only business and user-need questions.

# Process

1. Listen with attention to the user's description of the feature idea. Take notes on the dimensions above.
2. Answer with a summary to verify understanding, then ask the next question from the queue.
3. Start asking questions from the dimensions, but skip any that are already clear from context or the user's description.
4. Search existing stories or product analysis in product folder to understand current state and avoid duplicates before asking questions that may have already been answered.
5. Based on the answers, propose a set of user stories that capture the needs. Group and order them according to the rules. 
6. Create a document of the feature using the [template](./assets/template.md) in the feature folder
7. Ask the user to review the proposed stories, and adjust based on feedback.
8. Add a new section at the end of the backlog with the list of stories. Include the link to the feature document in the backlog for reference.

Very important: Move the attention on the functionality rather than the technical implementation. Focus on the "what" and "why" rather than the "how". The goal is to capture user needs and business value, not to design the system.

Very important: Do not include in the backlog duplicated stories, inform users if a story already exists that captures the same need and include  only new stories that capture needs not yet represented.


# Discovery Dimensions

Use these dimensions to guide the Q&A interview. Each dimension targets a type of ambiguity that changes how stories are written or split:

| Dimension | What to uncover |
|---|---|
| Problem & Trigger | What problem does this solve? What event causes the user to need this? |
| Affected Users | Which roles are involved? Who performs the action, who benefits? |
| Current Workaround | What do users do today without this? What is painful or broken? |
| Desired Outcome | What should be possible after this feature exists that isn't possible now? |
| Business Rules | Are there conditions, calculations, limits, or policies that govern the behavior? |
| Scope Boundary | What is explicitly NOT part of this feature right now? |
| Configuration & Variation | Does behavior vary by country, role, plan, or other dimension? |

**Interview constraints:**
- Maximum 7 questions per session.
- Present one question at a time — never reveal the full queue.
- Always offer a recommended or suggested answer with brief reasoning before asking the user to respond.
- Stop early when enough clarity exists to propose stories, or when the user signals completion.

# Story Decomposition Rules

After the interview, apply these rules to produce the story list:

1. **One need per story.** Each story must be independently deliverable and testable.
2. **No technical tasks as stories.** "Create the absence table" is not a story.
3. **Group by actor.** Stories with the same performing role go in the same group.
4. **Order by dependency.** The story that must exist before others comes first.
5. **Flag oversized stories.** If a story would clearly take more than one sprint alone, flag it for splitting.
6. **Scope note.** Always close with 1–3 bullets listing what was explicitly left out and why.

# Context Sources

Before interviewing, silently load context from:
- The product backlog — to understand existing patterns and avoid duplicates
- The project brief — to know the domain, users, and constraints
- Any existing user journey maps — to identify already-mapped user actions that may overlap

Use this context to skip questions that are already clear and to write better story proposals.

# Backlog entry

## Backlog Format

Backlog entries are captured as **task list items** using the following format:

```
- [ ] {id} {Short title — verb + object} - {user story} {tags}
```

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

### Example

```
## FEAT-001 — Calculation History

> Feature document: [20260717-calculation-history.md](../2.1-discovery/2.1.5-features/20260717-calculation-history.md)

- [ ] **US-01** Capture premium - As an internal operations user, I want each new insurance premium calculation to be automatically saved as a record, so I can refer back to past calculations. [priority:: 1] [owner:: Miguel Galindo] [sprint:: Sprint-1] [groupBy:: Calculation History]
- [ ] **US-02** Find premium - As an internal operations user, I want to view a paginated list of all saved premium calculations, so I can browse the full calculation history. [priority:: 1] [owner:: Miguel Galindo] [sprint:: Sprint-1] [groupBy:: Calculation History]
```