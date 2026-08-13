---
name: dev-implement-story
description: "Orchestrates the end-to-end delivery of a user story from approved functional specification to implemented and verified code. Trigger: When user asks to implement, deliver, develop, or code a user story — or wants to start or resume the technical implementation of a story — or uses terms like deliver story, implement story, code story, develop story, start implementation."
user-invocable: false
metadata:
    type: skill
    version: "2.0.0"
    updated-at: "2026-07-29"
---

You don't need to have full context of each step; ask subagents to gather the context of their goal.

# What is dev.deliver-story

An orchestration skill that takes a user story with an approved functional specification and drives its complete technical delivery: high-level design, implementation planning, code writing, and functional verification.

It delegates each step to the right agent, tracks state in a `story.yaml` file, and manages transitions between steps.

# State Tracking

The process creates a `story.yaml` file in the story's specification folder to track progress. This file is the source of truth for knowing where the process stands and what comes next.

On every invocation:

1. Locate the story specification folder using the story ID or short title provided
2. Check if `story.yaml` exists inside it
3. If it exists — read it and resume from the current pending step
4. If it does not exist — create it with all steps set to `not-started` and begin from Step 1

Before starting any step: update `story.yaml` with status `in-progress`.  
After completing a step: update status to the appropriate terminal state (see workflow).  
When a step requires waiting for human action: set status to `hold`.

The `story.yaml` structure:

```yaml
story: "{story-id}"
title: "{story short title}"
started: YYYY-MM-DDTHH:MM:SS
updated: YYYY-MM-DDTHH:MM:SS
finished: YYYY-MM-DDTHH:MM:SS
mode: interactives
state: "last implemented step"
steps:
  - id: create-functional-spec
    status: not-started
  - id: approve-functional-spec
    status: not-started
  - id: create-tech-spec
    status: not-started
  - id: approve-tech-spec
    status: not-started
  - id: implement-tasks
    tiers:
      - tier: backend
        status: in-progress
      - tier: web
        status: not-started
  - id: functional-verification
    status: not-started
  - id: mark-as-done-story
```

Status values per step type:

| Step type | Valid terminal statuses |
|---|---|
| Verification (hold) | `approved`, `hold` |
| Design (human-reviewed) | `draft`, `approved` |
| Implementation | `done` |
| Verification (automated) | `passed`, `failed` |

**Very important** : Do not pass to the next step until the current step is finished (done, passed, or approved).

**Human approval gate — BLOCKING RULE** : Every step that produces a document (create-functional-spec, create-tech-spec) MUST stop and wait for explicit human approval before the workflow continues. The agent MUST NOT auto-advance. After presenting the output, stop and remain on hold until the user explicitly says the document is approved. The corresponding HOLD step (approve-functional-spec, approve-tech-spec) enforces this gate.

# Resuming the Process

When the user asks to resume or continue delivery of a story:

- If a step is `approved`, `done`, or `passed` → skip it
- If a step is `hold` → inform the user what needs to happen before continuing
- If a step is `draft` → inform the user the artifact needs human review and approval before proceeding
- If a step is `in-progress` → resume it by delegating to the corresponding sub-agent
- If a step is `not-started` → start it

Always update the `updated` date in `story.yaml` when making changes.

# Auxiliary Skills

Before start or resuming any step, find the skills that match better to achieve the goal of the step


# Workflow

Follow the steps defined in [assets/workflow.yaml](assets/workflow.yaml) strictly and in order.