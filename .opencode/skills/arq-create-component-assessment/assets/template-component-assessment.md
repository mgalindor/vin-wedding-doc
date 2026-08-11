---
title: "{component-name} Component Assessment"
date: {YYYY-MM-DD}
type: component-assessment
scope: internal
version: 1.0.0
updated: {YYYY-MM-DD}
component: {component-name}
---

<!--
This assessment does not require code examples, but it must be grounded in concrete evidence from the codebase. Each section should be filled out based on actual findings from code exploration, not assumptions or general knowledge. The goal is to create a living document that accurately reflects the current state of the component, which can be updated as the code evolves.

TEMPLATE: Component Assessment
PURPOSE: Documents the technical structure, interfaces, data model, and responsibilities of an existing code component (container) through archaeological analysis.
AUDIENCE: Architects, developers, and technical leads who need to understand the component before modifying it.
PLACEHOLDER FORMAT: {variable-name} — replace with actual values discovered from code exploration.
COMMENTS: HTML comments (like this one) provide guidance for filling each section. Remove all comments from the final document.
USAGE: Each section is filled by a subagent during the corresponding workflow step. Do not fill all sections at once.
-->

# Component Assessment — {component-name}

<!-- Section: Overview (Step 1)
PURPOSE: High-level technical identity of the component. READ BY EVERY SUBSEQUENT SUBAGENT — must be accurate because all future analysis depends on knowing the tech stack.
FORMAT: Use exact versions from descriptor files. List only architecturally significant frameworks — skip utilities.

EXAMPLES — Attribute table:
  | Language  | Java 21                     |
  | Runtime   | JVM (OpenJDK 21)            |
  | Platform  | Docker / Kubernetes (Linux) |
  | Build Tool| Maven 3.9.6                 |

EXAMPLES — Frameworks table:
  | Spring Boot 3.2   | Web framework and dependency injection   |
  | Spring Data JPA   | ORM and repository layer over PostgreSQL |
  | Spring Security   | Authentication and authorization         |
  | Flyway            | Database schema migration                |
-->
## Overview

{2–4 sentences describing what this component does, who uses it, and what problem it solves. Base this on README.md, entry point classes, and main package names.}

| Attribute | Value |
|---|---|
| Language | {language and version, e.g. Java 21} |
| Runtime | {runtime and version, e.g. JVM OpenJDK 21 / Node 20 / Python 3.12} |
| Platform | {deployment target, e.g. Docker / Kubernetes (Linux) / AWS Lambda / Bare metal} |
| Build Tool | {tool and version, e.g. Maven 3.9.6 / npm 10.2 / Gradle 8.5} |

### Key Frameworks and Libraries
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

## Component Responsibility

### Responsibility Classification

| Aspect | Value |
|---|---|
| Primary Type | {one of: Business Process / Domain / Workflow / Channel-BFF / Integration Adapter / Technical Platform / Data-Decision} |
| Secondary Type(s) | {additional type if applicable, or "None"} |

### Justification

{2–4 sentences. Cite concrete evidence: owned tables, entry point count, dependency pattern, messaging role. Example: "This component owns the Order and OrderLineItem tables, exposes 14 REST endpoints for order lifecycle management, and publishes domain events consumed by 3 downstream services — consistent with a Domain responsibility type centered on the Order bounded context."}

### Main Capabilities

1. {specific capability — what the component does, not just what it contains}
2. {specific capability}
3. {add more as needed, up to 10 total}


<!-- Section: Configuration Style (Step 2)
PURPOSE: High-level picture of runtime configuration dependencies — deployment requirements and operational coupling. NOT fine-grained code detail.
FORMAT: Subsections are optional — only include a subsection if the mechanism is actually used. If not used, mark "No" and skip the subsection.
NEVER include secret values — record the storage mechanism and variable name only.
ARCHITECT NOTE: External config systems (Vault, Consul, Config Server) are runtime startup dependencies — flag them explicitly.

EXAMPLES — Configuration Mechanisms table:
  | Configuration files    | Yes | application.yml, application-prod.yml (Spring profiles)       |
  | Environment variables  | Yes | DB credentials, API keys — accessed via process.env           |
  | External config systems| Yes | HashiCorp Vault — injected at startup via spring-vault         |
  | Code constants         | Yes | src/config/constants.ts — request timeouts, feature flags     |
  | Database config        | No  | —                                                              |
  | Command-line arguments | No  | —                                                              |
-->
## Configuration Style

### Configuration Mechanisms

