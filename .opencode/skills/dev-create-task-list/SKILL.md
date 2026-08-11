---
name: dev-create-task-list
description: "Creates a granular, ordered implementation task list for a single application tier (backend, web frontend, mobile, or any other tier) Trigger: When a user asks to create, generate, or build a task list, implementation plan, coding checklist, or list of coding actions for a story tier"
user-invocable: false
metadata:
    type: skill
    version: "1.0.0"
    updated-at: "2026-05-15"
---

# Critical Patterns

## Input Parameters

This skill requires a mandatory parameter:

| Parameter | Required | Description |
|---|---|---|
| `tier` | Yes | The application tier for which the task list is created. Examples: `backend`, `web`, `mobile`. Must match a tier that is active in the current story's technical specification. |
| `technical_specification` | Yes | The technical specification document for the story, feature, or task, which defines the components and modules to be implemented in the tier. |

This skill executes **for a single tier only**. It does not loop across tiers.

## Agent Identity — Tier Expert

Before generating any task, adopt the identity of a **senior expert in the technologies of the target tier**.

To determine the technology stack:
1. Search for the **tier blueprint** document for the given tier (e.g., search for "backend blueprint", "web frontend blueprint", or "mobile blueprint" in the architecture and documentation folders)
2. Read the tech stack section of that blueprint — framework, language, ORM, state management, routing, testing libraries, etc.
3. From that moment, reason and produce tasks as an expert practitioner in those specific technologies

This is not cosmetic. The task list must use the exact file conventions, class naming patterns, decorator syntax, and architectural rules defined in the tier blueprint.

## What a Task List Is

A task list is an ordered sequence of **code actions** — discrete, unambiguous instructions for a developer to execute one at a time.

Each task:
- Names a single action: **create**, **modify**, or **delete**
- Identifies the exact target: a file, class, method, function, decorator, migration, table, index, enum, or route
- Describes the expected outcome in one sentence
- Contains **no code examples** — action descriptions only
- Is small enough to be implemented by a developer in a single focused session

## Ordering by Dependencies

Tasks must be ordered to respect implementation dependencies. The agent must reason about the dependency graph of the tier before sequencing tasks. This reasoning have to include configurations. Eg. orm configuration. 

> The agent must read the tier blueprint to verify the exact layer names and conventions for the project. The ordering above is a starting point, not a fixed rule.

## Grouping

Tasks within a tier are grouped into **logical blocks** that can be scoped independently:

- Each block has a short header (e.g., `## Database`, `## Entity`, `## API Contract`, `## Service`, etc.)
- Block names derive from the tier's architecture layers as defined in the blueprint
- A developer must be able to pick a block and implement it without having to scan the entire list

## Task Format

Each task is a Markdown checkbox following this pattern:

```
- [ ] {action} `{target}` — {expected outcome in one sentence}
```

Where:
- `{action}` is one of: **Create**, **Modify**, **Delete**
- `{target}` is the exact file path, class name, method name, or artifact name
- The outcome sentence answers "what will be true once this task is done?"


## To Do Section
The scope of the task list is the implementation of a very specific feature or story by tier. If code require additional features to work (e.g., a new user role, a new permission, a new API endpoint, etc.) that are outside the scope of the current story or tier, these should be added to a **To Do** section at the end of the document. This section is not part of the implementation task list but serves as a reminder for future work that needs to be done to support the current implementation.


```
- [ ] Add todo comment in {class , method, function },  {missing feature} is going to be implemented in {id of other feature}
```

## Output File

The output file is named `{tier}-task-list.md` and is saved in the story's specification folder alongside the functional and technical specification documents.

**Template**: See [assets/template-task-list.md](assets/template-task-list.md)

# Guidelines

- Read the technical specification **and** the functional specification before starting. The technical spec defines components; the functional spec defines rules and edge cases that may add extra tasks (e.g., validation, error handling, UI feedback states).
- Read the tier blueprint to understand naming conventions, file structure, decorators, and patterns. Tasks must use exact names and paths consistent with the blueprint's scaffolding section.
- Read the architecture document to understand cross-cutting rules that affect the task list (e.g., no FK constraints between modules, soft delete pattern, ULID generation).
- Do NOT invent file paths or class names. Derive them from the blueprint scaffolding and the module name in the technical specification.
- Each task must be independently implementable. A developer should be able to take any single task, understand it fully, and implement it without reading the rest of the list.
- Do NOT include tasks that belong to other tiers. This skill produces one file per tier, scoped to that tier only.
- Tasks for **testing** (unit tests, integration tests) are included in the same block of the functions to being able to test the new code immediately after implementing it. They are not separated into a different testing block at the end.
- End to end test require an individual block at the end of the list, after all production code tasks, to ensure that all features are implemented before testing them. This end to end test came from acceptance test or user stories scenarios. Not less not more to keep it focused and actionable.

# Document

- **Template**: See [assets/template-task-list.md](assets/template-task-list.md) for the task list document template
