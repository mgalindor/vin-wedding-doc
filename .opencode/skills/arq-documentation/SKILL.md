---
name: arq-documentation
description: "Provides the arc42 documentation model Trigger: When generating, editing, or reviewing an architecture document , architecture documentation, architecture overview or about arch42 architecture documentation model, style or template or wants to structure architectural documentation"
user-invocable: false
metadata:
    type: skill
    version: "1.0.0"
    updated-at: "2026-04-07"
---

# Architecture Documentation Model

This skill describes the **arc42** template — a pragmatic framework for documenting software architecture. It provides the section catalog, applicability rules, and references to the detail files for each section.

---

## Core Philosophy

- **Communication first.** A brilliant design nobody understands is a failed design. Every section has a clear audience. Document only what that audience needs to know.
- **Just enough.** Never add a section because the template includes it — add it because someone needs to read it.
- **Sections, not chapters.** Each section answers one specific question about the system. Keep them focused and scannable.

---

## The 12 Sections

| # | Section | Core Question | Primary Audience |
|---|---------|--------------|-----------------|
| 1 | Introduction and Goals | What is this system for, and what quality attributes drive the architecture? | All |
| 2 | Architecture Constraints | What are the non-negotiable boundaries? | Architects, Managers |
| 3 | Context and Scope | What is inside vs. outside the system? Who interacts with it? | All |
| 4 | Solution Strategy | What are the key technology and structural decisions, and why? | Technical + Management |
| 5 | Building Block View | What are the top-level containers and their responsibilities? | Developers, Architects |
| 6 | Runtime View | How do the containers behave at runtime for the critical scenarios? | Developers, Architects |
| 7 | Deployment View | Where does each container run in the infrastructure? | DevOps, Architects |
| 8 | Cross-cutting Concepts | Which patterns apply across multiple containers (auth, logging, error handling)? | Developers |
| 9 | Architecture Decisions | What significant decisions were made and why? (index of ADRs) | All |
| 10 | Quality Requirements | What are all the quality attributes with measurable acceptance criteria? | QA, Architects |
| 11 | Risks and Technical Debts | What are the known risks and debts with mitigation strategies? | Management, Architects |
| 12 | Gap Analysis (extra) | What is the delta between current and target architecture? Only needed when there is a comparison between current and target states. | Architects, Management |
---

## Applicability by Project Type

Not all sections can be produced for every project type. Use this table as a guide:

| Section | Greenfield | Brownfield Snapshot (as-is) | Brownfield Target (to-be) |
|---------|-----------|----------------------------|--------------------------|
| 1. Introduction and Goals | ✅ Full | ❌ Skip | ✅ Full (Only the one listed in brief + kickoff) |
| 2. Architecture Constraints | ✅ Full | ⚠️ Inherited constraints only — original rationale unknown | ✅ Full (inherited + new) |
| 3. Context and Scope | ✅ Full | ✅ Full (reverse-engineered) | ✅ Full |
| 4. Solution Strategy | ✅ Full | ⚠️ Inferred from patterns — cannot confirm original rationale | ✅ Full |
| 5. Building Block View | ✅ Full | ✅ Full (reverse-engineered from code) | ✅ Full |
| 6. Runtime View | ✅ Full | ✅ Full (observed from code flows) | ✅ Full |
| 7. Deployment View | ✅ Full | ❌ Skip | ✅ Full |
| 8. Cross-cutting Concepts | ✅ Full | ✅ Full (patterns observed in code) | ✅ Full |
| 9. Architecture Decisions | ✅ Full | ⚠️ Only decisions with available context | ✅ Full |
| 10. Quality Requirements | ❌ Skip | ❌ Cannot reliably infer from code alone | ✅ Full |
| 11. Risks and Technical Debts | ✅ Full | ✅ Full (risks visible from code and constraints) | ✅ Full |
| 12. Gap Analysis (extra) | ❌ N/A | ✅ Full (current vs. target delta) | ✅ Full |

**Legend:** ✅ Include fully | ⚠️ Include with caveats — note limitations inline | ❌ Skip

---

## Document Template

The architecture document template is in [assets/template.md](assets/template.md).

It contains all 12 section placeholders with inline comments explaining purpose, motivation, format, and examples for each. **Do NOT copy the entire template at once** fill each section iteratively as you gather context and user input for that section. 

---

## Section Detail Files

Detailed instructions for what to gather, what to ask, guidelines, and tips for each section:

```
resources/
├── section-01-introduction-and-goals.md
├── section-02-architecture-constraints.md
├── section-03-context-and-scope.md
├── section-04-solution-strategy.md
├── section-05-building-block-view.md
├── section-06-runtime-view.md
├── section-07-deployment-view.md
├── section-08-crosscutting-concepts.md
├── section-09-architecture-decisions.md
├── section-10-quality-requirements.md
├── section-11-risks-and-technical-debts.md
└── section-12-gap-analysis.md        # optional — brownfield projects only
```

**Critical rule:** Load each file **only immediately before** processing that section. Never load all section files in advance or in bulk — it overloads the context window and causes confusion between sections.
