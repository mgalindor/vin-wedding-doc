---
name: pm-create-journey
description: "Creates or updates a User Journey Map document that maps the end-to-end process a user follows to achieve an objective, including actions, pain points, and workarounds at each step. Trigger: When user asks to create, write, generate, build, map, update, edit, or modify a user journey, journey map, customer journey, experience map, or process flow — or wants to understand how a user interacts with a system from start to finish"
user-invocable: false
metadata:
    type: skill
    version: "1.0.0"
    updated-at: "2026-05-15"
---

# What is a User Journey Map

A User Journey Map is a visual narrative of the steps a user takes to achieve a goal — from start to finish. Each step documents what the user does, what pain they experience, and how they work around problems today.

The journey map is NOT a system flow diagram. It is NOT a UI wireframe. The subject is always the user — never the system.

# Work Style Selection

Before starting the journey process, ask the user which work style to use:

- **interactive**: Step-by-step collaboration. Each step goes through a creative cycle: gather context → ask for orientation → draft → discuss → finalize. The user controls each step's content.
- **yolo**: One-shot generation. The AI infers everything from available workspace context and produces a complete journey map proposal without stopping for human input.

Store the selected work style in the document front matter as `work-style: interactive` or `work-style: yolo`.

# Step-by-Step Process

The workflow has two scopes:

All step instructions are defined inline in the workflow file. Load [assets/workflow.yaml](assets/workflow.yaml) to get the full list of steps with their goals and instructions.

## Coverage Tracking File

The `discover-domains` step creates a `journey-coverage.yaml` file in the journey maps folder. This file lists all domains and their processes with a status for each. It is the source of truth for knowing what has been mapped and what is still pending. Update it at the end of each domain cycle.

## Progress Tracking via Front Matter

The journey map document includes a `progress` attribute in its front matter — a list that tracks which steps have been visited and their current status:

```yaml
progress:
  - step: initialize
    status: done
  - step: identify-actors-and-goals
    status: doing
```

Status values:
- `doing` — Step work has started
- `draft` — A draft has been produced, under review
- `done` — Content accepted by the user

Rules:
- **Before starting any step**: Add the step entry to `progress` with status `doing`
- **After producing a draft** (interactive mode): Update status to `draft`
- **After user acceptance**: Update status to `done`

## Interactive Mode Cycle

For each step in **interactive** mode:

1. Add the step to `progress` as `doing`
2. Load the step's detail file from the workflow
3. Search the workspace for relevant context (see Information Sources below)
4. Ask the user for additional details, references, or direction — these inputs are optional, the user may skip them
5. Produce a draft of the section content and update step status to `draft`
6. Present the draft for discussion — the user may ask to modify, enrich, simplify, or remove parts
7. When the user explicitly accepts the result, update the step status to `done`
8. Proceed to the next step

## Yolo Mode

In **yolo** mode, for each step:

1. Add the step to `progress` as `doing`
2. Load the step's detail file
3. Gather all available workspace context
4. Infer and write the section content based on available information
5. Mark the step as `done`
6. Continue to the next step without pausing

After all steps complete, present the full document for a final review.

**VERY IMPORTANT**: In yolo mode, execute step by step without interruption, relying solely on workspace context.

## Information Sources

When gathering context, search the workspace for documents by their purpose:

- Product requirement documents (PRD)
- Project brief or README
- Analysis documents and process descriptions
- Discovery documents
- Kickoff documents and agreements
- Client-shared documentation and references

**Excluded sources**: Do not use raw transcripts of audio recordings or email threads. Only use processed interview notes or analysis documents derived from those sources.

## Writing Rules

- The subject of every step is always the user — never the system
- Write actions as verbs in infinitive: "Ingresar datos", "Revisar estado", "Confirmar pago"
- If a step describes something the system does internally (validate, save, query), it does NOT belong as a step — it may be a pain point or a workaround detail
- Include moments where the user needs information to make a decision or maintain trust in the process — these are valid steps
- Before labeling something as a pain or workaround, ask: does the user experience this directly?

## Output File

One journey map file per domain. A domain is a cohesive grouping of processes that share the same actor and objective. Good domain groupers: business domain (Users, Products, Payments), main actor (Operator, Supervisor, End user), lifecycle stage (Onboarding, Daily use, Offboarding), service line (Billing, Support, Reports), or system capability (Batch management, Rules engine).

The decision rule: if two processes share the same actor and goal, they belong in the same file as additional journey sections. If actors, goals, or flows are meaningfully different, create a separate file.

The first step creates the file in the journey maps folder of the workspace using project naming conventions (date prefix, lowercase, hyphens). Subsequent steps progressively add content as each section is completed.

## Workflow

Follow the steps defined in [assets/workflow.yaml](assets/workflow.yaml) strictly and in order.

## Document

- **Template**: See [assets/template.md](assets/template.md) for the journey map document template.

**VERY IMPORTANT**: Do NOT copy the entire template content at once. Only work on the section relevant to the current step.
