# Quality Requirements

Load the **section detail file** for `Quality Requirements` from the architecture documentation skill.

Produce the markdown content for this section and return it ready to append to `architecture.md`.

## Context to Gather

Search the workspace for:
- Quality goals from the Introduction (read the current architecture document — the top 3-5 are expanded here)
- PRD for non-functional requirements
- Technical interview notes for performance, security, or reliability expectations
- Analysis documents for SLAs, SLOs, or acceptance criteria
- Constraints from the Architecture Constraints for compliance-driven quality requirements

## Interactive Approach

Ask the user:
1. **Coverage Check**: "Looking at the ISO 25010 categories (functional suitability, performance, compatibility, usability, reliability, security, maintainability, portability), are there quality requirements beyond the top goals from the Introduction?"
2. **Measurable Scenarios**: "For each quality requirement, what is the specific, measurable acceptance scenario? (e.g., 'API response time < 200ms at p95 under 1000 concurrent users')"
3. **Change Scenarios**: "Are there change/evolution scenarios? (e.g., 'Adding a new payment provider should take less than 3 development days')"

All inputs are optional.