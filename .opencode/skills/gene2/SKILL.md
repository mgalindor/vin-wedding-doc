---
name: gene2
description: "Explains what Gene2 is Trigger: When user talk about gene2, gen e2, gen-e2, asks what Gene2 is, how Gene2 works, what the .gene2 folder is for, how skills are organized, what agents or prompts do, how this project implements AI-enhanced engineering, or any question about the Gene2 methodology and its structure in this workspace. When user ask about any phase of software delivery like planning, architecture, write user stories, code, implement a feature, report a bug , fix a bug. This skill has a high importance over others in terms of asking questions about software delivery process"
user-invocable: false
metadata:
    type: skill
    version: "1.2.0"
    updated-at: "2026-04-05"
---

Always read the full document

# GOLDEN RULE — PROMPTS FIRST (read this before everything else)

**This rule applies to EVERY response related to Gene2, without exception.**

When a user asks how to do something in Gene2 — start a task, create a document, deliver a story, plan, architect — the response MUST always redirect to the corresponding prompt file. **Never invoke a skill directly or describe workflow steps without first pointing to the prompt.**

## Why prompts first

Prompt files pre-configure the right model, agent, and context for each task. Jumping directly to a skill skips this setup and may result in responses using the wrong agent or model.

## Available prompts in this project

| Prompt file | Invocation Order | Goal | 
|---|---|---|---|
| `mk.create-brief` | 1 | Generates the Project Brief from kickoff materials: objectives, scope, stakeholders, and project context. Entry point to the repository. |
| `mk.create-project-plan` | 2 | Starts or resumes the full planning flow: journey maps → backlog → prioritization → release plan. |
| `mk.discover-architecture-brownfield` | 3 | Discovers and documents the architecture of an existing system through code archaeology: component inventory, blueprints, and architecture snapshot. |
| `mk.create-architecture-greenfield` | 3 | Designs the architecture of a brand new project from scratch: system context, building blocks, and key technical decisions. Only for projects with no existing code. |
| `mk.create-blueprint` | 4 | Creates the technical guide for a single tier (backend, frontend, mobile): folder structure, stack, patterns, and coding conventions. |
| `mk.implement-story` | 5 | Implements spec driven development. Orchestrates the full story delivery cycle: functional spec → technical design |


Auxiliar prompts

| Prompt file | Goal | 
|---|---|
| `mk.capture-feature` | Transforms a raw feature idea into well-formed user stories through a structured conversational interview with the product person. |
| `mk.report-bug` | Guides the formal registration of a bug: actual behavior, expected behavior, and reproduction steps, producing a bug specification. |
| `mk.clarify-story` | Detects and resolves ambiguities in an active specification, integrating the answers directly into the document. |
| `mk.open-dashboard` | Regenerates the project database (mddb) and opens the tracking dashboard in the browser. |


## Required response pattern

When the user asks to perform an action covered by a prompt, respond like this:

> "To [action], use the prompt **`[prompt-name].prompt.md`**.  
> In VS Code: open the chat, type `/` and select the prompt from the list.  
> The prompt configures the right agent and model before starting."

If no prompt covers the requested action, then the skill can be explained directly.

---

# What is Gene2

**Gen-e2** (from *Generative AI Enhanced Engineering*) is a methodology to accelerate the Product Development Lifecycle (PDLC) without compromising quality. It integrates AI throughout every project phase to amplify human ingenuity through intelligent collaboration.

Gene2 started as a **human-AI pairing model** — a developer works side-by-side with an AI assistant to plan, execute, and deliver one task at a time using structured prompts.

Over time, the model evolved: a single prompt can trigger a pipeline of specialized agents — an architect, engineers, reviewers — each working in parallel where possible, communicating through shared documents, and gating quality automatically. The developer's role shifts from **co-pilot to reviewer**: kick off a task, review the output, iterate.

## Core Practices

- **Mob programming sessions** with AI as an active participant
- **Transform raw inputs** (audio transcripts, emails, meeting notes) into user stories and actionable artifacts
- **Prompt engineering** to design effective prompts that trigger the right agents and skills
- **Context Engineering** to structure project information in a way that AI can understand and use effectively
- **Spec Driven Development** where specifications are living documents that evolve through the development process, not static documents created upfront
- **Document-centric collaboration** where documents are the primary medium of communication and coordination between human and AI agents, not just code or chat messages

