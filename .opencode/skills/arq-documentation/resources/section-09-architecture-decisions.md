# Section 9: Architecture Decisions

## Goal

Record significant architectural decisions as ADRs (Architecture Decision Records) with full context, options considered, rationale, and consequences. Save the decision record in its respective folder.

## Guidelines

### What deserves an ADR
- Decisions that are costly to reverse (affect the structure, quality characteristics)
- Decisions that affect multiple building blocks
- Decisions where multiple viable alternatives existed
- Decisions driven by constraints or quality goals
- Decisions that team members frequently question — "why did we choose X?"

### Relationship to Solution Strategy
- Solution Strategy SUMMARIZES decisions in a table
- This section EXPANDS each significant decision into a full ADR
- Reference Solution Strategy entries — do not duplicate the summary

## Template Section

Use the `## Architecture Decisions` section from the template with:
- Decision index table (ID, Decision, Status, Date, ADR File link, Rationale)

**Critical**: ADRs are stored as EXTERNAL documents — NOT embedded inline here. This section is an index with links to the external ADR files stored in the decision records folder.
