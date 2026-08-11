# Section 7: Deployment View

## Goal

Describe the infrastructure topology and map each software building block to its deployment resource.

## Guidelines

### This is an INFRASTRUCTURE diagram, not a software diagram
- Nodes are infrastructure resources: GKE Cluster, Cloud SQL instance, Cloud Run service, S3 Bucket
- NOT software components: Frontend App, API Service, OrderController
- The software from the Building Block View is MAPPED to infrastructure in the table below the diagram

### Key Distinction
- Building Block View answers: WHAT software runs?
- Deployment View answers: WHERE does it run?

### Mapping Table
- Every building block from the Building Block View must appear in the mapping table
- Each row: Software (from Building Block View) -> Infrastructure Resource -> Resource Type -> Notes
- This creates traceability between logical architecture and physical deployment

### Diagram
- Use mermaid `graph TD` with nested subgraphs for provider -> region -> cluster -> namespace
- Show network connections with protocols and ports
- Include managed services (databases, caches, queues) as separate nodes

## Template Section

Use the `## Deployment View` section from the template with:
- Infrastructure Level 1 mermaid diagram (`graph TD` with nested subgraphs)
- Mapping table (Software -> Infrastructure Resource -> Type -> Notes)

## Tips
- Document your technical infrastructure (hardware)!
- Explain hardware and infrastructure decisions!
- Document the various environments!
- Document the deployment view hierarchically!
- Document the mapping of building-blocks to hardware!
- Use Mermaid diagrams to document software/hardware mapping!
- Explain your nodes!
