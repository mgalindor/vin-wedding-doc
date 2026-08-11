# Section 8: Cross-cutting Concepts

## Goal

Document architectural concepts that span multiple building blocks and ensure consistency across the system.

Some topics within systems often concern multiple building blocks, hardware elements or development processes. It might be easier to communicate or document such cross-cutting topics at a central location, instead of repeating them in the description of the concerned building blocks, hardware elements or development processes.

Certain concepts might concern all elements of a system, others might only be relevant for a few. In the diagram above, logging concerns all three components, whereas security is relevant only for two components.

Some real-life examples:

Within a system, a common format for log-messages shall be established, combined with a common convention of choosing the appropriate log-destination. These decisions, along with implementation examples, could be described as “logging-concept”.
A system has numerous backend services, that communicate among each other based upon remote procedure calls or https-based REST.
Calling services (“consumers”) always need to authenticate themselves to the called service (“provider”).
For this authentication, a central common authorization service has to be used.
The technical and organizational details such authentication could be described as “backend authentication concept”.
(taken from the HTML Sanity Checker, see below): All (7+) checker components within the system are structured according to the strategy pattern.

## Guidelines

- Pick ONLY the most relevant concepts for THIS system — do not document everything
- Each concept gets its own subsection with a clear description
- Focus on the ARCHITECTURAL convention, not implementation details
- Describe the pattern/approach, not the code
- Common concepts to consider:
  - Authentication and Authorization
  - Error Handling and Exception Strategy
  - Logging, Monitoring, and Observability
  - Configuration Management
  - Data Validation Strategy
  - Caching Strategy
  - Internationalization / Localization
  - Database Migration Strategy
  - Data encryption (in transit, at rest)
  - Key management
  - Secure Encryption Algorithm (hashing, symmetric or asymmetric)

## Template Section

Use the `## Cross-cutting Concepts` section from the template with:
- One subsection per concept (`### Concept Name`)
- Description of the approach/pattern for each

## Tips
- Explain the Concepts!
- Concepts are approaches, rules, principles, tactics, strategies...
- Restrict documentation of concepts to the most important topics!
- In concepts, explain HOW it works!
- Document business or domain models!
- Document decisions instead of concepts!
- Use the collection from arc42 as checklist for concepts!
- (Hyper)Link between Building Blocks and Concepts!
