<!--
TEMPLATE: Functional Snapshot
PURPOSE: Executive summary of what an existing system does and what capabilities it offers.
         Designed for both technical and non-technical stakeholders.
AUDIENCE: Product owners, architects, developers, and business stakeholders.
PLACEHOLDER FORMAT: {variable-name} — replace with actual values derived from component assessments.
COMMENTS: HTML comments (like this one) provide guidance for filling each section.
          Remove all comments from the final document.
SNAPSHOT NOTICE: This document must always include a prominent date and snapshot warning.
                 Do NOT remove the snapshot notice.
TONE: Clear and accessible. Avoid jargon. The System Overview must be readable by a non-technical person.
-->

---
title: "Functional Snapshot — {system-name}"
date: {YYYY-MM-DD}
type: reference
scope: internal
version: 1.0.0
updated: {YYYY-MM-DD}
snapshot: true
---

# Functional Snapshot — {system-name}

> **Snapshot notice**: This document describes the system's capabilities **as of {YYYY-MM-DD}**.
> It was produced through archaeological analysis of the existing codebase.
> As the system evolves, this document will become outdated and should be regenerated.

<!-- Section: System Overview
PURPOSE: A plain-language description of what this system does and who it serves.
DERIVED FROM: Component Responsibility sections and project brief / README.
NOTES:
- Write 1-2 paragraphs maximum.
- Avoid technical jargon — this section must be understandable by a product owner or business stakeholder.
- Answer: what problem does this system solve? who uses it? what does it enable?
-->
## System Overview

{system-overview-paragraph}

<!-- Section: System Capabilities
PURPOSE: Structured list of what the system can do, organized by domain or component.
DERIVED FROM: Main Capabilities lists from all component assessments.
NOTES:
- Group capabilities by logical domain (not by component name, unless the components map to domains).
- Use action-oriented language: "Manage X", "Process Y", "Send Z".
- Each capability should be concrete and verifiable — not generic.
- If capabilities belong to a single component, group by component name.
- Include 5-20 capabilities total across all groups.
-->
## System Capabilities

<!-- Repeat this subsection for each capability group -->
### {capability-group-name}

- {capability-description}
- {capability-description}
- {capability-description}

<!-- Section: Component Summary
PURPOSE: One-line description of each component and its primary role in the system.
DERIVED FROM: Component Responsibility section of each assessment.
NOTES:
- Include every component analyzed in the archaeological process.
- Primary Responsibility should match the responsibility type from the assessment.
- Keep descriptions to one line — link to the assessment for detail.
-->
## Component Summary

| Component | Primary Responsibility | Main Capabilities Summary |
|---|---|---|
| {component-name} | {responsibility-type} | {2-3 word summary of main capabilities} |

<!-- Section: Key Integrations
PURPOSE: Summary of the most important external systems this application integrates with.
DERIVED FROM: Output Interfaces sections across all assessments.
NOTES:
- List only significant external integrations — datastores, third-party APIs, identity providers.
- Exclude internal component-to-component communication (that belongs in the architecture snapshot).
- Add a brief note on the purpose of each integration.
-->
## Key Integrations

| System | Type | Purpose |
|---|---|---|
| {system-name} | {Database / External API / Identity Provider / Cloud Service / etc.} | {brief purpose} |
