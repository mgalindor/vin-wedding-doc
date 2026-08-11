# Architecture Constraints

Load the **section detail file** for `Architecture Constraints` from the architecture documentation skill.

Produce the markdown content for this section and return it ready to append to `architecture.md`.

## Context to Gather

Search the workspace for:
- Statements of work or contracts for imposed technologies or standards
- Kickoff documents for organizational and timeline constraints
- Technical interview notes for existing technology stack or platform requirements
- PRD for compliance or regulatory requirements
- Discovery documents for integration requirements with existing systems

## Interactive Approach

Ask the user:
1. **Technical Constraints**: "Are there imposed technologies, platforms, programming languages, databases, or infrastructure providers? Any compliance requirements (GDPR, HIPAA, SOC2)?"
2. **Organizational Constraints**: "What team size and skill constraints exist? Are there timeline restrictions, budget limits, or vendor dependencies? Does Conway's Law apply (team structure dictating architecture)?"
3. **Conventions**: "Are there coding standards, naming conventions, documentation standards, or architectural patterns the organization mandates?"

All inputs are optional — use gathered context to identify constraints if the user skips.