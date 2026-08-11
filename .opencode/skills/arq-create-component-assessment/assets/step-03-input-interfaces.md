# Step 3: Input Interfaces

## Goal

Identify all inbound entry points that trigger actions in the component. These are the interfaces through which external actors (users, other systems, events) initiate work in this component.

## What to Discover

Classify findings into these categories:

### API Endpoints
- REST endpoints (controllers, route handlers)
- GraphQL resolvers or schema definitions
- gRPC service definitions
- SOAP service endpoints
- WebSocket endpoints

### User Interfaces
- Web pages, forms, or views served by this component
- Admin panels or dashboards
- CLI interfaces exposed by the component

### Messaging System Consumers
- Queue consumers (RabbitMQ, SQS, ActiveMQ, etc.)
- Pub/sub subscribers (Kafka consumers, Google Pub/Sub, SNS, etc.)
- Event stream consumers

### Scheduled Tasks
- Cron jobs or scheduled tasks (@Scheduled, node-cron, Celery Beat, Hangfire, etc.)
- Batch jobs triggered on a timer

### Resource Polling
- File system watchers or pollers
- SFTP/FTP polling
- External API polling

### Database Change Events (CDC)
- Change Data Capture consumers (Debezium, AWS DMS, etc.)
- Database triggers that initiate logic in this component
- Outbox pattern processors polling a database table for new records to process

## How to Explore

- **REST/HTTP**: Search for controller annotations/decorators:
  - Java/Kotlin: `@RestController`, `@Controller`, `@RequestMapping`, `@GetMapping`, `@PostMapping`
  - Node/Express: `app.get(`, `app.post(`, `router.get(`
  - Python/Flask/FastAPI: `@app.route`, `@router.get`, `@api_view`
  - .NET: `[ApiController]`, `[HttpGet]`, `[HttpPost]`
- **GraphQL**: Search for `@QueryMapping`, `@MutationMapping`, `type Query`, `type Mutation`, `resolvers`
- **gRPC**: Search for `.proto` files, `@GrpcService`
- **Messaging**: Search for `@KafkaListener`, `@RabbitListener`, `@SqsListener`, `@JmsListener`, consumer class names
- **Scheduled**: Search for `@Scheduled`, `@Cron`, `cron`, `schedule`, `setInterval`
- **Polling**: Search for polling patterns, watchers, file listeners
- **CDC / Database events**: Search for Debezium consumers, outbox pattern processors, database polling loops, `@TransactionalEventListener`

For each endpoint found, note the HTTP method, path, and a brief description of its purpose (infer from handler name or comments).

## Key Questions This Step Must Answer

- How does the outside world trigger work in this component — HTTP call, message/event, schedule, file change, or database change?
- What HTTP methods and paths are exposed? Are they versioned? Is there an OpenAPI/Swagger spec?
- Which queues, topics, or event streams does this component consume? What triggers each consumer?
- Are there scheduled tasks? What do they do and how often do they run?
- Does this component poll any external resource (SFTP, filesystem, API)? What and how frequently?
- Does this component react to database change events (CDC, outbox processor, DB trigger)?
- Is there more than one API version coexisting in the codebase? Is there a deprecation strategy visible?

## Notes

- Be thorough — missing an entry point means missing a capability of the component
- For large APIs (50+ endpoints), group by resource or module and provide counts
- If there are API documentation files (OpenAPI/Swagger), use them as a reference but verify against code
- Note if endpoints are versioned (v1, v2) and whether multiple versions coexist
