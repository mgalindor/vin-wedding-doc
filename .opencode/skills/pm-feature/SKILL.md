---
name: pm-feature
description: "Defines what a feature, epic, or capability is (synonymous in this project). Trigger: When user asks what a feature, epic, or capability is — how to name them, how they differ from user stories, what level of granularity they represent, or needs to understand business capabilities"
user-invocable: false
metadata:
    type: skill
    version: "1.0.0"
    updated-at: "2026-05-15"
---

# What is a Feature

A feature is a **named business capability** that delivers observable value to a user or stakeholder. It describes *what the system enables someone to do* — not how it is built, and not a single step in a larger flow.

A feature is the natural unit at which a product person thinks about the product. It is too large to be a single user story, and too focused to be a domain or product area.

## Hierarchy

```
Product
  └── Domain (e.g., Vacation Management)
        └── Feature (e.g., Vacation Monetization)
              └── User Story (e.g., Record a monetization absence)
```

A feature typically decomposes into **3 to 8 user stories**. If fewer than 3, it may be a story itself. If more than 8, it may be two features bundled together.


## Naming a Feature

A good feature name is:
- **2–4 words**, noun phrase or verb + object
- Written from the **user's perspective**, not the system's
- Understood by a non-technical stakeholder without explanation

**Good names:** `Vacation Monetization`, `Absence Balance Configuration`, `Coordinator Access Control`  
**Bad names:** `Monetization Module`, `PATCH /vacations endpoint`, `Multi-country Support Layer`

## Feature vs. Epic vs. Capability

These terms overlap in practice. Use whichever fits your team's vocabulary, but apply consistent meaning:

| Term | Origin | Useful when |
|---|---|---|
| **Feature** | General / XP | Default choice. Clear to product and business people. |
| **Epic** | Scrum / SAFe | Common in Jira-based teams. Implies "too big for one sprint." |
| **Capability** | SAFe | Useful in executive-level communication. |

All of this refers to the same concept: a named business capability that delivers value and decomposes into user stories.

Feature, Epic and capability are synonymous terms in this project.

## Relationship to User Stories

A feature is not written in a formal format — it is a **name and a description** used to group stories. User stories are the unit of delivery. Features are the unit of product conversation.

When a product person describes a need like:
> "We need employees in Brazil to be able to monetize their vacation days instead of taking them"

That is a feature description. The team's job is to decompose it into stories — each expressing a specific user need that can be independently delivered and tested.

The skill `pm-capture-feature` guides the process of going from that raw description to a set of proposed user stories.
