# Section 1: Introduction and Goals

## Goal

Define the business goals, architecture-significant requirements, top quality goals, and key stakeholders that shape the architecture.

## Guidelines

### Business Goals
- Express goals in business terms, not technical terms
- Each goal should be concise: a name and a short description
- Limit to 3-5 goals maximum

### Requirements Overview
- Include ONLY Architecture-Significant Requirements (ASRs)
- An ASR is a requirement that constrains or justifies a structural or technology decision
- Group related user stories into a single expression when they share the same architectural concern
- If a requirement does not influence any architectural decision, it does not belong here

### Quality Goals
- Order by architectural impact (highest first)
- Each quality goal needs a brief, measurable scenario
- These are NOT project goals (timeline, budget) — they are system quality attributes
- The top 3-5 listed here are expanded in detail in Section 10 (Quality Requirements)

### Stakeholders
- Include roles, not just names
- Document what each stakeholder expects from the architecture documentation specifically
- Consider: developers, operations, product owners, security team, management, end users

## Template Section

Use the `## Introduction and Goals` section from the template, including all subsections:
- Business Goals (bullet list)
- Requirements Overview (bullet list of ASRs)
- Quality Goals (priority table with scenario)
- Stakeholders (table with role, contact, expectations)

## Tips
- Only include facts and comprobable information — avoid business goals, requirement or quality assumptions 
- Give a compact summary of requirements and driving forces!
