<!--
  TEMPLATE: Platform Technical Specification
  ==========================================
  PURPOSE: Design document for platform tasks — infrastructure, pipelines, networking,
           environment setup, repository configuration, and other non-functional technical work.
           Not for user-facing features (use dev.create-tech-spec for those).

  HOW TO USE:
  1. Fill in all {placeholder} values with real content.
  2. Remove HTML comments (<!-- ... -->) before publishing.
  3. Remove optional sections that do not apply to the task.
  4. Accepted actions in Resources table: CREATE | MODIFY | DELETE

  PLACEHOLDER FORMAT: {placeholder-name} — descriptive, kebab-case

  SECTIONS OVERVIEW:
  - Goal            : One sentence — what the task achieves
  - Context         : Current state, trigger, constraints (3 bullets max)
  - Scope           : What is in/out, affected environments
  - Resources       : Inventory of components with CREATE/MODIFY/DELETE actions
  - Steps           : Ordered, verifiable implementation steps
  - Configuration   : Parameters, variables, secrets (optional)
  - Dependencies    : Pre-requisites before execution (optional)
  - Security        : IAM, network rules, secrets (optional)
  - Diagram         : Visual representation of topology or flow (optional)
  - Rollback Plan   : How to undo each step (optional)
  - Acceptance Criteria : Testable conditions confirming completion
-->

---
title: "{task-name} — Platform Technical Specification"
date: YYYY-MM-DD
type: specification
scope: internal
status: draft
---

<!-- GOAL: One sentence, max 30 words. State what the task achieves and why it is needed.
     Example: "Configure a GitHub Actions pipeline to automate testing and deployment
     of the backend service to Railway on every push to main." -->
# Goal

{One sentence — max 30 words. What this task achieves and why it is needed.}

<!-- CONTEXT: Max 3 bullets. No prose. Cover current state, what triggered the task, and constraints.
     - Current state: describe what infrastructure or tooling exists today.
     - Trigger: what event, decision, or gap caused this task to be needed.
     - Constraints: tool, cost, access, or time limits that shape the solution. -->
# Context

- Current state: {what exists today}
- Trigger: {what caused this task to be needed}
- Constraints: {tool, cost, access, or time limits — or "none identified"}

<!-- SCOPE: List specific resources, services, environments, or capabilities that are in scope.
     Be explicit about what is out of scope to prevent scope creep.
     Affected environments: dev | staging | prod | all -->
# Scope

**In scope:**
- {item}

**Out of scope:**
- {item}

**Affected environments:** {dev | staging | prod | all}

<!-- RESOURCES: Inventory of every component this task creates, modifies, or removes.
     Action must be one of: CREATE | MODIFY | DELETE
     Examples: GitHub repository, VPC, CI/CD pipeline, IAM role, DNS record, environment variable set -->
# Resources

| Resource | Action | Description |
|---|---|---|
| {resource-name} | CREATE | {what it is and its purpose} |
| {resource-name} | MODIFY | {what changes and why} |
| {resource-name} | DELETE | {why it is being removed} |

<!-- STEPS: Ordered implementation steps. Each step must be independently executable.
     Include a Verify line so the engineer knows how to confirm the step succeeded before moving on.
     If a step requires a decision, document the decision criteria inline. -->
# Steps

1. **{step-title}**
   - {detail or sub-step}
   - Verify: {how to confirm this step completed successfully}

2. **{step-title}**
   - {detail or sub-step}
   - Verify: {how to confirm this step completed successfully}

<!-- CONFIGURATION — Optional section
     Include configuration snippets, YAML blocks, environment variables, or IaC excerpts
     when they clarify the design intent. Label each block with its context.
     Remove this section if there is no configuration to document. -->
# Configuration

```yaml
# {context label — e.g., GitHub Actions workflow, Terraform variables, Environment config}
{parameter}: {value-or-type}  # {description, constraints, or allowed values}
```

<!-- DEPENDENCIES — Optional section
     List what must exist before this task can start: tools, permissions, services, or prior tasks.
     Remove this section if there are no dependencies. -->
# Dependencies

| Dependency | Type | Notes |
|---|---|---|
| {name} | tool / permission / task / service | {what is needed and why it must exist first} |

<!-- SECURITY & ACCESS — Optional section
     Document IAM roles, network rules, secret management, and compliance requirements.
     Include only what is relevant — skip sub-items that do not apply.
     Remove this section entirely if the task has no security implications. -->
# Security & Access

- **IAM / Permissions**: {roles or policies required to execute this task}
- **Network rules**: {firewall rules, ingress/egress, VPC peering — or "not applicable"}
- **Secrets**: {list of secrets, where they are managed, who has access}
- **Compliance notes**: {regulatory or policy constraints — or "none"}

<!-- DIAGRAM — Optional section
     Include a Mermaid diagram when the task involves topology, pipeline stages, network flows,
     or multi-system connections. Remove this section entirely if there is nothing structural to visualize. -->
# Diagram

```mermaid
{diagram code}
```

<!-- ROLLBACK PLAN — Optional section
     For each step, describe the exact action to undo it if the implementation needs to be reversed.
     Essential for tasks that affect production environments.
     Remove this section for low-risk or fully reversible tasks where rollback is trivial. -->
# Rollback Plan

| Step | Rollback Action |
|---|---|
| {step-1-title} | {exact action to undo this step} |
| {step-2-title} | {exact action to undo this step} |

<!-- ACCEPTANCE CRITERIA: Testable conditions confirming the task is complete and correct.
     Use commands, observable states, or measurable outcomes — not aspirational statements.
     Good: "terraform plan shows 0 changes after apply"
     Bad:  "infrastructure is configured correctly" -->
# Acceptance Criteria

- [ ] {testable condition — command, observable state, or measurable outcome}
- [ ] {testable condition — command, observable state, or measurable outcome}
