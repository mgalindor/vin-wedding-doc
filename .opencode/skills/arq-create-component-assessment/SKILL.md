---
name: arq-create-component-assessment
description: "Analyzes an existing code component (container). Trigger: When user asks to analyze, document, explore, or reverse-engineer a code component, container, service, or repository — or wants to create a component assessment, understand an existing codebase, perform code archaeology, or produce a technical inventory of a deployable unit — or uses terms like 'component assessment', 'code analysis', 'reverse engineer', 'archeology', 'analyze this repo', 'what does this service do?', 'document this codebase', 'reverse engineer this repo', 'create architecture from existing code', 'analyze this service'"
user-invocable: false
metadata:
    type: skill
    version: "1.0.0"
    updated-at: "2026-04-07"
---

# Prerequisites

This skill requires a **component path** as input — the root folder of the code component to analyze. This path is typically provided by the orchestrating workflow or by the user directly.

Before starting, verify:
1. The component path exists and contains source code
2. There is at least one project descriptor file (e.g., `pom.xml`, `package.json`, `build.gradle`, `Cargo.toml`, `pyproject.toml`, `go.mod`, etc.)

# Work Style Selection

Before starting the analysis, ask the user which work style to use:

- **interactive**: Step-by-step collaboration. Each step goes through a cycle: explore code → draft section → discuss → finalize. The user controls each section's content.
- **yolo**: Automated sequential generation. Each step executes via subagents without human interruption. The user reviews the final assessment at the end.

Store the selected work style in the assessment front matter as `working-style: interactive` or `working-style: yolo`.

**WARNING — yolo does NOT mean "all at once".**
In yolo mode, each step executes sequentially via subagents. Sequential execution and subagent delegation are **mandatory in both modes**.

## Workflow

Follow the steps defined in [assets/workflow.yaml](./assets/workflow.yaml) strictly and in order.

Write the output using following the format defined in [template](./assets/template-component-assessment.md)

Read `workflow.yaml` once. Never read step asset files in bulk or ahead of their execution turn.


# PROCESS RULES — APPLY IN ALL MODES (interactive AND yolo)

### RULE 1 — One step at a time, no exceptions

The assessment is built step by step. Each step must be fully complete before the next one starts.

### RULE 2 — Each step is executed by a subagent

Do not write assessment content directly. Each step is delegated to a specialized subagent (typically `architect`). The subagent receives detailed instructions, the component path, and the current state of the assessment.

> **Exception — Step 7 (Assessment Review)** uses a **parallel execution pattern**: 3 specialist subagents run simultaneously, then a synthesis subagent rewrites the document. See the step detail file for the full protocol.

### RULE 3 — Step assets are loaded one at a time, at the moment of use

- **NEVER** read multiple `step-NN-*.md` files in the same operation or in advance.
- **ALWAYS** load a step's detail file **only immediately before delegating that step**.
- `workflow.yaml` may be read once at the start to get the list of steps. Nothing else.

### RULE 4 — Subagents must behave as experts in the detected technologies

After Step 1 (Overview) identifies the language, runtime, frameworks, and build tools, **every subsequent subagent must be instructed to behave as an expert in those specific technologies**. Include the Overview section in the subagent prompt so it knows the tech stack.

### RULE 5 — Subagents explore code, not guess

Each subagent must **read and search actual source code** to fill its section. Guessing or inferring from file names alone is insufficient. The subagent should use file search, grep, and file reading tools to discover the real structure.

### RULE 6 — Subagents not require read all the code

Each sub agent must use grep and file search to find relevant files and sections, but they do not need to read every single line of code. They should focus on finding the key files and patterns that reveal the required information for their section. Based on the common expressions depending on the code and frameworks, explore more than just one expression to search the relevant files and code.


# Step-by-Step Process

Load the workflow definition from [assets/workflow.yaml](assets/workflow.yaml) **once** at the start to get the list of steps, their order, and the reference to each step's detail file. Do not re-read it on every step.

## Progress Tracking via Front Matter

The assessment document includes a `progress` attribute in its front matter. The complete list of steps, in order, is:

```yaml
progress:
  - step: initialize        # Step 0 — creates the file and confirms work style
    status: done
  - step: overview          # Step 1 — language, runtime, frameworks, build tools
    status: done
  - step: configuration     # Step 2 — configuration style (files, env vars, DB, constants)
    status: done
  - step: input-interfaces  # Step 3 — inbound entry points (API, UI, queues, cron, CDC)
    status: done
  - step: output-interfaces # Step 4 — outbound dependencies (APIs, datastores, messaging)
    status: done
  - step: data-archaeology  # Step 5 — data model, schemas, entities, legacy patterns
    status: done
  - step: component-responsibility  # Step 6 — responsibility type and main capabilities
    status: done
  - step: cross-cutting-concerns # Step 7 — cross-cutting issues and architectural smells
    status: done  
  - step: assessment-review # Step 8 — parallel specialist review + synthesis rewrite
    status: doing
```

