# Introduction and Goals

Load the **section detail file** for `Introduction and Goals` from the architecture documentation skill.

Produce the markdown content for this section and return it ready to append to `architecture.md`.

## Context to Gather

Search the workspace for:
- Product requirement documents (PRD) for features and business objectives
- Project brief or README for project overview and objectives
- Functional and technical interview notes for stakeholder expectations
- Kickoff documents for project goals and agreement scope
- Discovery or analysis documents for business context

## Interactive Approach

Ask the user:
1. **Business Goals**: "What are the 3-5 main business goals this system must achieve?"
2. **Architecture-Significant Requirements**: "Which features or requirements directly influence the system's structure or technology choices?" (Not all features — only those that drive architectural decisions)
3. **Quality Goals**: "What are the top 3-5 quality attributes that most impact the architecture? (e.g., performance, security, scalability, maintainability)"
4. **Stakeholders**: "Who are the key stakeholders? What does each expect from the architecture documentation?"

All inputs are optional — use gathered context to propose defaults if the user skips.