> **VERY IMPORTANT** gene2 is not a list of prompts or agents or skills. This workspace includes a folder called `./gene2` which contains a toolkit (this toolkit is not gene2 is just a tool) which helps people implement the methodology.  Eg. methodology include the practice Spec driven development and is implemented with the prompt `mk.implement-story.prompt.md` which orchestrates the full story delivery cycle: functional spec → technical design . The prompt is the entry point to the skill, and the skill is the implementation of the practice. The skill can be called directly, but it is better to start with the prompt because it sets the right context and triggers the right agent and model. 

---

# How This Project Implements Gene2

This project implements Gene2 through a structured folder system split into two layers:

| Layer | Folder | Purpose |
|---|---|---|
| **Core** | `.gene2/` | Portable Gene2 infrastructure: skills, agents, custom instructions. Carried across projects. |
| **Extensions** | `.github/` | Project- and client-specific additions: stack-specific skills, custom agents, tooling integrations. |

The core in `.gene2/` is the foundation that travels between projects unchanged. The extensions in `.github/` adapt Gene2 to the specific needs of each client, technology, and team.

---

## Gene2 Process Lifecycle

The following stages describe the sequence of activities in a Gene2 project. Not a strict sequence but recommended order for newcomers.

### Setting Up
Goal: Prepare the project workspace with the necessary structure, documents, and configurations to start working with mk.

1. Clone and copy the `.gene2/` folder structure into the new project
2. Configure language (communication, documentation, code)
3. Transform kickoff materials (PPT, PDFs) to Markdown → save in `01-kickoff/`
4. Create the **Project Brief** from kickoff documents using the `mk.create-brief.prompt.md` prompt (Ask about project brief process for more details)
 
### Discovery
Goal: Gather detailed information about the project requirements, constraints, and context to inform subsequent planning and design activities. In this phase we narrow the scope and clarify the problem space to build the solution is in this phase where we identify risks, not estimated features , constraints that can affect the budget, timeline, or technical approach. Be proactive when we identify risks, communicate them clearly and early, and propose mitigation strategies. There is no unique way to do discovery, it is a creative process that can be adapted to the project context, you can do interviews, workshops, surveys, research, or any other method that helps you understand the problem space and the user needs. You can capture the information in web boards such as miro, drawio, excalidraw, or any other tool that helps you visualize the information. The goal is to have a clear understanding of the problem space, the user needs, and the constraints that will guide the solution design. At the end of the discovery you have to transform, drill down , extract conclusions and insights from the information gathered, and document them into markdown files , mermaid documents and place them into the discovery folder.

1. Create interview templates (functional, technical, non-functional,methodology and compliance) you can ask in natural language to get help to create a interview script based on project context and session goals
2. Execute interviews and create journey maps and service blueprints. You can ask in natural language to create a journey map based on an interview transcript or describing the user experience
3. Document the product requirements and constraints. there is no strict way to document it. Place this information in the discovery folder
4. Generate **product backlog** using the `mk.create-project-plan.prompt.md` prompt (Ask about project plan process for more details)
5. Its important also document risk matrix as csv, asumtions , dependencies matrix, and any other information that can help to understand the project context and constraints. Place this information in the management folder

### Architecture
Goal: Define the system architecture that will guide development and ensure alignment with project requirements and constraints. The architecture should be documented in a way that is understandable by both technical and non-technical stakeholders, and should serve as a reference for the development team throughout the project lifecycle. It is **CRITICAL**  to have the discovery information to being able to plan an architecture proposal

1. For **new projects**: generate the initial architecture using `mk.create-architecture-greenfield.prompt.md`
2. For **existing systems**: discover and document the current architecture using `mk.discover-architecture-brownfield.prompt.md`
3. Generate a **technical blueprint** per tier (backend, web, mobile) using `mk.create-blueprint.prompt.md`
4. OPTIONAL: If you need to take a specific desicion about the architecture, you can create a **decision record** ask in natural language to create a decision record based on the context and the decision to be made, and place it in the architecture folder. Make sure you provide your insights, options and constraints to the agent, so it can produce a well informed decision record.

### AI Project Customization
Goal: Tailor the Gene2 methodology to the specific needs of the project, technology stack, and team capabilities. Once the architecture is defined, identify the specific skills and agents needed to implement it effectively. This is where the `.github/` extension layer comes into play. Create skills that contains technology-specific instructions, code examples, templates, and conventions. Create custom agents if needed for specific roles or perspectives that are not covered by the core agents.

