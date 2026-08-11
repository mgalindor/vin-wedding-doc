---
name: pm-create-project-brief
description: "Generates or updates the Project Brief by collecting initial project details from the kickoff folder and following the established project brief template Trigger: When user asks to create, write, or update the project brief or README for a project"
user-invocable: false
metadata:
    version: "1.0.0"
---


# Source of Truth

All project-specific information **must** be gathered from the **kickoff folder** defined in the workspace organization before writing anything:

- Read **every file** inside the kickoff folder (meeting notes, transcripts, agreements, etc.)
- If the folder is empty or contains only `.gitkeep`, ask the user to provide the kickoff information before proceeding
- Never invent or assume project-specific details (names, dates, scope, team members) — use only what is in the kickoff folder

# Output Target

The Project Brief is always written to the **project brief file** at the repository root (infer the filename from the workspace organization). It is the project's public presentation card and client-facing entry point to the repository.

- Do NOT create a separate Project Brief file
- Fill in the existing file in place — do not change the section structure
- Preserve the front-matter fields: `client`, `project`, `summary`,`project-type`, `type: project-brief`, `date`, `scope: client`

# Sections Mandatory Mapping

| README section             | Source in kickoff docs                                      |
| -------------------------- | ----------------------------------------------------------- |
| Project Overview           | Meeting notes summary and context from kickoff              |
| Project Challenges         | Pain points, risks, and current situation described in kickoff |
| Kickoff Docs               | List of files present in the kickoff folder                 |
| Proposal / Project Objectives | Goals and objectives extracted from kickoff materials    |
| Deliverables (Outputs)     | Tangible artifacts: docs, code, environments, etc.          |
| Deliverables (Outcomes)    | Business results and expected improvements                  |
| Out of Scope               | Explicitly excluded items from kickoff discussion           |
| Stakeholders               | Client-side contacts mentioned in kickoff docs              |
| Team Members               | Engagement team from kickoff docs                           |
| Timeline & Effort          | Sprint plan, dates, and effort allocation from kickoff      |
| Gantt chart                | Rebuild based on team members and timeline data             |
| Assumptions                | Assumptions recorded during kickoff                         |

# Language

Follow project language consistency.

# Workflow

Follow the steps defined in [assets/workflow.md](assets/workflow.md) strictly and in order.

# Document

The README.md Project Brief is built from the template:

- **Template**: See [assets/template-readme.md](assets/template-readme.md) for the full Project Brief/README template with placeholders and section guidance.

# Verification

In order to verify that the skill is correctly implemented, you can follow these steps:

- **Checklist**: [Verification Checklist](assets/checklist.md)
