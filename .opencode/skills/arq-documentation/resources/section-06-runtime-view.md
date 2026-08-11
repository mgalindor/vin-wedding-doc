# Section 6: Runtime View

## Goal

Illustrate how the system's building blocks behave at runtime through key scenario flows using sequence diagrams.

## Guidelines

### Actor
Use Mermaid Actor type for actions triggered by users. 

### Participants are ARCHITECTURAL components
- Use containers (web app, API, database, message broker) and external systems
- NEVER use classes, methods, functions, or code-level constructs
- Good: User, Mobile App, API Gateway, Order Service, PostgreSQL, Stripe API
- Bad: OrderController, PaymentRepository, validateToken(), OrderDTO

### One trigger per diagram
- Each diagram must have exactly ONE initiating event or action
- Include actor with the role in case it is a persona or the name of the middleware or system in case the event is triggered by other system or event
- Synchronous and asynchronous flows go in SEPARATE diagrams
- If a flow spawns an async process, that async process gets its own diagram
- Recovery flows get their own diagram when the recovery system has its own trigger

### Async Pattern
- Use `->>` without return arrows for fire-and-forget
- Separate the consumption flow into its own diagram
- Example: "Diagram A: User places order (sync)" + "Diagram B: OrderPlaced event processed (async)"

### Scenario Selection
- Focus on architecturally relevant scenarios, not every use case
- Good candidates: critical business paths, cross-container flows, error/recovery, async event chains

## Template Section

Use the `## Runtime View` section from the template with:
- One subsection per scenario (`### Scenario N: Name`)
- Mermaid sequence diagrams
- Notable aspects description per scenario

## Tips
- Always map existing building blocks to the activities within runtime scenarios!
- Document 'schematic' (instead of detailed) scenarios!
- Use sequence diagrams to describe or specify runtime scenarios!
