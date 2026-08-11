---
name: arq-create-tier-blueprint
description: "Creates a Tier Blueprint — a concise, opinionated technical guide for a single application tier (backend, web frontend, mobile, or any other tier) Trigger: When user asks to create, write, generate, define, or document a tier blueprint, code architecture, coding guide, technical guide, or stack definition for a specific tier — or uses terms like 'backend blueprint', 'frontend blueprint', 'mobile blueprint', 'how to organize code', 'technical guide', 'code architecture', or 'define the tech stack'."
user-invocable: false
metadata:
    type: skill
    version: "1.1.0"
    updated-at: "2026-05-15"
---

# Critical Patterns

## One document per tier

Each Tier Blueprint covers exactly **one tier** of the system. Do not merge multiple tiers in a single document.

Typical tiers:
- `backend` — API server, business logic, persistence
- `microservice` — API server, business logic, persistence
- `data-processing` — batch jobs, stream processing, ML pipelines
- `backend-for-frontend` — API layer optimized for a specific frontend
- `web-frontend` — Browser SPA or SSR application
- `mobile-pwa` — Progressive Web App with offline capabilities
- `mobile-native` — iOS / Android native app

## Length rule — the most important rule

A Tier Blueprint must be **short and scannable**.  
A developer should read the entire document in under 10 minutes.

**Strictly forbidden:**
- Long code examples (more than 5–7 lines)
- Exhaustive library documentation
- Tutorials or step-by-step how-tos
- Implementation details that belong in code comments or READMEs

**The right level of detail:** name the pattern, show a one-line example, link to the ADR or library docs for depth.  
If you find yourself writing paragraphs, you have gone too far.

## Questions to ask before generating

Before creating the blueprint, collect the following from the user or from existing workspace documents (architecture doc, ADRs, backlog):

1. **Tier name** — which tier is this blueprint for?
2. **Language + runtime** — e.g., TypeScript / Node 20, Kotlin / JVM 17
3. **Key libraries** — framework, ORM/data layer, auth, testing
4. **Architectural style** — layered, hexagonal, clean, feature-based modules?
5. **Any existing ADRs** — are there decision records to reference?

If the workspace already contains an architecture document and ADRs, extract this information from there instead of asking.

## What goes WHERE — avoid documentation duplication

**Tier Blueprint covers (ONLY):**
- Architecture & structure: how code is organized internally (layers, modules, scaffolding)
- Tech decisions: what libraries/frameworks and why (stack table, ADR references)
- Design patterns: how modules communicate, data flow, validation strategy
- Cross-cutting concerns: logging mechanism name, auth strategy, error handling approach

**DO NOT include (goes in src/README.md instead):**
- **Development Workflow** — `npm start`, `npm run test`, watch mode setup → belongs in README
- **Common Commands** — CLI commands, how to run migrations, scaffolding generators → belongs in README
- **Deployment & CI/CD** — docker builds, deployment pipelines, staging/prod setup → belongs in DevOps/Deployment docs or dedicated ADR
- **Step-by-step tutorials** — how to set up the project, install dependencies, first run → belongs in README or CONTRIBUTING.md
- **IDE/tool setup** — VSCode extensions, debugger config → belongs in README or .vscode/ directory
- **Environment variables reference** — list of all `.env` vars and defaults → belongs in `.env.example` or README


## Scaffolding strategy — conceptual not literal

**IMPORTANT:** The Tier Blueprint scaffolding is a **mental model**, not an exact code snapshot.

**Goal:** Show the organizational principle (how code is structured), not enumerate every file.

**What to do:**
- Use placeholders or representative examples when listing multiple similar items
- Show 2-3 examples of a pattern, then indicate "...more modules follow"
- Focus on explaining the **principle** (e.g., "one module per domain") rather than listing all domains


**Good pattern (conceptual):**
```
src/
├── modules/
│   ├── {domain}/        # one module per bounded domain
│   │   ├── domain/      # entities, aggregates
│   │   ├── application/ # use cases, commands
│   │   └── infra/       # controllers, adapters
│   ├── auth/            # example: authentication & authorization
│   ├── inventory/       # example: stock management
│   └── ...              # more domains follow the same pattern
├── shared/              # cross-module utilities
├── config/              # global configuration
└── main.ts              # entry point
```

**Why:** If a domain is added or removed in the future, the Blueprint stays valid. The pattern is timeless; the instances are not.

## Tone and writing style

- Use tables, bullets, and short sentences
- Each section should fit in one screen
- Prefer naming the pattern + one inline example over explaining the pattern in prose
- Cross-cutting concerns: name the mechanism, not the theory

---

# Document

The Tier Blueprint is a single Markdown file.

- **Location:** place it in the architecture folder (see workspace organization for the correct path)
- **File name pattern :** Include in the name `{tier-name}-blueprint.md` — e.g., `backend-blueprint.md`, `web-frontend-blueprint.md`, `cloud-functions-blueprint.md`
- **Template:** See [assets/template-tier-blueprint.md](assets/template-tier-blueprint.md)

---

# Verification

- [ ] The document fits in one screen per section — no section exceeds ~15 lines
- [ ] No code block exceeds 7 lines
- [ ] Every library in the stack table has a one-line purpose
- [ ] Scaffolding is in tree format with inline `# comments`
- [ ] **Scaffolding is conceptual**: uses {placeholders}, shows pattern with 1-2 examples, then "..." or {more} — NOT an exhaustive enumeration of current code
- [ ] Each layer in section 4 defines: responsibility + what it CANNOT do
- [ ] Cross-cutting concerns list mechanism + location, not theory
- [ ] Testing strategy defines what is NOT tested at each level
- [ ] All relevant ADRs are referenced, not duplicated
- [ ] **NO operational content** — no Development Workflow, deployment scripts, or CLI command lists (redirect to src/README.md)
- [ ] **NO tutorials or how-to guides** — step-by-step setup belongs in README, not here