| Mechanism | Used | Details |
|---|---|---|
| Configuration files | {yes/no} | {file names and format, e.g. application.yml, .env} |
| Environment variables | {yes/no} | {access pattern and categories, e.g. DB credentials, API keys via process.env} |
| External config systems | {yes/no} | {system name and how it is integrated, e.g. Vault via spring-vault at startup} |
| Code constants | {yes/no} | {file path and what type of values, e.g. src/config/constants.ts — timeouts, feature flags} |
| Database config | {yes/no} | {table name and what is stored, e.g. app_settings table — feature toggles} |
| Command-line arguments | {yes/no} | {flag names and purpose if applicable} |

### Configuration Files

| File | Format | Profile / Environment | Purpose |
|---|---|---|---|
| {file-name} | {YAML/JSON/TOML/Properties/INI} | {all/dev/staging/prod} | {what it configures} |

### Environment Profiles

{List the environment profiles defined in this component, e.g.: dev, staging, prod. Write "None" if the component uses a single configuration for all environments.}

### Environment Variables Accessed on Code

| Variable Name | Purpose | Access Pattern |
|---|---|---|
| {env-variable-name} | {what it configures, e.g. database connection string} | {code access pattern, e.g. os.environ['DB_CONNECTION'] or os.getenv('DB_CONNECTION')} |  

### Secrets Management

| Secret Category | Storage Mechanism | Notes |
|---|---|---|
| {category, e.g. Database credentials} | {env variable / Vault / AWS SSM / Hardcoded / Keystore} | {relevant observation, e.g. injected via CI/CD, ⚠ hardcoded — security risk} |

### Code Constants

| File Path | Constant Name | Value | Purpose | Notes |
|---|---|---|---|---|

<!-- Section: Input Interfaces (Step 3)
PURPOSE: All inbound entry points — "who calls this component and how". Covers HTTP, UI, messaging, schedules, polling, and CDC.
FORMAT: Write "None" in a subsection if nothing was found — do not remove the heading.
         For large APIs (30+ endpoints), group by resource prefix with counts instead of listing every endpoint.

EXAMPLES — API Endpoints:
  | POST | /api/v1/orders             | OrderController.create()       | Creates a new order          |
  | GET  | /api/v1/orders/{id}        | OrderController.findById()     | Retrieves order by ID        |
  | PUT  | /api/v1/orders/{id}/status | OrderController.updateStatus() | Updates order lifecycle state|

EXAMPLES — Messaging Consumers:
  | orders.created   | Kafka | OrderCreatedConsumer  | Processes new order events from the checkout service |
  | payments.confirmed| Kafka| PaymentEventConsumer  | Confirms payment and triggers fulfillment            |

EXAMPLES — Scheduled Tasks:
  | 0 2 * * * (daily 2am) | ReportGenerationJob.run() | Generates daily sales summary report  |
  | every 5 minutes        | InventorySyncJob.sync()   | Syncs inventory levels with warehouse |
-->
## Input Interfaces

### API Endpoints

| Method | Path | Handler | Description |
|---|---|---|---|
| {GET/POST/PUT/DELETE/PATCH} | {/api/v1/resource or /api/v1/resource/{id}} | {ControllerClass.methodName()} | {what this endpoint does} |

### User Interfaces

| Type | Technology | Description |
|---|---|---|
| {Web App / Admin Panel / Mobile shell / etc.} | {React / Angular / Thymeleaf / JSP / etc.} | {what screens or flows it serves} |

### Messaging Consumers

| Queue / Topic | Technology | Consumer Class | Description |
|---|---|---|---|
| {queue-or-topic-name} | {Kafka / RabbitMQ / SQS / etc.} | {ConsumerClassName} | {what event it handles and what action it triggers} |

### Scheduled Tasks

| Schedule | Handler | Description |
|---|---|---|
| {cron expression or interval, e.g. 0 0 * * * or every 5 min} | {JobClass.methodName()} | {what it does and why it runs on schedule} |

### Resource Polling

| Resource Type | Target | Interval / Trigger | Purpose |
|---|---|---|---|
| {Filesystem / SFTP / S3 / HTTP endpoint} | {path, URL, or bucket} | {polling interval or trigger condition} | {what it reads and what it does with it} |

### Database Change Events (CDC)

| Source Table | Event Type | Consumer | Description |
|---|---|---|---|
| {source-table-or-collection} | {INSERT / UPDATE / DELETE / all} | {consumer class or connector name} | {what business action is triggered} |

