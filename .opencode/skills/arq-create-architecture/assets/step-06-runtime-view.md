# Runtime View

Load the **section detail file** for `Runtime View` from the architecture documentation skill.

Produce the markdown content for this section and return it ready to append to `architecture.md`.

Because this section could be overwhelming and large create a file that contains in the name `runtime-view.md` and add a reference to it in the main `architecture.md` file. This allows us to focus on one section at a time and keeps the main document clean.
## Context to Gather

Search the workspace for:
- Building blocks from Step 5 (read the current architecture document)
- PRD for critical user flows and use cases
- Product backlog for important user stories
- Technical interview notes for integration flows
- Analysis documents for business process flows

## Interactive Approach
Before starting this step, ask the user:
1. Show the user the list of escenarios 


Ask the user:
1. **Critical Scenarios**: "What are the 2-20 most architecturally significant runtime scenarios? or All"
2. **Flow Types**: "For each scenario, is it synchronous (request/response) or asynchronous (event/message)?"
3. **Error Cases**: "Are there critical error or recovery scenarios that should be documented?"

All inputs are optional.
