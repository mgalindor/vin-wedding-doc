<!--
TIER BLUEPRINT TEMPLATE
=======================
Purpose   : Concise technical guide for a single application tier.
Audience  : Developers joining or working within this tier.
Fill in   : Replace all {placeholders} with real values.
Comments  : Remove all <!-- --> blocks before publishing.
Length    : the entire document should be readable in under 10 minutes.
            If a section exceeds ~25 lines, you have written too much.
-->

---
title: "{tier-name} Tier Blueprint"
date: {YYYY-MM-DD}
type: architecture
scope: internal
version: 1.0.0
updated: {YYYY-MM-DD}
tier: {tier-name}
---

# {tier-name} Tier Blueprint

## 1. Runtime & Platform

<!-- Language name, version pinned to minor (e.g. TypeScript 5.3, not "TypeScript latest").
     Runtime environment and its version. Hosting platform if relevant.
     Keep to 3–5 lines max. -->

| Dimension   | Value |
|-------------|-------|
| Language    | {language} {version}  Eg. Java 21 |
| Runtime     | {runtime} {version}Eg. Eg OpenJDK 21  |
| Platform    | {hosting-platform} Eg. Docker + Kubernetes |
| Build&Package Manager | {package manager} Eg. Maven 3.x | 
| (optional section) Min targets | {e.g. Node 20 LTS / iOS Safari 14+ / Android Chrome 80+} |

---

## 2. Tech Stack

<!-- One row per significant library. Purpose must be one sentence.
     Omit transitive or trivial dependencies. Only major versions. eg 3.x
     In column library set up the name which use the package manager Eg. for exposing API in java and spring projects use "spring-boot-starter-web" instead of "spring framework".
     -->

| Library / Tool | Version | Purpose |
|----------------|---------|---------|
| {framework}    | {x.x}   | {one-line purpose} |
| {orm-or-db-client} | {x.x} | {one-line purpose} |
| {auth-library} | {x.x}   | {one-line purpose} |
| {test-runner}  | {x.x}   | {one-line purpose} |
| {linter-formatter} | {x.x} | {one-line purpose} |

<!-- Add rows as needed. Remove unused rows.
Common libraries (this may change depending the needs of the project)
- api exposition
- input validation
- input sanitization and transformation from json to domain objects
- dependency management
- orm
- database versioning and migration
- rest client
- middleware integration 
- observability
- authn & authz
- logging
- health
- configuration management (env,vault etc)
- testing (unit, integration, e2e)

In some cases like in spring boot many of this concerns are handled by the framework modules Eg.

spring-boot-starter-web  : already include jackson to transform json to java clases **Not required to mention jackson**
spring-boot-starter-validation : already include hibernate-validator to validate the input **Not required to mention hibernate-validator**

 -->

---

## 3. Scaffolding

<!-- Use unix tree format. Annotate each folder with a # comment.
     Show the structure to the second or third level only — don't list every file.
     Example below shows a layered backend; adapt the tree to the actual architecture. 
     
     This section have to be schematic and concise. Do not include every domain module or feature — just the high-level structure. The purpose is to give a mental model of where things go, not to be an exact blueprint of the current codebase.
     -->
**Architecture style:** {e.g. layered, hexagonal, clean, feature-based modules, modular monolith, mvp, mvvvm, etc.}

```
src/
├── modules/
│   └── {domain-module}/        # one folder per bounded domain
│       ├── domain/             # {what lives here, e.g. entities, value objects}
│       ├── application/        # {what lives here, e.g. use cases, commands}
│       └── infra/              # {what lives here, e.g. repos, adapters, controllers}
├── shared/                     # {cross-module utilities: errors, logger, middleware}
├── config/                     # {environment config, DI container setup}
└── main.{ext}                  # {entry point}
```

<!-- For frontend tiers, a feature-based or atomic structure is equally valid.
     Example:
src/
├── features/
│   └── {feature-name}/
│       ├── components/
│       ├── hooks/
│       └── {feature-name}.service.ts
├── shared/
│   ├── ui/
│   └── lib/
├── app/                        # routing, providers, shell
└── main.{ext}
-->

---

## 4. Internal Layers

<!-- For each layer: one sentence of responsibility + what it CANNOT do.
     This is the dependency rule made explicit. -->

| Layer | Responsibility | Cannot |
|-------|---------------|--------|
| {layer-1, e.g. Domain} | {what it does} | {e.g. import from infra or application layers, call external services} |
| {layer-2, e.g. Application} | {what it does} | {e.g. contain business rules, access DB directly} |
| {layer-3, e.g. Infrastructure} | {what it does} | {e.g. contain business logic, call other infra adapters directly} |
| {layer-4, e.g. Presentation} | {what it does} | {e.g. contain business logic, call repositories directly} |

<!-- Add or remove layers to match the actual architecture.
     If architecture is feature-based rather than layered, describe feature vs. shared boundary instead. -->

