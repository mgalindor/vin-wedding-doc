# Section 5: Building Block View

## Goal

Decompose the system into its top-level containers (C4 Level 2) and describe their responsibilities, code language, and interfaces. 

**VERY IMPORTANT**: Do not include frameworks, libraries, or services that are not separately deployable/runnable. For example, if the system is a web application built with React and Node.js, the containers would be "Web Application (React)" and "API Service (Node.js)", NOT "React" and "Node.js". The focus is on architectural building blocks, not implementation details.

Before
- Draft a DDD Event Storming based on the requirement to identify domains and bounded context . Keep oit simple we do not need all DDD practices. Event Storming help at this point to identify the context bounded to the application and how organize it, in addition with the Solution strategy we can infer the containers of the application (microservices, lambda, modules of modular monolith)   
- Organize actions and entities based on the context bounded in lists 
-  Eg.
```
# Context Bound 1
- Action over doamin
- Action over doamin
- Action over doamin

# Context Bound 2
- Action over doamin
- Action over doamin
- Action over doamin
```
- Remember there are some domain entities that could be shared between context bounds and connect them. They key is that the same model means something different in each context bound. For example, the User entity in the Authentication context bound has different meaning and attributes than the User entity in the Order Management context bound. This is a common scenario in DDD where the same concept exists in multiple contexts but with different interpretations and data. 

Show a dragt andask the user:
1. **Containers**: "What are the main deployable units of the system? (web app, API service, background workers, databases, queues, etc.)"
2. **Responsibilities**: "What is each container responsible for?"
3. **Code Language**: "What technology does each container use?"
4. **Communication**: "How do containers communicate with each other? (REST, gRPC, message queue, shared DB)"
5. **External Integration**: "Which containers interact with external systems?"

All inputs are optional.

## Guidelines

### C4 Level 2 (Container View)
- A container is any separately deployable/runnable unit: web app, API, database, message broker, file storage, etc.
- This opens the system black box from Context and Scope to show what's INSIDE
- The diagram should use `subgraph` to show the system boundary with containers inside
- External actors and systems stay OUTSIDE the boundary

### What belongs here vs. elsewhere
- Context and Scope (C4 L1): System = black box. External boundary only.
- Building Block View (C4 L2): System is OPEN. Containers visible inside.
- C4 L3 (Component View): NOT included by default. Only add if explicitly requested.
- C4 L4 (Code Level): Never documented at architecture level.

### Building Blocks Table
- Each container gets a row: Name, Technology, Responsibility
- Keep responsibilities to one sentence per container
- Code language should be specific: "Node.js 20 TypeScript"

### Important Interfaces
- Document only interfaces NOT visible in the diagram
- Focus on: protocol details, error handling, versioning, authentication patterns

## Template Section

Use the `## Building Block View` section from the template with:
- Container View mermaid diagram (`graph LR` with `subgraph`)
- Contained Building Blocks table (Name, Technology, Responsibility)
- Important Interfaces description (optional)

## Tips
- Use common structures for sections of the building block view!
- Organize the building block view hierarchically!
