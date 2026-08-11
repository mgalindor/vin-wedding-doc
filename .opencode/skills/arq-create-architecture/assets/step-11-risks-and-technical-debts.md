# Risks and Technical Debts

Load the **section detail file** for `Risks and Technical Debts` from the architecture documentation skill.

The section detail file contains: the section purpose, guidelines on what to include, what to avoid, format conventions, and tips.

Produce the markdown content for this section and return it ready to append to `architecture.md`.

## Context to Gather

Search the workspace for:
- All previous sections of the architecture document (risks emerge from decisions made throughout)
- Decision records for trade-offs that introduce risk
- Technical interview notes for known pain points
- Discovery or analysis documents for identified risks
- PRD for scope-related risks
- Constraints from the Architecture Constraints for constraint-related risks

## Interactive Approach

Ask the user:
1. **Known Risks**: "What technical risks do you see? (e.g., single points of failure, vendor lock-in, scalability limits, skill gaps)"
2. **Technical Debt**: "Is there known technical debt? (e.g., legacy integrations, deferred refactoring, missing tests, outdated dependencies)"
3. **Mitigation Ideas**: "For each risk, what mitigation strategy would you propose?"

All inputs are optional.