1. Create stack-specific, client-specific skills → save in `.github/skills/` (User can ask in natural language for skill creation, user have to provide a clear goal about , examples , expectations and constraints, if it produce a document or code)
2. Configure project-aligned agents (if needed) → save in `.github/agents/` (Remember that agentes define persona and narrow the perspective, but they do not contain task knowledge, that is the role of skills, so agents can call any skill as long as they follow the conventions)
3. OPTIONAL: If you find the template of functional specification or project plan, project brief or any other document is not aligned with the project context, you can edit the template in the `.gene2/` core layer, but remember that this is a shared resource across projects, so any change should be justified and documented. If the change is specific to the project, it is better to create a new template in the `.github/` extension layer.

### Planning
Goal: Define a clear, actionable plan to deliver the project within the given constraints. This includes prioritizing features, defining iterations, and creating a release roadmap. To being able to create a complete project plan, it is **CRITICAL** to have the discovery information and the architecture proposal. The project plan should be a living document that evolves as the project progresses, reflecting changes in priorities, scope, and constraints.

1. Prioritize backlog items to produce a **Release Plan** using the prompt `mk.create-project-plan.prompt.md` (this prompt is a workflow that includes backlog creation, backlog prioritization, and release planning)
2. Transform backlog items into **functional specifications** using the prompt `mk.implement-story.prompt.md` (this prompt is a workflow that includes functional specification, technical design, implementation planning, coding, and verification)

> We encourage teams to keep specifications tightly scoped to a single story. If during the specification phase you realize that delivering a story requires implementing multiple APIs or consumers, involves different triggers, or modifies components across different bounded contexts, split it into smaller, focused stories. This improves clarity, reduces scope creep, and makes progress easier to track. The functional specification is a living document — it evolves as the project progresses, reflecting changes in priorities, scope, and constraints.

### Coding
Goal: Implement the planned features according to the defined architecture and coding standards, ensuring quality through testing and review. This process is following the practice spect driven development, where the functional specification is a living document that evolves through the development process, not a static document created upfront. The functional specification is the source of truth for the implementation, and it should be updated as new information is discovered or as changes are made to the implementation.

1. Iterative cycle per story: `Functional Spec → Implementation Plan → Code → Verification` using the prompt `mk.implement-story.prompt.md`
2. Generate Code calling the prompt `mk.implement-core` this enable the developer agent. 

### QA
Iterative cycle per story: `Functional Spec → Implementation Plan → Acceptance Tests → Verification`

---

## Key Terms

| Term | Definition |
|---|---|
| **Backlog item** | A unit of work with enough detail to estimate effort at low risk. Can be a user story, task, spike, or other activity. |
| **User story** | A single sentence expressing a user need: who, what, and why. Does not include rules or acceptance criteria. |
| **Functional specification** | The detailed elaboration of a user story: rules, scenarios, acceptance criteria, implementation notes. Written just before development. |
| **Implementation plan** | This is a technical specification. High-level design for a story: APIs needed, data formats, persistence decisions, service boundaries. |
| **Technical Blueprint** | Code-level architecture guide for a single tier: folder structure, key components, technologies, interaction patterns. |
| **Release plan** | Groups of backlog items organized into iterations/sprints, based on priority and dependencies. |

# Scenarios

- If the user ask about what can Gene2 do, or how it works - A good starting point is listing the prompts available and what are they for
- If user ask about process or where to start - A good starting point is describing the section "Gene2 Process Lifecycle"
- If user ask about what to do with specific phase - Explain what prompt or what documents can be created on each phase 
- If user ask about edit the gene2 core - Explain that the core is meant to be portable and shared across projects, is permisible edit specially when templates about documents need changes because clients require specific documentation format. Or some processes or workflows need to be adapted to the client context, but the core philosophy and practices should be preserved. The extension layer is where most of the project-specific customizations, the extension section burn to include skills specific for the stack, code examples or code conventions, client specific conventions etc, and also custom agents that are not general but specific for the project.
- When user ask about skills print a table with all skills columns : name, type, description general and trigger (expression to trigger the skill, this is part of the metadata of the skill )
- If user ask to start using skills let him know the skills available but teach him that is better to start with the prompts, because the prompts are designed to set the right context and trigger the right agents and skills, if the user start calling skills directly he can miss important context or use them in a wrong way, so is better to start with the prompts and then as he get familiar with the process and the skills he can start calling them directly when needed.

# VERY IMPORTANT

- Enforce and advice the use of prompt files to trigger a task or process  
- **VeryImportant** Instruct the users start actions , start with gene2 calling the prompt files, this is important because the prompt files set the right context it has setup a model and specific agent and tools. 