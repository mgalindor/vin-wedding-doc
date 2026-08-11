---
name: arq-create-architecture-brownfield
description: "Orchestrates the full brownfield archaeology and architecture process.  Trigger: When user asks to analyze a brownfield project, perform code archaeology, document an existing system's architecture or create a brownfield architecture — or uses terms like archeology, brownfield, what this existing system does, architecture assessment" 
user-invocable: false
metadata:
    type: skill
    version: "1.1.0"
    updated-at: "2026-06-09"
---

# Overview

This skill orchestrates a 5-step brownfield analysis process that transforms an undocumented existing system into a set of architectural documents:

1. **Discover Components** — Find all deployable code containers in the workspace
2. **Analyze Components** — Deep archaeological analysis of each component (loop, one at a time)
3. **Architecture Snapshot** — Architecture document describing the current system state
4. **Functional Snapshot** — Executive summary of what the system does and its capabilities
5. **Target Architecture** — Comprehensive architecture document describing the desired future state
6. **Architecture Review** — Single architect subagent reviews the target architecture from 4 specialist perspectives, then consolidates findings and rewrites affected sections

All output documents except the target architecture are stored in the archaeology folder to mark them as point-in-time snapshots.

Load skills about architecture documentation, code analysis, and software archaeology to support the subagents in each step and project resources document management.

# PROCESS RULES

### RULE 1 — One step at a time

Each step must be fully complete before starting the next. The `analyze-components` step loops through components one at a time — never analyze more than one component simultaneously.

### RULE 2 — Each step is executed by a subagent

Do not produce documents directly. Each step is delegated to an `architect` subagent using the prompt defined in [assets/workflow.yaml](assets/workflow.yaml).

### RULE 3 — Read workflow.yaml once

Load `workflow.yaml` once at the start to get the full step list and their inline prompts. All step instructions are embedded in that file — there are no separate step detail files.

### RULE 4 — Track all progress in brownfield-progress.yaml

All workflow state is tracked in `brownfield-progress.yaml` located in the archaeology folder. This is the recovery point — if the process is interrupted, reading this file tells the orchestrator exactly where to resume.

---

# Progress Tracking

Progress is stored in `brownfield-progress.yaml` in the archaeology folder. Full schema is defined in the `initialize` step of [assets/workflow.yaml](assets/workflow.yaml).

Status values: `not-started` → `doing` → `done`

Rules:
- **Before delegating any step**: update status to `doing`
- **After the subagent output is written to disk**: update status to `done`
- **To resume**: read `brownfield-progress.yaml`, find the first step that is not `done`, continue from there

---

# Execution Loop

```
1. READ brownfield-progress.yaml
   (if it does not exist → start from `initialize`)
2. Find NEXT step: first with status != done
3. Update its status to `doing` in brownfield-progress.yaml
4. Build subagent prompt:
   - Step prompt from workflow.yaml
   - Current brownfield-progress.yaml content
   - Relevant workspace documents (README, kickoff, project resources document, PRD)
5. DELEGATE to architect subagent
   (Exception — Step architecture-review uses a SINGLE-SUBAGENT MULTI-PERSPECTIVE pattern:
   one architect subagent reviews the document from 4 perspectives sequentially,
   consolidates findings, and rewrites the document. See workflow.yaml for the full prompt.)
6. WAIT for subagent output
7. Write output documents to the appropriate folder
8. Update brownfield-progress.yaml: mark step done, record output path
9. ── In interactive mode: present output to user, wait for approval
10. ── In yolo mode: proceed immediately
11. GOTO step 1
```

## Component Analysis Loop (analyze-components)

The `analyze-components` step is a loop. For this step, run the following until all components are done:

```
WHILE components with status: not-started exist in brownfield-progress.yaml:
  1. Find the first component with status: not-started
  2. Update its status to `doing`
  3. Delegate to an architect subagent with the analyze-components prompt + component name and path
  4. WAIT for the subagent to complete the assessment
  5. Write the assessment file to the archaeology folder
  6. Update brownfield-progress.yaml: component status → done, add assessment path
  7. Update the project resources document: add `assessment` field to the component's src-code entry
  8. ── In interactive mode: present assessment to user, wait for approval before next component
  9. Continue to next component

WHEN all components are done: mark analyze-components step as done
```

---

# Templates

- **Architecture Snapshot**: Use the architecture document template of type `project-type: brownfield-snapshot`
- **Functional Snapshot**: [assets/template-functional-snapshot.md](assets/template-functional-snapshot.md)
- **Architecture Target**: Use the architecture document template of type `project-type: brownfield-target`

# Output Documents

All documents use date-prefix naming (`YYYYMMDD-`):

| Document | Location | Naming |
|---|---|---|
| Workflow progress | Archaeology folder | `brownfield-progress.yaml` |
| Component assessment | Archaeology folder | `YYYYMMDD-{component-name}-assessment.md` |
| Architecture snapshot | Archaeology folder | `YYYYMMDD-architecture-snapshot.md` |
| Functional snapshot | Archaeology folder | `YYYYMMDD-functional-snapshot.md` |
| Target architecture | Architecture folder | Follows `create target architecture` convention |
| Architecture review (overwrite) | Architecture folder | Same file as target architecture |

---

## Workflow

Follow the steps defined in [assets/workflow.yaml](assets/workflow.yaml) strictly and in order.

Read `workflow.yaml` once at the start. Do not reload it between steps.
