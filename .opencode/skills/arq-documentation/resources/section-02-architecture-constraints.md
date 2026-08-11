# Section 2: Architecture Constraints

## Goal

Document all constraints that limit the architect's freedom of design. These are non-negotiable boundaries (or boundaries that require explicit negotiation to change).

## Guidelines

- Constraints are FACTS, not decisions — they exist before the architect starts designing
- Distinguish between truly non-negotiable constraints and preferences
- Each constraint should have a clear, specific description — avoid vague entries
- Common technical constraints: cloud provider, programming language, database engine, compliance standards, existing API contracts
- Common organizational constraints: team size, skill gaps, timeline, release schedule, vendor lock-in
- Common conventions: coding style guides, branching strategy, API design standards, documentation format

## Template Section

Use the `## Architecture Constraints` section from the template with three tables:
- Technical Constraints (ID, Constraint, Description)
- Organizational Constraints (ID, Constraint, Description)
- Conventions (ID, Convention, Description)

## Tips
- Consider the constraints of other systems within the organization!
- Clarify the consequences of constraints!
- Document organizational constraints!
- Document design and development constraints!
- Differentiate different categories of constraints!
