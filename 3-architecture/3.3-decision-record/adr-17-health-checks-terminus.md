---
title: "ADR-17 — Health checks: NestJS Terminus"
id: adr-17
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 1.0.0
updated: 2026-08-10
---

# ADR-17 — Health checks: NestJS Terminus

## Context

Wendy Planner's API runs as an ECS Fargate service (ADR-04). To operate it reliably — and to let AWS or any orchestrator replace unhealthy tasks — we need health-check endpoints that report:

- **Liveness**: "is the process alive and not deadlocked?" — used by ECS to decide whether to restart the container.
- **Readiness**: "can the process serve traffic right now?" — used by ECS to decide whether to send requests to this task (via the ALB target group health check).

Without health checks:
- A task with a broken DB connection keeps receiving traffic and returning 500s.
- A task with a memory leak or a deadlock runs forever consuming resources.
- Deploys can't roll out cleanly — we don't know when the new task is "ready" to receive traffic.

We need:

- **A liveness endpoint** that is cheap and always returns 200 if the process is responsive. Used by ECS to detect crashed/hung processes.
- **A readiness endpoint** that returns 200 only when downstream dependencies (database, object storage, signing keys) are reachable. Used by ALB to gate traffic.
- **A uniform error contract** — the same `{ code, message, details }` envelope we use elsewhere, so monitoring tools can parse failures consistently.
- **Custom indicators** for Prisma (the library doesn't ship a TypeORM/Prisma indicator by default — only TypeORM) and S3.
- **No security** on these endpoints (no JWT) — they are infrastructure-level. ECS, ALB, and our monitoring tools must hit them without credentials. Restrict by network: only the VPC can reach them.

## Decision

**Adopt `@nestjs/terminus` as the health-check library. Expose `/health/live` and `/health/ready` as separate endpoints, with custom indicators for Prisma and S3.**

### Endpoints

| Endpoint | Method | Auth | Purpose | Indicators |
|----------|--------|------|---------|------------|
| `/health/live` | GET | none | Liveness probe | memory heap (≤ 200 MB) |
| `/health/ready` | GET | none | Readiness probe | Prisma DB ping, S3 bucket head, memory heap (≤ 200 MB), disk (≤ 90 %) |

**Why two endpoints, not one:**

- A `/health` that mixes liveness and readiness is harder to reason about. ECS will restart the container if liveness fails, but will only stop sending traffic if readiness fails.
- Splitting them lets us tune each independently. Example: during a brief DB blip, readiness may fail (no traffic) but liveness still passes (no restart).

### Built-in indicators (out of the box from `@nestjs/terminus`)

- `MemoryHealthIndicator.checkHeap('heap', 200 * 1024 * 1024)` — fails if V8 heap exceeds 200 MB.
- `MemoryHealthIndicator.checkRSS('rss', 300 * 1024 * 1024)` — fails if RSS exceeds 300 MB.
- `DiskHealthIndicator.checkStorage('disk', { thresholdPercent: 0.9, path: '/' })` — fails if disk usage > 90 %.

### Custom indicators (we implement)

- **`PrismaHealthIndicator`** — runs `prisma.$queryRaw\`SELECT 1\`` with a 1-second timeout. Returns healthy if the query returns a row.
- **`S3HealthIndicator`** — runs `s3.headBucket({ Bucket: this.bucket })` with a 2-second timeout. Returns healthy if AWS responds with 200/204.

### Concrete code

```ts
// apps/api/src/health/prisma.health.ts
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) { super(); }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (err) {
      throw new HealthCheckError(
        'Prisma check failed',
        this.getStatus(key, false, { error: (err as Error).message }),
      );
    }
  }
}
```

```ts
// apps/api/src/health/s3.health.ts
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { S3Config } from '../config/s3.config';

@Injectable()
export class S3HealthIndicator extends HealthIndicator {
  private readonly client: S3Client;

  constructor(private readonly cfg: S3Config) {
    super();
    this.client = new S3Client({ region: cfg.region });
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: cfg.bucketName }));
      return this.getStatus(key, true);
    } catch (err) {
      throw new HealthCheckError(
        'S3 check failed',
        this.getStatus(key, false, { error: (err as Error).message }),
      );
    }
  }
}
```

```ts
// apps/api/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health';
import { S3HealthIndicator } from './s3.health';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly prisma: PrismaHealthIndicator,
    private readonly s3: S3HealthIndicator,
  ) {}

  @Get('live')
  @HealthCheck()
  live() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.prisma.isHealthy('database'),
      () => this.s3.isHealthy('photo_bucket'),
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      () => this.disk.checkStorage('disk', { thresholdPercent: 0.9, path: '/' }),
    ]);
  }
}
```

### ECS integration

In the ECS task definition:

- **ALB target group health check**: `GET /health/ready`, interval 30s, timeout 5s, healthy threshold 2, unhealthy threshold 3.
- **Container health check** (optional, `HEALTHCHECK` directive in Dockerfile or in the task definition): `CMD wget -qO- http://localhost:3000/health/live || exit 1`, interval 30s, retries 3.

The ALB takes unhealthy tasks out of rotation immediately. The container health check restarts the container if liveness fails.

### Security

- `/health/*` are **unauthenticated** by design (the orchestrator must reach them without credentials).
- Network-level restriction: the ALB security group only accepts traffic on port 80 from the public ALB; `/health/*` is therefore reachable from the public internet, but the endpoint reveals only "healthy" or "unhealthy with a brief reason". No secrets are leaked.
- The Sentry error reporting tag uses the same `traceId` as other endpoints (consistent with §8.3 Error Handling).

## Options Considered

### Option A — `@nestjs/terminus` — **Selected**

- **Pros**
  - **Canonical NestJS recipe** — every NestJS developer recognizes `@nestjs/terminus`.
  - Built-in indicators for memory and disk.
  - Pluggable custom indicators (Prisma, S3).
  - Standard error format; uniform response shape.
- **Cons**
  - Adds ~30 KB to the API bundle.
  - The built-in `TypeOrmHealthIndicator` is useless to us (we use Prisma, not TypeORM) — we must write our own. Same for S3.

### Option B — Custom health endpoints

- **Pros:** zero dependencies; full control.
- **Cons:** re-implement what Terminus already does well; we lose the standard `HealthCheckError` shape; new devs have to learn our custom format.
- **Verdict:** **rejected** — Terminus is the industry standard for NestJS health checks.

### Option C — `@godaddy/terminus` (not `@nestjs/terminus`)

- **Pros:** more features (graceful shutdown hooks, HTTP/2).
- **Cons:** not NestJS-native; we already use the NestJS ecosystem.
- **Verdict:** **rejected**.

## Consequences

### Positive

- **ECS replaces unhealthy tasks automatically** — no manual intervention for crashed processes or DB outages.
- **Deploys roll out cleanly** — new tasks must pass `/health/ready` before ALB sends traffic; old tasks are drained before termination.
- **Standard, recognizable shape** — anyone joining the team knows where to find `/health/live` and `/health/ready`.
- **Custom indicators** for Prisma and S3 give us real dependency checks, not just "process is alive".

### Negative / Trade-offs

- Adds ~30 KB to the API bundle.
- Two custom indicator classes to maintain (Prisma and S3).
- Memory/disk thresholds need tuning as we learn the app's real footprint.

### Follow-up actions

- [ ] Install `@nestjs/terminus` in `apps/api/` [owner:: backend] [priority:: high]
- [ ] Implement `PrismaHealthIndicator` and `S3HealthIndicator` [owner:: backend] [priority:: high]
- [ ] Implement `HealthController` with `/health/live` and `/health/ready` [owner:: backend] [priority:: high]
- [ ] Add unit tests for each indicator (healthy + unhealthy paths) [owner:: backend] [priority:: high]
- [ ] Configure the ALB target group health check on `/health/ready` in the AWS CDK stack [owner:: tech-lead] [priority:: high]
- [ ] Add a CloudWatch alarm on `/health/ready` 5xx rate [owner:: backend] [priority:: medium]
- [ ] Document the memory/disk thresholds in the backend blueprint [owner:: backend] [priority:: medium]

### Revisit when

- Memory or disk thresholds need adjustment (after the first production load test).
- A new external dependency is added (extend with another custom indicator).
- We adopt Kubernetes (the same endpoints work, just plumb the probes through k8s manifest).
