# Step 12: Architecture Panel Review

## Goal

A single `architect` subagent reviews the **complete architecture document** sequentially from 4 specialist perspectives, produces a structured multi-perspective critique, then rewrites the affected sections and appends a Panel Review Summary.

This approach uses **1 subagent invocation** covering all 4 viewpoints in a single pass.

---

## Execution

Delegate to a single `architect` subagent. The subagent receives the full architecture document and must:

1. Review the document sequentially from each of the 4 specialist perspectives defined below
2. For each perspective, produce a structured critique organized by section
3. Consolidate and deduplicate all concerns across the 4 perspectives
4. Classify each concern: **consensus** (raised by 2+ perspectives) or **specialist** (raised by 1)
5. Rewrite the affected sections incorporating validated improvements
6. Note deferred concerns not addressed in this iteration
7. Append a `## Panel Review Summary` section to the document

---

## Perspectives

### Perspective 1 — Software Architect

- **Persona**: Senior software architect specializing in system design, domain modeling, design patterns (GoF, DDD, Hexagonal, CQRS), SOLID principles, and quality attributes.
- **Review Focus**:
  - Are building blocks well-defined with clear responsibilities and single-purpose boundaries?
  - Is the runtime view coherent — do the container interactions make sense for each key scenario?
  - Are architectural patterns used appropriately, or is there premature complexity / over-engineering?
  - Are quality goals from Section 1 concretely addressed in the design decisions of later sections?
  - Are there hidden coupling, tight dependencies, circular references, or design smells?
  - Are architectural constraints (Section 2) actually respected throughout the design?
  - Is the solution strategy internally consistent — does the building block view implement what the strategy promises?
  - Are there cross-section inconsistencies — elements stated differently or contradictorily across sections?

---

### Perspective 2 — Cloud Infrastructure Architect

- **Persona**: Cloud infrastructure architect with expertise in cloud-native patterns, managed services trade-offs, multi-region resilience, infrastructure cost optimization, and platform engineering.
- **Review Focus**:
  - Is the deployment topology realistic, resilient, and cost-effective for the stated scale?
  - Are managed cloud services used where appropriate vs. unnecessary self-hosting?
  - Are there single points of failure or under-specified availability zones in the deployment view?
  - Are resilience patterns (circuit breakers, retries with backoff, bulkheads, fallbacks) reflected where needed?
  - Are networking, security perimeters, data sovereignty, and compliance constraints addressed?
  - Is the infrastructure right-sized — neither over-provisioned nor under-powered for the expected load?
  - Are storage and database choices aligned with the data access patterns described in the runtime view?
  - Are infrastructure decisions mentioned in one section but missing or contradicted in others?

---

### Perspective 3 — Frontend/Web & Mobile Architect

- **Persona**: Frontend and mobile architecture expert specializing in SPAs, PWAs, native/hybrid mobile apps, API design from the consumer perspective, offline-first strategies, client-side state management, and performance budgets.
- **Review Focus**:
  - Are APIs and data contracts well-designed for frontend and mobile consumers (REST shape, payload size, pagination)?
  - Are client-side performance constraints addressed: initial load, time-to-interactive, bundle size, render performance?
  - Is offline or low-connectivity behavior considered where the product requires it?
  - Are client-side state management and cache invalidation strategies defined or at least acknowledged?
  - Are mobile-specific constraints (battery use, memory limits, screen sizes, native capabilities) considered where applicable?
  - Does the architecture support the user experience described in the discovery journey maps?
  - Are authentication flows (token storage, refresh, logout) safe and usable on client platforms?
  - Are there gaps between what the solution strategy promises and what the building block / deployment views actually deliver for clients?

---

### Perspective 4 — DevOps Architect

- **Persona**: DevOps architect following Continuous Delivery principles, with expertise in CI/CD pipeline design, infrastructure as code, observability stacks (logs/metrics/traces), release safety strategies, and site reliability engineering.
- **Review Focus**:
  - Is the system observable? Are structured logging, distributed tracing, metrics, and alerting addressed in cross-cutting concepts?
  - Is the deployment strategy safe and reversible? Are blue/green, canary, or feature flag strategies mentioned?
  - Are secrets management, configuration promotion across environments, and environment isolation handled?
  - Are health checks, readiness/liveness probes, and graceful shutdown patterns considered in the deployment view?
  - Is the CI/CD pipeline described at a meaningful level — stages, gates, automated tests, artifact promotion?
  - Are there operational risks or missing runbook guidance that would make the system hard to operate in production?
  - Is rollback feasible? Is there a database migration strategy aligned with zero-downtime deployments?
  - Are operational concerns mentioned in one section but absent or inconsistent in sections that should address them?