<!-- Section: Output Interfaces (Step 4)
PURPOSE: All outbound dependencies — "what does this component need to do its job". Reveals deployment constraints and integration risk.
FORMAT: Remove unused datastore type rows (RDBMS/NoSQL/Cache/File Store). Write "None" for unused subsections.
         NEVER include connection string values — reference the environment variable name only (e.g. $DB_HOST).

EXAMPLES — API Integrations:
  | Payment Gateway API  | REST | PaymentGatewayClient | Processes card payments and refunds               |
  | Legacy ERP           | SOAP | ErpSoapClient        | Syncs order status with legacy fulfillment system |

EXAMPLES — Datastores:
  | RDBMS     | PostgreSQL 15 | orders_db       | Spring Data JPA  | Read-Write | Main operational database              |
  | Cache     | Redis 7       | —               | Lettuce          | Read-Write | Caches product catalog and session data|
  | File Store| AWS S3        | invoices-bucket | AWS SDK v2       | Write-only | Stores generated PDF invoices          |

EXAMPLES — Messaging Publishing:
  | order.confirmed   | Kafka | OrderEventPublisher   | Published after order is successfully placed |
  | invoice.generated | Kafka | InvoiceEventPublisher | Notifies billing service when invoice ready  |
-->
## Output Interfaces

### API Integrations

| Target Service | Protocol | Client Class | Description |
|---|---|---|---|
| {service name or base URL pattern, e.g. Payment Gateway API} | {REST / gRPC / SOAP / GraphQL} | {ClientClassName} | {what this component uses it for} |

### Datastores

| Type | Technology | Schema / Database | Access Library | Access Pattern | Description |
|---|---|---|---|---|---|
| RDBMS | {e.g. PostgreSQL 15} | {schema or database name} | {e.g. Spring Data JPA / Hibernate} | {Read-Write / Read-heavy / Write-only} | {what data is stored here} |
| NoSQL | {e.g. MongoDB 6} | {database.collection} | {e.g. Mongoose / Spring Data MongoDB} | {Read-Write / Read-heavy / Write-only} | {what data is stored here} |
| Cache | {e.g. Redis 7} | — | {e.g. Lettuce / ioredis} | {Read-Write} | {what is cached and why} |
| File Store | {e.g. AWS S3 / SFTP server} | {bucket or path} | {e.g. AWS SDK v2} | {Write-only / Read-Write} | {file type and purpose} |

### Messaging Publishing

| Queue / Topic | Technology | Producer Class | Description |
|---|---|---|---|
| {topic-or-queue-name} | {Kafka / RabbitMQ / SQS / SNS} | {ProducerClassName} | {what events are published and when} |

### Email

| Provider | Protocol / SDK | Library | Purpose |
|---|---|---|---|
| {e.g. SendGrid / AWS SES / SMTP server} | {REST API / SMTP} | {e.g. sendgrid-java / JavaMailSender} | {when and why emails are sent} |

### Authentication Services

| Provider | Protocol | Library | Purpose |
|---|---|---|---|
| {e.g. Keycloak / Auth0 / LDAP / Internal JWT} | {OAuth2 / OIDC / LDAP / JWT} | {e.g. spring-security-oauth2 / passport-jwt} | {what it validates: user tokens, service tokens, API keys} |

### Monitoring & Observability

| Aspect | Technology | Notes |
|---|---|---|
| Logging | {e.g. Logback + ELK / Winston + CloudWatch} | {log format: structured JSON / plain text; log levels used} |
| Metrics | {e.g. Micrometer + Prometheus / DataDog} | {what is instrumented: HTTP latency, queue depth, custom business counters} |
| Tracing | {e.g. OpenTelemetry + Jaeger / AWS X-Ray / None} | {whether distributed tracing is propagated or absent} |

<!-- Section: Data Archaeology (Step 5)
PURPOSE: The inherited data model is the heaviest constraint in a brownfield system — document it explicitly.
FORMAT: DBML for RDBMS (core tables only, max 20; summarize the rest). Remove subsections for unused datastore types.
         NEVER include real data or PII. Ownership: "Owned" = source of truth here; "Shared/Replicated" = copy from another system.

EXAMPLES — Key Data Entities:
  | Order         | Owned             | Has many OrderLineItems; references Customer ID (replicated, no FK)    |
  | OrderLineItem | Owned             | Belongs to Order; references Product ID (replicated, no FK)            |
  | Customer      | Shared-Replicated | Received from Customer service via Kafka event; not stored locally     |