---

## 5. Data Flow

<!-- Describe how a typical operation travels through the tier.
     Format: a short sequence using → notation.
     Add one paragraph if the module communication pattern is non-obvious (events, pub-sub, etc.).
     Maximum: 10 lines total for this section. -->

**Typical request flow:**

```
{entry point} → {layer 2} → {layer 3} → {data store}
e.g. HTTP Controller → Use Case → Repository → PostgreSQL
```

**Module communication:**

<!-- How do modules call each other? Direct import of public interface? Internal events?
     State the rule clearly. Example: "Modules communicate only through their public index.ts.
     Direct cross-module imports of internal files are forbidden." -->
{module-communication-rule}

<!-- For PWA/mobile tiers, add offline data flow if applicable:
**Offline flow:**
Action → IndexedDB (local) → sync queue → background sync trigger → API
-->

---

## 6. Cross-cutting Concerns

<!-- For each concern: name the mechanism and where it lives.
     Do NOT explain the concept — only the implementation decision.
     One line per concern is often enough. -->

### Logging
- Mechanism: {e.g. structured JSON via `pino`}
- Location: {e.g. shared/logger.ts, injected into services}
- Rule: {e.g. log at entry and exit of use cases; never log PII}

### Error Handling
- Mechanism: {e.g. custom error classes extending BaseError}
- Location: {e.g. shared/errors/; caught and normalized in controller layer}
- Rule: {e.g. domain errors bubble up; infra errors are wrapped before reaching application layer}

### Validation
- Mechanism: {e.g. Zod schemas at API boundary}
- Location: {e.g. presentation layer only — domain entities are always valid by construction}
- Rule: {e.g. validate at entry, trust internally}

### Authentication (AuthN)
- Mechanism: {e.g. JWT verified via middleware}
- Location: {e.g. shared/middleware/auth.ts, applied at router level}
- Rule: {e.g. all routes require auth by default; public routes explicitly opt out}

### Authorization (AuthZ)
- Mechanism: {e.g. RBAC — role checked in use case}
- Location: {e.g. application layer — use case checks role before executing}
- Rule: {e.g. role is injected from auth context; use cases do not receive role from request body}

<!-- Add or remove concerns relevant to this tier.
     Other common concerns: i18n, caching, feature flags, rate limiting, CORS. -->

---

## 7. Testing Strategy

<!-- For each test type: what is tested, what tool, and — critically — what is NOT tested at this level.
     Keep the table scannable. Use the "not tested" column to prevent test duplication. 
     
     Eg Options to E2E test in spring boot projects are:
     - Starts de whole application using JUnit and SpringBoot test and in the junit send http requests to the spring endpoints infraestructure dependencies use in memory 
     - Other alternative is use test containers
     - Other alternative is define infrastructure dependencies in docker-compose and start when app starts
     - Other alternative is start the application in cli whe the docker-compose dependencies and send request using a http client like postman, httpyac
     - Other alternative start application in cli written e2e test in a tool such as codecept, playwright, karate, cypress or any other e2e testing framework

     Eg. Spring boot integration test offers the spring boot test module this include a set of testing annotations to mock database, http clients or stream integrations. This annotations starts an in memory mocking middleware strategy. 

     This section document the test types, the chosen strategy , and the reasons behind it by test type. It also defines what is tested in each type of test and what is not tested to avoid duplication. 

     -->

| Type | What | Tool | NOT tested here |
|------|------|------|-----------------|
| Unit | {e.g. domain logic, use case behavior in isolation} | {e.g. Vitest} | {e.g. DB queries, HTTP stack} |
| Integration | {e.g. repository against real DB, module boundaries} | {e.g. Vitest + test DB} | {e.g. full HTTP request lifecycle, UI rendering} |
| E2E | {e.g. critical user flows via API} | {e.g. Supertest / Playwright} | {e.g. internal implementation details} |

**Coverage target:** {e.g. unit tests for all domain and application layer; integration for all repository adapters}

**Mocking rule:** {e.g. mock at the boundary of the module under test — never mock domain logic}

**What not to test:** {e.g. do not write unit tests for simple getters/setters; do not write integration tests for third-party libraries; do not write E2E tests for edge cases that can be covered by unit tests}

<!-- For frontend tiers, add:
| Component | {e.g. UI components in isolation} | {e.g. Storybook / React Testing Library} | {e.g. routing, API calls} |
-->

---

## 8. Naming Conventions

<!-- Optional section for naming classes, functions, files, and folders. If there are no specific conventions beyond the language/framework defaults, omit this section. -->

---


## Related Decisions
<!-- RELATED DECISIONS
     Reference ADRs that justify the choices in this document.
     Do not duplicate their content here. -->
- [{ADR-ID} — {title}]({path-to-adr})
<!-- Add one line per related ADR -->
