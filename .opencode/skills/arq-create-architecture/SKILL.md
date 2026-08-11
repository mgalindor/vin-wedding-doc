---
name: arq-create-architecture
description: "Process to gather information and build a comprehensive target software architecture document . Trigger: When user asks to create, write, generate, design, or document the software architecture — or when define system context, describe building blocks, document deployment topology, or produce an architecture document from project discovery materials. Very important this is just for target architecture documentation, not recommended for analyzing existing source code."
user-invocable: false
metadata:
    type: skill
    version: "1.4.0"
    updated-at: "2026-06-09"
---

# Work Style Selection

Before starting the architecture process, ask the user which work style to use:

- **interactive**: Step-by-step collaboration. Each section goes through a creative cycle: gather context → ask for orientation → draft → discuss → finalize. The user controls each section's content.
- **yolo**: Automated sequential generation. The orchestrator agent delegates each step to an `architect` subagent one at a time. Steps execute sequentially without human interruption. The user reviews the final document at the end.

Store the selected work style in the architecture document front matter as `working-style: interactive` or `working-style: yolo`.

**WARNING — yolo does NOT mean "all at once".**
In yolo mode, each step executes sequentially via subagents. The difference from interactive is that user validation is not requested between steps — but sequential execution and subagent delegation are **mandatory in both modes**.

# PROCESS RULES — APPLY IN ALL MODES (interactive AND yolo)

These rules govern how to follow this process. Skipping or shortcutting them produces an incomplete or incorrect document.

### RULE 1 — One step at a time, no exceptions

The document is built step by step. Each step must be fully complete before the next one starts.

### RULE 2 — Each step is executed by a subagent

Do not write architecture content directly. Each step is delegated to a specialized subagent; the subagent name and execution pattern are specified in `workflow.yaml` for each step. The subagent receives detailed instructions and context to produce the content for that step.

> **Note — Step 12 (Architecture Panel Review)** uses a **single-subagent multi-perspective pattern**: one `architect` subagent reviews the document from 4 specialist perspectives in sequence, then consolidates findings and rewrites the document. See `assets/step-12-architecture-panel-review.md` for the full protocol.

### RULE 3 — Step assets are loaded one at a time, at the moment of use

- **NEVER** read multiple `step-NN-*.md` files in the same operation or in advance.
- **ALWAYS** load a step's detail file **only immediately before delegating that step**.
- `workflow.yaml` may be read once at the start to get the list of steps. Nothing else.

### RULE 4 — Each step discovers and loads related skills before execution

Before delegating a step to the subagent, **identify and load any related skills** that could support or enhance the step's output. This provides flexibility and allows the process to improve as new skills are added.

---

# Step-by-Step Process

The architecture document is built one section at a time. Each level-2 section of the template corresponds to one step in the workflow.

Load the workflow definition from [assets/workflow.yaml](assets/workflow.yaml) **once** at the start to get the list of steps, their order, and the reference to each step's detail file. Do not re-read it on every step.

## Progress Tracking via Front Matter

The architecture document includes a `progress` attribute in its front matter — a list that tracks which steps have been visited and their current status:

```yaml
progress:
  - step: initialize
    status: done
  - step: introduction-and-goals
    status: doing
```

Status values:
- `doing` — Step work has started (subagent is executing)
- `draft` — A draft has been produced, under review (interactive mode only)
- `done` — Content accepted and written to the document

Rules:
- **Before delegating any step**: Update `progress` to add the step with status `doing`
- **After the subagent returns and content is written**: Update status to `done`
- **Never start step N+1 if step N is not `done`**

## Execution Loop (Both Modes)

For **every step**, in strict order:

```
1. READ architecture.md → identify the last step with status `done`
2. Determine NEXT step from workflow.yaml
3. Update progress: add next step as `doing` in architecture.md
4. DELEGATE to architect subagent (see Sub-Agent Delegation below)
5. WAIT for subagent to return result
6. Write the subagent's output into architecture.md
7. Update progress: mark step as `done` in architecture.md
8. ── In interactive mode: present output to user, wait for acceptance before step 7
9. ── In yolo mode: proceed immediately to step 1 of the next iteration
10. GOTO step 1 (repeat for next step)
```