Each assessment file starts with only `initialize` in the list and adds entries as steps complete. The example above shows a document where steps 0–6 are done and step 7 is in progress.

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
1. READ the assessment file → identify the last step with status `done`
2. Determine NEXT step from workflow.yaml
3. Update progress: add next step as `doing`
4. READ the step's detail file AND the corresponding section from `assets/template-component-assessment.md`
5. DELEGATE to architect subagent with the full prompt (step goal, detail file, template section, component path, current assessment)
6. WAIT for subagent to return result
7. Append ONLY the `##` section produced by the subagent to the assessment file — do NOT replace or regenerate sections previously written
8. Update progress: mark step as `done`
9. ── In interactive mode: present output to user, wait for acceptance before step 8
10. ── In yolo mode: proceed immediately to step 1 of the next iteration
11. GOTO step 1 (repeat for next step)
```

## Sub-Agent Delegation

### Standard Steps (1–6)

For each standard step, invoke the `architect` subagent with a prompt that includes:

- The **goal** of the step (from `workflow.yaml`)
- The **full content** of the step's detail file — read it just before invoking
- The **component path** to analyze
- The **current state of the assessment** (so the subagent has previous sections as context, especially the Overview from Step 1)
- The **exact `##` section from `assets/template-component-assessment.md`** that corresponds to this step — read it just before invoking and include it in the prompt as the **Expected Output Format**. The HTML comment at the top of each template section identifies which step it belongs to (e.g., `<!-- Section: Overview (Step 1) -->`). The subagent MUST produce content that matches this format exactly — same headings, same table columns, same markdown structure.
- Clear instruction to **explore actual source code** — read files, search for patterns, examine configuration
- Clear instruction that the subagent must return only the **markdown content for this one `##` section**, ready to append to the document — it must NOT rewrite or regenerate any other section already in the assessment

> **IMPORTANT**: Read the step's detail file AND the corresponding template section IMMEDIATELY before invoking the subagent — not in advance, not in bulk. Never read multiple step assets at the same time.

### Step 7 — Assessment Review (Parallel Pattern)

Step 7 requires a different execution flow. Read the step detail file for full instructions. Summary:

1. **Phase A** — Launch 3 subagents **in parallel** (simultaneously):
   - `architect` as Software Architect
   - `architect` as Data & Integration Specialist
   - `architect` as Technology Stack Specialist
2. **Wait** for all 3 reviews to return
3. **Phase B** — Delegate to a single `architect` subagent to synthesize all 3 reviews and rewrite the assessment

## Interactive Mode — Additional Rules

For each step in **interactive** mode, after the subagent returns:

1. Present the drafted section to the user
2. Update progress status to `draft`
3. Allow the user to request modifications — re-invoke the subagent if needed
4. When the user explicitly accepts: update status to `done` and proceed to next step


## Yolo Mode — Additional Rules

In **yolo** mode:

1. Do NOT pause between steps for user input
2. Do NOT ask for confirmation after each step
3. Do NOT load multiple step assets at once
4. After ALL steps are `done`, present the complete assessment to the user for final review

## Output File

The assessment file is created in the archaeology folder of the workspace. The file name follows the convention: `{component-name}-assessment.md` (lowercase, hyphens).

The Initialize step (step 0) creates the file. Subsequent steps append new `##` sections as each step completes.

## Document Template

- **Template**: See [assets/template-component-assessment.md](assets/template-component-assessment.md)

Each `##` section in the template maps to one workflow step. Use the HTML comment at the top of each section (`<!-- Section: X (Step N) -->`) to identify which template section belongs to which step:

| Step | Template Section |
|---|---|
| Step 1 — Overview | `## Overview` |
| Step 2 — Configuration | `## Configuration Style` |
| Step 3 — Input Interfaces | `## Input Interfaces` |
| Step 4 — Output Interfaces | `## Output Interfaces` |
| Step 5 — Data Archaeology | `## Data Archaeology` |
| Step 6 — Component Responsibility | `## Component Responsibility` |
| Step 7 — Assessment Review | Appends `## Assessment Review Summary` |

**Before delegating any step (1–6)**: read only the corresponding template section and include it in the subagent prompt. The subagent must produce content that exactly matches the section's headings, table columns, and markdown structure. Remove all HTML comments from the final output.

**VERY IMPORTANT**: Do NOT copy the entire template at once. The subagent for each step receives only the relevant section guidance.