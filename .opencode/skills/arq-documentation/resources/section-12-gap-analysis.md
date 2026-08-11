# Section 12: Gap Analysis

> **Optional section** — include only when there is a comparison between a current state (as-is) and a target state (to-be). Typical scenario: brownfield projects where an existing system needs to evolve toward a defined architecture target.

## Goal

Identify and communicate the architectural delta between the current state and the target state. Answer: *what needs to change, how significant is each change, and in what order should it be addressed?*

## Guidelines

### How to structure the analysis

Organize gaps by **architectural area** — not by container, not by task. Each area corresponds to a cross-cutting concern or a structural dimension of the architecture. Typical areas:

- **Structure** — containers added, removed, split, merged, or renamed
- **Data** — schema changes, data migrations, storage technology changes
- **Integrations** — external APIs added, retired, or replaced; protocol changes
- **Security** — auth model changes, encryption, secrets management
- **Cross-cutting Concepts** — logging, error handling, configuration management
- **Deployment & Infrastructure** — topology changes, cloud migration, containerization
- **Quality Attributes** — gaps between current behavior and target measurable scenarios

Not all areas will have gaps — skip areas where current and target are equivalent.

### Describing each gap

For each gap, capture:
- **Current**: what exists today (factual, from archaeology)
- **Target**: what the architecture requires (from target design)
- **Gap**: the specific delta — be precise ("no auth on internal APIs" not "security is weak")
- **Impact**: High / Medium / Low — architectural significance, not effort
- **Dependency**: which other gaps must be resolved first (use gap IDs)

### Sequencing recommendation

After the gap tables, include a sequencing recommendation. Group gaps into waves based on:
1. **Foundational gaps** — must be resolved first because others depend on them (e.g., auth infrastructure before securing individual APIs)
2. **High-impact gaps** — address early to reduce risk
3. **Incremental improvements** — lower risk, can be deferred

### Tips

- Every gap must be grounded in facts from the archaeology and the target architecture — no assumptions
- A gap is not a task list — it describes *what* must change, not *how* to implement it (that goes in the backlog or technical specs)
- Focus on architecturally significant gaps; minor implementation details do not belong here
- If there is no gap in an area, say so explicitly — "no gap identified" builds confidence

## Template Section

Use the `## Gap Analysis` section from the template with:
- One subsection per architectural area where gaps exist
- Gap table per area (ID, Current, Target, Gap, Impact, Dependency)
- Sequencing recommendation table at the end
