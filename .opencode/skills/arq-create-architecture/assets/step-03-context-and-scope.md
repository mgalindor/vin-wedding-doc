# Context and Scope

Load the **section detail file** for `Context and Scope` from the architecture documentation skill.

Produce the markdown content for this section and return it ready to append to `architecture.md`.

## Context to Gather

Search the workspace for:
- PRD for system features and user interactions
- Technical interview notes for integrations and external systems
- Discovery documents for user types and external actors
- Analysis documents for data flows and business processes
- Architecture references for existing system landscape
- API specifications or integration guides

## Interactive Approach

Ask the user:
1. **System Boundary**: "What is the name of the system? What is INSIDE the system boundary vs. OUTSIDE?"
2. **Business Context**: "Who are the users and external actors? What business information does the system exchange with each? (Use business language: 'places order', not 'POST /orders')"
3. **Technical Context**: "What are the technical channels, protocols, and formats for each interaction? (HTTPS/REST, gRPC, message queues, etc.)"
4. **External Systems**: "Which external systems does this system integrate with? What does it send to and receive from each?"

All inputs are optional — infer from context when possible.
