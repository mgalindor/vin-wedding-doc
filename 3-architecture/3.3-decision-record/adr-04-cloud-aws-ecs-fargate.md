---
title: "ADR-04 — Cloud topology: AWS ECS Fargate + RDS + S3 + CloudFront"
id: adr-04
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 1.0.0
updated: 2026-08-10
---

# ADR-04 — Cloud topology: AWS ECS Fargate + RDS + S3 + CloudFront

## Context

Wendy Planner's MVP must:

- Run as containers in the cloud (TC-2, TC-3).
- Be deployable and operable by a 2-person team without dedicated DevOps.
- Stay within a small monthly infrastructure budget.
- Support ~10 WPs and ~100 weddings/year.
- Provide a CDN-fronted public invitation experience with fast first paint.

The kickoff is cloud-agnostic but requires a "cloud provider" and "container" deployment.

## Options Considered

### Option A — AWS ECS on EC2 (with our own ASG)

- **Pros**
  - Full control over the underlying instances.
- **Cons**
  - We have to manage the EC2 fleet (patching, scaling, AMIs). Operational cost is too high for a 2-person team.

### Option B — AWS ECS Fargate — **Selected**

- **Pros**
  - **No servers to manage** — Fargate runs containers directly.
  - Native integration with ALB, ECR, CloudWatch, Secrets Manager, IAM.
  - Pay only for vCPU and memory while tasks are running.
  - Auto-scaling on CPU/memory.
  - Health checks and rolling deploys out of the box.
  - No Kubernetes ops overhead (EKS would be overkill).
- **Cons**
  - Cold starts are slightly slower than EC2 (irrelevant for our traffic).
  - Slightly higher per-vCPU cost than reserved EC2, but at our scale the absolute delta is small.

### Option C — AWS App Runner

- **Pros**
  - Even simpler than Fargate (no cluster to manage).
- **Cons**
  - Less control over networking, scaling rules, and sidecar containers.
  - Vendor lock-in to App Runner-specific features.

### Option D — Kubernetes (EKS)

- **Pros**
  - Maximum flexibility; the industry standard for container orchestration.
- **Cons**
  - **Operational complexity is too high for a 2-person team** — control plane, node groups, Helm charts, ingress controllers, etc.
  - Cost is higher at this scale.

### Option E — PaaS (Render, Fly.io, Railway)

- **Pros**
  - Even simpler than Fargate; some have first-class Next.js support.
- **Cons**
  - We accept the "containers in the cloud" requirement (TC-2), but a PaaS blurs the line between "our container" and "the platform's runtime". A future migration would be a rewrite, not a redeploy.
  - Smaller community for production-grade patterns at our scale.

### Cross-cutting decisions bundled

- **RDS PostgreSQL 15** for the database (see ADR-03).
- **S3** for object storage of wedding photos.
- **CloudFront** for CDN + TLS termination.
- **Route 53** for DNS.
- **ACM** for TLS certificates.
- **Secrets Manager** for credentials.
- **CloudWatch** for logs and metrics.
- **Sentry** for error tracking and performance monitoring (SaaS, AWS-agnostic).

## Decision

**Adopt AWS as the cloud provider. Deploy both the Web App and the API as ECS Fargate services behind an internal ALB, fronted by CloudFront. Use RDS for the database and S3 for photos.**

- **Region:** `us-east-1` (lowest cost and broadest service availability; revisit if latency from Mexico is a concern).
- **Account structure:** a single AWS account for MVP; environment separation via tags and prefixes. Multi-account is overkill for a 2-person team.
- **Networking:** one VPC with public subnets (ALB) and private subnets (Fargate tasks, RDS). NAT gateway for outbound traffic.
- **TLS:** ACM certificate on CloudFront and ALB listeners.
- **Image registry:** Amazon ECR, one repository per service.
- **IaC:** AWS CDK in TypeScript (matches the team's language; integrates with the same monorepo).

## Consequences

### Positive

- Containers satisfy TC-2; managed services satisfy OC-1 (operational simplicity).
- Cost is predictable and bounded for MVP.
- The deployment pipeline is straightforward: build image → push to ECR → update ECS service.
- Easy to add WAF, Shield, or other managed security services later.

### Negative / Trade-offs

- We accept some AWS lock-in at the deployment layer (Fargate + RDS + S3 are not 1:1 portable). Application code is portable (see ADR-03 for DB, ADR-06 for storage abstraction).
- A multi-region setup is not in scope for MVP. Cross-region disaster recovery is deferred.

### Follow-up actions

- [ ] Bootstrap the AWS account: VPC, subnets, ALB, ECS cluster, ECR repos [owner:: tech-lead] [priority:: high] [due:: end of sprint 1]
- [ ] Define the AWS CDK stack structure (one app per environment) [owner:: tech-lead] [priority:: high]
- [ ] Set up CloudWatch alarms for 5xx rate, RDS CPU, Fargate CPU [owner:: backend] [priority:: medium]
- [ ] Document the disaster recovery runbook (RTO ≤ 4h, RPO ≤ 1h) [owner:: backend] [priority:: medium]

### Revisit when

- The team grows past 3 developers and K8s becomes economically viable.
- Workload requires multi-region active-active.
- A new client mandates a different cloud provider.