**This loop runs once per step. There is no shortcut.**

## Sub-Agent Delegation

### Standard Steps (1–11)

For each standard step, invoke the `architect` subagent (or `devops` for the Deployment View step) with a prompt that includes:

- The **goal** of the step (from `workflow.yaml`)
- The **full content** of the step's detail file (`step-NN-*.md`) — read it just before invoking
- **Related skills** that support this step's task (discovered via RULE 4)
- The **current state** of `architecture.md` (so the subagent has previous sections as context)
- The **relevant workspace documents** to consult (README, backlog, journeys, kickoff, etc.)
- Clear instruction that the subagent must return only the **markdown content for this section**, ready to append to the document

> **IMPORTANT**: Read the step's detail file (`step-NN-*.md`) IMMEDIATELY before invoking the subagent for that step — not before, not in advance, not in bulk.

### Step 12 — Architecture Panel Review (Single Subagent)

Step 12 delegates to a single `architect` subagent. Read `assets/step-12-architecture-panel-review.md` for full instructions. Summary:

1. Delegate to one `architect` subagent, passing the full architecture document
2. The subagent reviews the document sequentially from 4 specialist perspectives (Software Architect, Cloud Infrastructure Architect, Frontend/Mobile Architect, DevOps Architect)
3. The subagent consolidates findings, rewrites affected sections, and appends the Panel Review Summary
4. Replace `architecture.md` with the returned improved document

The step detail file contains the perspective definitions, review focus per perspective, and the ready-to-use prompt template.

### Related Skills Convention

When delegating a step, include related skills in the subagent prompt with this format:

```
## Related Skills (Optional — use if needed for this step)

The following skills may support your work on this step:
- [Skill Name]: [Brief description]
- [Skill Name]: [Brief description]

You may invoke these skills or patterns if the situation calls for it. 
Include instructions in your returned content on when/how to invoke them.
```

---

## Interactive Mode — Additional Rules

For each step in **interactive** mode, after the subagent returns:

1. Present the drafted section to the user
2. Update progress status to `draft`
3. Allow the user to request modifications — ask the subagent again if needed
4. When the user explicitly accepts: update status to `done` and proceed to next step

---

## Yolo Mode — Additional Rules

In **yolo** mode:

1. Do NOT pause between steps for user input
2. Do NOT ask for confirmation after each step
3. Do NOT load multiple step assets at once to "prepare ahead" — load each asset only when its step is executing
4. After ALL steps are `done`, present the complete `architecture.md` to the user for final review

---

## Information Sources for Sub-Agents

When instructing the subagent, direct it to search the workspace for:

- Product requirement documents (PRD)
- Project brief or README
- Functional and technical interview notes
- Product backlog or release plan
- Discovery and analysis documents
- Decision records
- Architecture references or existing diagrams
- Kickoff documents and agreements
- Statements of work or contracts

**Excluded sources**: Raw transcripts, call recordings, or unprocessed verbatim conversation logs.

---

## Output File

Find the architecture folder then as the first step (initialize) creates `architecture.md`. 

Subsequent steps append new `##` sections to this file as each step completes.

---

## Workflow

Follow the steps defined in [assets/workflow.yaml](assets/workflow.yaml) strictly and in order.

Read `workflow.yaml` once. Never read step asset files in bulk or ahead of their execution turn.

## Document Template

- **Template**: Find the architecture documentation template

**VERY IMPORTANT**: Do NOT copy the entire template at once. The subagent for each step receives only the relevant section of the template.

---

## Verification (After All Steps Complete)

After all steps are `done`, verify the final document:

- Every section contains concrete, project-specific content — no remaining template placeholders
- Mermaid and PlantUML (mindmaps-startmindmap and infrastructure-startuml) diagrams use valid syntax and render correctly
- Quality goals in Introduction align with quality scenarios in Quality Requirements
- Building blocks in Building Block View are consistently mapped in the Deployment View
- ADRs reference the solution strategy rationale
- Stakeholders listed in Introduction are addressed by the quality goals
- Cross-cutting concepts mentioned in different sections are consistent
