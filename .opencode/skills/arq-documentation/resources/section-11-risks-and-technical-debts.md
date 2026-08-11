# Section 11: Risks and Technical Debts

## Goal

Identify and prioritize technical risks and accumulated technical debts, each with a concrete mitigation strategy.

## Guidelines

### Risk vs. Technical Debt
- **Risk**: Something that MIGHT happen and would negatively impact the system (probability + impact)
- **Technical Debt**: Something that IS happening — a known shortcoming that will cost effort to fix later

### Mitigation Strategy
- Every risk and debt MUST have a concrete mitigation strategy
- "Monitor" alone is NOT a mitigation strategy
- Good: "Implement circuit breaker pattern to isolate failures; add fallback to cached responses"
- Bad: "Keep an eye on it"

### Prioritization
- Order by priority: High -> Medium -> Low
- Priority combines probability and impact
- High probability + High impact = High priority

### Sources of Risk
Review the entire architecture document for risks:
- Single points of failure in the deployment view
- Complex integration points from the context diagram
- Quality goals that are hard to achieve given constraints
- Technology choices with limited team experience
- Vendor dependencies that create lock-in

## Template Section

Use the `## Risks and Technical Debts` section from the template with:
- Risk register table (Priority, Risk / Technical Debt, Probability, Impact, Mitigation Strategy)

## Tips
- Search for problems and risks with different stakeholders!
- Analyze (external) interfaces for problems and risks!
- Identify problems or risks by qualitative evaluation!
- Analyze processes for problems and risks!
