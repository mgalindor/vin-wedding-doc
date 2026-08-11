# Deployment View

Load the **section detail file** for `Deployment View` from the architecture documentation skill.


Produce the markdown content for this section and return it ready to append to `architecture.md`.

## Context to Gather

Search the workspace for:
- Building blocks from Step 5 (read the current architecture document)
- Constraints from Step 2 for cloud provider or infrastructure requirements
- Solution strategy from Step 4 for deployment-related decisions
- Technical interview notes for infrastructure setup
- Operations documents or runbooks
- CI/CD pipeline configurations

## Interactive Approach

Ask the user:
1. **Cloud / Infrastructure**: "Where is the system deployed? (cloud provider, on-premises, hybrid) What region/zones?"
2. **Compute**: "How does each container run? (Kubernetes pods, serverless functions, VMs, managed services)"
3. **Networking**: "What load balancers, CDNs, API gateways, or network boundaries exist?"
4. **Data**: "Where are databases and storage hosted? (managed services, self-hosted) Any replication or backup topology?"
5. **Environments**: "How many environments exist? (dev, staging, production) Are there meaningful differences?"

All inputs are optional.