EXAMPLES — Problematic Legacy Patterns:
  | God table           | orders (47 columns)     | High   | Mixes lifecycle, shipping, billing, and audit in one table           |
  | Multi-purpose field | orders.status (varchar) | Medium | Stores 12 values with no constraint — acts as informal state machine |
  | Missing FK          | order_items → products  | Low    | product_id is a plain integer; no referential integrity enforced     |
  | JSON blob in RDBMS  | orders.metadata (json)  | Medium | Untyped JSON column accumulated feature-specific fields over time    |
-->
## Data Archaeology

### Data Schema

#### RDBMS

```dbml
// Example — replace with actual schema discovered from migration or entity files
Table orders {
  id          uuid        [primary key, default: `gen_random_uuid()`]
  customer_id uuid        [not null, note: "Replicated — no FK to customers table"]
  status      varchar(30) [not null]
  total_amount decimal(10,2)
  created_at  timestamp   [not null, default: `now()`]
  updated_at  timestamp
}

Table order_items {
  id         uuid    [primary key]
  order_id   uuid    [ref: > orders.id]
  product_id uuid    [not null, note: "Replicated — no FK"]
  quantity   int     [not null]
  unit_price decimal(10,2)
}
```

#### NoSQL

```json
{
  "collection": "{collection-name}",
  "description": "{what documents in this collection represent}",
  "representativeDocument": {
    "_id": "ObjectId",
    "{field-name}": "{type — e.g. string, number, array, nested object}"
  },
  "indexes": ["{index-name or field combination}"]
}
```

#### Caching

```json
{
  "keyPattern": "{e.g. session:{userId} or product:catalog:{categoryId}}",
  "valueType": "{e.g. JSON object / string / hash}",
  "ttl": "{e.g. 30 minutes / no expiry}",
  "purpose": "{what is cached and why}"
}
```

#### File Store

| Aspect | Detail |
|---|---|
| Storage | {e.g. AWS S3 bucket: invoices-prod / local filesystem: /var/data/uploads} |
| Path pattern | {e.g. invoices/{year}/{month}/{orderId}.pdf} |
| File format | {e.g. PDF, CSV, XML, JSON, binary} |
| Lifecycle | {e.g. retained indefinitely / deleted after 90 days / archived to Glacier} |

### Key Data Entities and Relationships

| Entity | Ownership | Key Relationships |
|---|---|---|
| {entity name, e.g. Order} | {Owned / Shared-Replicated} | {e.g. Has many OrderLineItems; references Customer ID (replicated, no FK)} |

### Problematic Legacy Patterns

| Pattern | Location | Impact | Details |
|---|---|---|---|
| {pattern name, e.g. God table / Missing FK / Multi-purpose field / JSON blob in RDBMS / Soft delete without index} | {table.column or collection.field} | {High / Medium / Low} | {specific description of what the problem is and why it matters} |

<!-- Section: Component Responsibility (Step 6)
PURPOSE: Synthesize all previous sections into a responsibility classification and concrete capability list.
FORMAT: Primary Type must be one of the 7 types below. Secondary only if genuinely present.
         Capabilities: 1–10 items ordered by importance. Each must be a concrete action verifiable against Step 3 interfaces.
         Justification must cite evidence (e.g. "owns 2 core tables, 14 REST endpoints, publishes 3 domain events").

TYPE REFERENCE:
  Business Process    → Full business capability (e.g. Authentication, Billing, Antifraude)
  Domain              → Owns a core entity and its operations (e.g. Orders, Products, Customers)
  Workflow            → Multi-step coordination / sagas / state machines (EIP patterns)
  Channel / BFF       → Aggregates and adapts data for a specific consumer (Web, Mobile, Partner)
  Integration Adapter → Translates between this and an external/legacy system (ACL, Gateway)
  Technical Platform  → Cross-cutting infrastructure (Feature flags, Rate limiting, Observability)
  Data / Decision     → Owns critical data or complex decision logic (Pricing engine, Fraud model)

EXAMPLES — Main Capabilities (BAD vs GOOD):
  BAD:  "Handles order data"
  GOOD: "Creates and tracks orders through their full lifecycle (pending → confirmed → shipped → delivered)"

  1. Creates and tracks orders through their full lifecycle (pending → confirmed → shipped → delivered)
  2. Validates stock availability before confirmation via synchronous call to Inventory service
  3. Publishes order.confirmed and order.cancelled domain events consumed by downstream services
-->

## Cross-cutting Concerns

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
