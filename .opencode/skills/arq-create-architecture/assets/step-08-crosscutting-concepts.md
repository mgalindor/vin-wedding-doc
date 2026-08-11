# Cross-cutting Concepts

Load the **section detail file** for `Cross-cutting Concepts` from the architecture documentation skill.

Produce the markdown content for this section and return it ready to append to `architecture.md`.


## Context to Gather

Search the workspace for:
- Quality goals from the Introduction (read the current architecture document)
- Constraints from Architecture Constraints for mandated standards or patterns
- Building blocks from the Building Block View for scope of cross-cutting impact
- Technical interview notes for existing patterns or conventions
- PRD for security or compliance requirements
- Decision records for technology patterns

## Interactive Approach
Before 
- Drive the user on common cross cutting concerns

Ask the user:
1. **Key Concerns**: "Which cross-cutting concerns are most relevant for this system? (e.g., authentication/authorization, error handling, logging/observability, caching, API versioning, data validation, configuration management, internationalization)"
2. **Existing Patterns**: "Are there established patterns or frameworks already in use for any of these?"
3. **Priorities**: "Which concepts have the highest architectural impact and should be documented in detail?"

All inputs are optional.