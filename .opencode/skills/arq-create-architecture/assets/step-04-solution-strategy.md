# Solution Strategy

Load the **section detail file** for `Solution Strategy` from the architecture documentation skill.

Produce the markdown content for this section and return it ready to append to `architecture.md`.

## Context to Gather

Search the workspace for:
- Decision records for technology choices already made
- PRD for feature requirements that influence technology selection
- Quality goals defined in Step 1 (read the current architecture document)
- Constraints defined in Step 2 (read the current architecture document)
- Technical interview notes for technology preferences or evaluations
- Discovery documents for platform or framework evaluations

## Interactive Approach

Ask the user:
1. **Technology Decisions**: "What are the key technology choices? (programming languages, frameworks, databases, cloud providers, messaging systems)"
2. **Architectural Style**: "What decomposition pattern will the system follow? (monolith, modular monolith, microservices, serverless, event-driven, REST etc.)"
3. **Architectural Patterns**: "Are there specific architectural patterns being applied? (e.g., layered architecture, hexagonal architecture, CQRS, event sourcing)"
4. **Quality Strategy**: "For each quality goal from the Introduction, what specific decision or approach addresses it?"
5. **Organizational Decisions**: "Are there relevant organizational decisions? (team structure, development process, deployment strategy)"

All inputs are optional.