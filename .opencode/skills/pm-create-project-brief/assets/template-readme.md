<!--
=============================================================================
  PROJECT BRIEF / README TEMPLATE  —  Project Brief (Project Presentation Card)
=============================================================================
  HOW TO USE:
  1. Replace every {placeholder} with the actual project value.
  2. Read the <!-- comment --> blocks for guidance on each section, then
     remove those comments from the final document.
  3. Do NOT remove sections — mark missing data as "TBD" when unavailable.
  4. The file must be saved as README.md at the repository root.

  PLACEHOLDER FORMAT:  {kebab-case-name}
  OPTIONAL SECTIONS:   Marked with <!-- Optional section -->

  SECTIONS OVERVIEW:
  - Front matter        → Project metadata for tooling and indexing
  - Project Overview    → Context and purpose of the project
  - Project Challenges  → Current pain points and critical risks
  - Kickoff Docs        → Links to documents in 01-kickoff/
  - Proposal            → Objectives and goals
  - Deliverables        → Outputs, outcomes, and out-of-scope items
  - Stakeholders        → Client-side contacts
  - Team Members        → Engagement team
  - Timeline            → Sprint plan, effort allocation, Gantt chart
  - Assumptions         → Constraints and prerequisites assumed true
=============================================================================
-->

---
client: {client-name}
project: {project-short-description}
summary: {one-sentence-summary-of-the-project}
project-type: {greenfield|brownfield|other}
type: project-brief
date: {YYYY-MM-DD}
scope: client
project-start-date: {project-start-date}
project-end-date: {project-end-date}
---

<!-- Project name: Official project name as agreed with the client. -->
# {Project Name}

## Project Overview

<!-- 
  Write 2–4 paragraphs that explain:
  - Business context: why this project exists
  - What the project consists of at a high level
  - The expected impact or transformation
  Example length: 100–200 words.
-->

{project-overview-paragraph-1}

{project-overview-paragraph-2}

## Project Challenges

### Current Situation

<!-- 
  List the current pain points, limitations, or problems the client faces.
  Minimum 2 bullet points. Be specific and factual.
  Example: "**Vendor dependency:** Critical infrastructure is hosted in the vendor's tenant with no direct client access."
-->

- **{challenge-1-title}:** {challenge-1-description}
- **{challenge-2-title}:** {challenge-2-description}
- **{challenge-3-title}:** {challenge-3-description}

### Critical Risk

<!-- 
  Describe the most critical risk if the project is not executed.
  1–3 sentences. Focus on business impact.
-->

{critical-risk-description}

## Kickoff Docs

<!-- 
  List all documents available in the 01-kickoff/ folder.
  One row per document. Link using a relative path.
  Example: | Kickoff Meeting | Current situation and objectives | [kickoff-20251126.md](01-kickoff/kickoff-20251126.md) |
-->

| Name | Goal | Location |
|------|------|----------|
| {doc-1-name} | {doc-1-goal} | [{doc-1-filename}](01-kickoff/{doc-1-filename}) |

## Proposal

<!-- 
  Summarize the proposed solution and approach in 1–2 paragraphs before
  listing the objectives. This bridges the challenges above with the goals below.
-->

{proposal-summary}

### Project Objectives

<!-- 
  List the main project objectives. Each objective should have:
  - A short title (bold)
  - A 1–3 sentence explanation
  Minimum 1 objective, maximum 5.
-->

#### 1. {objective-1-title}

{objective-1-explanation}

<!-- Optional section -->
#### 2. {objective-2-title}

{objective-2-explanation}

<!-- Optional section -->
#### 3. {objective-3-title}

{objective-3-explanation}

## Deliverables

### Outputs

<!-- 
  Tangible artifacts the team will produce and hand over.
  Examples: documents, code, pipelines, deployed environments.
  Minimum 2 items.
-->

- **{output-1-title}:** {output-1-description}
- **{output-2-title}:** {output-2-description}
- **{output-3-title}:** {output-3-description}

### Outcomes

<!-- 
  Business results or improvements that the client will experience as a
  consequence of the outputs. Think in terms of "so that..." statements.
  Minimum 2 items.
-->

- **{outcome-1-title}:** {outcome-1-description}
- **{outcome-2-title}:** {outcome-2-description}

### What's Out of Scope

<!-- 
  Explicitly list what is NOT included in this engagement.
  This prevents scope creep and sets clear expectations.
  Minimum 2 items.
-->

- {out-of-scope-1}
- {out-of-scope-2}
- {out-of-scope-3}

## Stakeholders

<!-- 
  Client-side and third-party contacts relevant to this project.
  Do not include the engagement team here — that goes in Team Members below.
  Fields: Name | Contact (email/phone) | Role | Company
-->

| Name | Contact | Role | Company |
|------|---------|------|---------|
| {stakeholder-1-name} | {stakeholder-1-contact} | {stakeholder-1-role} | {stakeholder-1-company} |
| {stakeholder-2-name} | {stakeholder-2-contact} | {stakeholder-2-role} | {stakeholder-2-company} |

## Team Members

<!-- 
  Members of the engagement/delivery team.
  Fields: Name | Contact | Role | Company | Responsibilities
-->

| Name | Contact | Role | Company | Responsibilities |
|------|---------|------|---------|------------------|
| {member-1-name} | {member-1-contact} | {member-1-role} | {member-1-company} | {member-1-responsibilities} |
| {member-2-name} | {member-2-contact} | {member-2-role} | {member-2-company} | {member-2-responsibilities} |

## Timeline and Effort Allocation

<!-- 
  Summarize the overall timeline parameters.
  Fill in the three bullet points and rebuild the Mermaid Gantt chart to
  reflect the actual team and dates.
-->

- **Duration:** {n-sprints} sprints ({n-weeks} weeks)
- **Sprint Duration:** {sprint-duration} weeks per sprint
- **Start Date:** {start-date-month-year}

<!-- 
  Gantt chart: Update section names, person names, and date ranges to match
  the actual team and project timeline.
  dateFormat: YYYY-MM-DD | axisFormat: %m/%d
  Each row: {Label} :{alias}, {start-date}, {duration}
-->

```mermaid
gantt
    title {project-name} Timeline
    dateFormat YYYY-MM-DD
    axisFormat %m/%d

    section {team-section-1-name}
    {member-1-name} ({member-1-role})   :{alias-1}, {start-date}, {duration-weeks}w

    section {team-section-2-name}
    {member-2-name} ({member-2-role})   :{alias-2}, {start-date}, {duration-weeks}w
```

## Assumptions

<!-- 
  List all conditions assumed to be true for the project to succeed as scoped.
  These become a basis for change management if assumptions prove false.
  Minimum 2 items.
-->

- **{assumption-1-title}:** {assumption-1-description}
- **{assumption-2-title}:** {assumption-2-description}
- **{assumption-3-title}:** {assumption-3-description}
