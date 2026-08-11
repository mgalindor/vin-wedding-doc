# Step 7: Assessment Review

## Goal

A panel of 3 specialists each reads the **complete component assessment** in a single pass, simultaneously. Their consolidated feedback is then synthesized by a senior architect who rewrites the affected sections.

This approach uses **4 subagent invocations total** (3 parallel reviews + 1 synthesis).

---

## Execution

**This step does NOT follow the standard single-subagent delegation pattern.**

### Phase A — Parallel Full-Document Reviews (3 subagents simultaneously)

Launch all 3 reviewers **at the same time**, each receiving the **full assessment document** and the **component path** (so they can verify claims against actual code). Each reviewer reads the entire assessment and produces a structured critique from their specialist perspective.

Wait for ALL 3 reviews before proceeding to Phase B.

### Phase B — Synthesis and Document Rewrite (1 subagent)

A single `architect` subagent receives all 3 reviews and:

1. Consolidates and deduplicates all concerns
2. Classifies each concern: **consensus** (raised by 2+ reviewers) or **specialist** (raised by 1)
3. Rewrites the affected sections incorporating validated improvements
4. Notes deferred concerns not addressed
5. Appends a `## Assessment Review Summary` section to the document

---

## Phase A: Reviewer Definitions

### Reviewer 1 — Software Architect

- **Agent**: `architect`
- **Persona**: Senior software architect specializing in code structure analysis, design patterns, module responsibilities, and system decomposition.
- **Review Focus**:
  - Is the responsibility classification (Step 6) accurate based on the evidence in previous sections?
  - Are the input interfaces complete — are there entry points in the code that were missed?
  - Is the capability list accurate and well-prioritized?
  - Are there code structure patterns (layering, module organization) not captured in the assessment?
  - Is the component's boundary well-defined — or does it have responsibilities that should belong elsewhere?
  - Are there coupling concerns visible from the interfaces and dependencies listed?

---

### Reviewer 2 — Data & Integration Specialist

- **Agent**: `architect`
- **Persona**: Data architect and integration specialist with expertise in database design, data modeling, ETL patterns, API contract design, and system integration patterns.
- **Review Focus**:
  - Is the data schema documentation complete and accurate?
  - Are the problematic legacy patterns correctly identified — are there patterns missed?
  - Are all datastores and their access patterns captured in the output interfaces?
  - Are integration points (external APIs, messaging) fully documented?
  - Are data ownership boundaries clear — which data does this component own vs. share?
  - Are there data consistency risks (eventual consistency, replication lag) not mentioned?

---

### Reviewer 3 — Technology Stack Specialist

- **Agent**: `architect`
- **Persona**: Expert in the specific technology stack identified in the Overview section. Specializes in the frameworks, libraries, and runtime listed in Step 1. Validates that technology-specific patterns and conventions are correctly identified.
- **Review Focus**:
  - Are the frameworks and libraries correctly identified with accurate purposes?
  - Are technology-specific configuration patterns correctly documented?
  - Are there framework-native features (auto-configuration, conventions, middleware) that the assessment missed?
  - Is the build tool usage and dependency management accurately described?
  - Are there technology-specific anti-patterns or deprecated usage patterns in the codebase that should be flagged?
  - Are the scheduler, messaging, and caching integrations using the technology's idiomatic patterns?

---

## Prompt Template for Each Reviewer (Phase A)

```
You are a [PERSONA].

Your task is to review the FULL component assessment from your specialist perspective.
You have access to the component's source code at: [COMPONENT PATH]
Read the assessment, then VERIFY key claims against the actual source code.

Full component assessment:
---
[FULL ASSESSMENT DOCUMENT]
---

Produce your critique using this format:

# Assessment Review — [Reviewer Role]

## Overall Assessment
- **Completeness**: Is the assessment thorough? What major elements are missing?
- **Accuracy**: Do the documented findings match what is actually in the code?
- **Cross-section consistency**: Are there contradictions between sections?
- **Technical Viability**: [Accurate / Partially Accurate / Inaccurate] — one-sentence assessment

## Section-by-Section Findings
For each section that has findings from your specialist perspective:

### [Section Name]
- **Pros**: What is documented well (be specific)
- **Cons / Concerns**: What is missing, inaccurate, or incomplete (be direct)
- **Suggested Changes**: Concrete additions or corrections

(Skip sections where you have no concerns)

Your review focus:
[REVIEW FOCUS]

Guidelines:
- VERIFY against source code — do not accept the assessment at face value
- Be direct and specific — reference actual files, classes, or configurations
- If something is documented but you cannot verify it in the code, flag it
- If you find something in the code not mentioned in the assessment, flag it
```

---

## Prompt Template for Synthesis Subagent (Phase B)

```
You are a senior architect tasked with synthesizing 3 specialist reviews and producing an improved version of the component assessment.

Full component assessment (original):
---
[FULL ASSESSMENT DOCUMENT]
---

Reviews from 3 specialists:
[REVIEWER 1 — Software Architect]
[REVIEWER 2 — Data & Integration Specialist]
[REVIEWER 3 — Technology Stack Specialist]

Follow this process:
1. Consolidate all concerns, deduplicate overlapping observations
2. Classify each:
   - **Consensus concern**: raised by 2+ reviewers → MUST be addressed
   - **Specialist concern**: raised by 1 reviewer → address if technically sound
3. For sections with concerns, produce a rewritten version
4. For sections with no concerns, return them unchanged
5. Append a `## Assessment Review Summary` section

Output format:
- The complete improved assessment (all sections, ready to replace the original)
- After the document: a "Synthesis Decisions" block summarizing:
  - Consensus concerns addressed (and in which sections)
  - Specialist concerns addressed (with rationale)
  - Deferred concerns (with justification)

Rules:
- Preserve all content that received no critical feedback
- Improvements must ADD accuracy and completeness; never reduce existing valid content
- Keep terminology consistent throughout
- The Assessment Review Summary table: | Section | Concerns | Changes Made | Deferred |
```

---

## Output

### Assessment document (single update)

After Phase B completes, replace the assessment file entirely with the synthesized output. The updated document includes:

- All `##` sections with improvements where warranted
- A new `## Assessment Review Summary` section at the end with a table: `| Section | Concerns | Changes Made | Deferred |`
- Front matter `progress` updated: `assessment-review` → `done`
- Front matter `version` incremented (MINOR bump) and `updated` date refreshed

### Review Log (optional)

If the orchestrating workflow requires traceability, create a companion file named `{component-name}-assessment-review-log.md` with all 3 reviewer outputs and synthesis decisions.
