# Step 6: Component Responsibility

## Goal

Classify the component's architectural responsibility type and summarize its main capabilities. This step synthesizes the evidence gathered in all previous steps to answer: **what role does this component play in the system?**

## Responsibility Types

Classify the component into one or more of these responsibility types:

| Type | Description | Indicators |
|---|---|---|
| **Business Process** | Models complete business capabilities (authentication, billing, fraud detection, notifications) | Contains business rules, validation logic, workflows specific to a business function |
| **Domain** | Organized around core business entities, each module owns its entity data and logic (DDD bounded contexts) | CRUD operations on domain entities, entities map to core business concepts |
| **Workflow** | Coordinates steps and states within a business process, uses EIP patterns | State machines, saga/orchestration patterns, step-by-step coordination, integration frameworks (Camel, Spring Integration, Airflow) |
| **Channel / BFF** | Optimized data aggregation for specific consumers (web, mobile, partners, backoffice) | Aggregates from multiple sources, transforms for specific UI needs, no significant business logic |
| **Integration / Adapter** | Isolates and translates between systems — anti-corruption layers, gateways, connectors | Wraps external APIs, translates protocols, maps between data formats, isolated from domain logic |
| **Technical / Platform** | Cross-cutting infrastructure concerns not tied to business logic | Configuration service, feature flags, observability, rate limiting, distributed cache |
| **Data / Decision Engine** | Owns critical data or complex decision logic where consistency and traceability are key | Pricing engine, fraud engine, customer profile, financial ledger, promotions engine |

A component may have a **primary** responsibility type and one or more **secondary** types. For example, a backend service may be primarily "Domain" but also contain "Integration/Adapter" modules for external systems.

## How to Determine

Use evidence from the previous steps:

1. **From Overview (Step 1)**: What frameworks suggest about the component's purpose (e.g., Spring Batch → workflow, Express → API/channel)
2. **From Input Interfaces (Step 3)**: What triggers the component? REST API → likely domain or channel; message consumers → likely workflow or integration
3. **From Output Interfaces (Step 4)**: What does it depend on? Many external API calls → integration; single database → domain; multiple data sources aggregated → channel/BFF
4. **From Data Archaeology (Step 5)**: Does it own domain data? → domain. Does it coordinate between systems? → workflow. No owned data, just passes through? → channel or integration

## Key Questions This Step Must Answer

- What is the primary architectural responsibility type of this component? Is the classification unambiguous or does it blend multiple types?
- What are the 5-10 most important capabilities this component provides — described specifically, not generically?
- Does the responsibility match the detected technology stack? (e.g., a Workflow component should show EIP frameworks like Camel or Spring Integration)
- Are there signs of responsibility creep — is the component doing too many unrelated things that suggest it should be split?
- How would you describe what this component does to a developer who has never seen it? (30-second summary)
- Which other components in the system likely depend on this one, based on what it exposes?

## Notes

- The capability list should be ordered by importance/usage frequency
- Each capability should be verifiable against the input interfaces found in Step 3
- Avoid generic descriptions like "handles data" — be specific: "Manages product inventory including stock levels, receiving, and adjustments"
- This classification will be used by the brownfield architecture orchestrator to understand how components relate to each other and what role each plays in the overall system
