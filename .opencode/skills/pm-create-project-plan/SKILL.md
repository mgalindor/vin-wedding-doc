---
name: pm-create-project-plan
description: "Orchestrates the end-to-end project planning process — from user journey discovery through backlog creation, architecture and devops task additions, prioritization, and release planning. Each step is delegated to a specialized sub-agent. Trigger: When user asks to create, start, generate, build, drive, or resume a project plan — or wants to orchestrate the full planning process, coordinate planning across agents, plan the project from discovery to release, or asks how do we plan this project? or what's the next planning step?"
user-invocable: false
metadata:
    version: "1.0.0"
---

# What is the Project Plan

The project plan is an orchestration process that takes a project from discovery to a delivery-ready release plan. It coordinates specialized agents — each responsible for their domain — to produce the artifacts the team needs to start delivering.

The process generates these artifacts in order:

1. **User journey maps** — how users interact with the system, per domain
2. **Product backlog** — user stories derived from journey actions
3. **Architecture documentation** — system design and decisions
4. **Architecture tasks** — technical enablement items added to the backlog
5. **DevOps tasks** — delivery enablement items added to the backlog
6. **Prioritized backlog** — all items tagged with MoSCoW priorities
7. **Release plan** — items grouped into sprints

# Execution Mode

**BLOCKING REQUIREMENT**: Before reading `planning.yaml` or starting any step, ask the user which execution mode they prefer:

> "How would you like to run the project plan?
> - **Interactive mode** — I pause after each step so you can review the results and confirm before continuing.
> - **Yolo mode** — I run all steps autonomously without pausing.
> Which do you prefer?"

Save the selected mode in `planning.yaml` under a `mode` key (`interactive` or `yolo`). Default to `interactive` if the user doesn't specify.

If `planning.yaml` already exists and has a `mode` set, use that mode without asking again. Only ask if the mode is absent or `planning.yaml` doesn't exist yet.

**Interactive mode**: After each step completes, present a summary of what was produced and wait for the user to confirm before moving to the next step.

**Yolo mode**: Execute all pending steps sequentially without pausing. Report progress after each step but do not wait for confirmation.

# Execution Model

Each step is executed by a sub-agent. This skill does not perform the creative work directly — it delegates to the right agent, tracks progress, and manages transitions.

Steps that have a dedicated skill (journeys, backlog, release plan) are delegated with the skill reference. Steps without a dedicated skill (architecture tasks, devops tasks, prioritization) follow the inline instructions defined in the workflow.

**VERY IMPORTANT**: Each step must be delegated to the specified sub-agent. Do not perform another agent's work directly. Invoke the sub-agent by its agent name as specified in the workflow.

# State Tracking

The process creates a `planning.yaml` file in the planning folder to track progress. This file is the source of truth for knowing where the process stands and what comes next.

On every invocation:

1. Check if `planning.yaml` exists in the planning folder
2. If it exists — read it and resume from the current step
3. If it doesn't exist — create it with all steps set to `not-started` and begin from Step 1

Before starting any step: update `planning.yaml` with status `in-progress`.
After completing a step: update status to `done`.
When a step requires waiting for external work: set status to `hold`.

The `planning.yaml` structure:

```yaml
project: "{project name}"
started: YYYY-MM-DD
updated: YYYY-MM-DD
mode: interactive  # interactive | yolo
steps:
  - id: create-journeys
    status: not-started
  - id: create-backlog
    status: not-started
  - id: architecture-review
    status: not-started
  - id: add-architecture-tasks
    status: not-started
  - id: add-devops-tasks
    status: not-started
  - id: prioritize-backlog
    status: not-started
  - id: create-release-plan
    status: not-started
```

Status values: `not-started`, `in-progress`, `hold`, `done`

# Resuming the Process

When the user asks to resume or continue the project plan:

- If a step is `done` → skip it
- If a step is `hold` → inform the user what needs to happen before continuing
- If a step is `in-progress` → resume it by delegating to run the corresponding subagent
- If a step is `not-started` → start it

Always update the `updated` date in planning.yaml when making changes.

**Very Important**: Find skills depending each step

# Workflow

Follow the steps defined in [assets/workflow.yaml](assets/workflow.yaml) strictly and in order.
