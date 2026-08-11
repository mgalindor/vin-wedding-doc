# Section 3: Context and Scope

## Goal

Define the system boundary — what is inside vs. outside — and document all external communication partners in both business and technical terms.

## Guidelines

### Business Context
- Use BUSINESS language on diagram arrows: "submits order", "requests payment", "sends notification"
- Never use protocol names or technical details in the business context
- The audience is ALL stakeholders, including non-technical ones
- Use mermaid `graph LR` with `subgraph` to show the system boundary visually
- Include a communication partner table with inputs and outputs for each partner

### Technical Context
- Use TECHNICAL identifiers on diagram arrows: "HTTPS/REST :443", "AMQP (RabbitMQ)", "gRPC :50051"
- Replace business actor names with technical clients (Browser, Mobile App, Webhook)
- Replace external system names with real endpoints or service identifiers
- The audience is developers and infrastructure designers
- Include a channel table with protocol and format details

### Key Distinction
- Business Context answers: WHAT is exchanged (business events, domain data)
- Technical Context answers: HOW it is exchanged (protocols, endpoints, formats)
- Both diagrams show the SAME interactions, just from different perspectives

## Template Section

Use the `## Context and Scope` section from the template with:
- Business Context: mermaid `graph LR` diagram + communication partner table
- Technical Context: mermaid `graph LR` diagram + channel table

## Tips
- Explicitly demarcate your system from its environment!
- Show the context as diagram!
- Combine the context diagram with a table!
- Explicitly indicate risks in the context!
- Restrict the context to an overview, avoid too many details!
- Simplify the context by categorization!
- If many external systems are involved, aggregate (cluster) them by explicit criteria!
- Show all (all!) external interfaces!
- Differentiate business and technical context!
- In the business context, show data flows (instead of dependencies)!
- Show external influences in the context!
- Use the technical context to describe protocols or channels!
