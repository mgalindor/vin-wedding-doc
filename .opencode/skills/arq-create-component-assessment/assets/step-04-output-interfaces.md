# Step 4: Output Interfaces

## Goal

Identify all outbound dependencies — external systems, services, datastores, and middleware that this component actively calls, writes to, or pushes data to.

## What to Discover

Classify findings into these categories:

### API Integrations
- REST/HTTP clients calling external services
- gRPC clients
- SOAP clients
- WebSocket client connections

### Datastores

#### RDBMS
- PostgreSQL, MySQL, SQL Server, Oracle, SQLite, etc.
- Connection details, schema names, ORM/query tool used

#### NoSQL
- MongoDB, DynamoDB, Cassandra, Elasticsearch, etc.
- Collection/index names, client library used

#### Caching
- Redis, Memcached, Hazelcast, in-memory caches
- What is cached and cache invalidation strategy if visible

#### File Store
- Local filesystem writes
- SFTP/FTP uploads
- Cloud storage (S3, GCS, Azure Blob)

### Messaging Publishing
- Queue producers (RabbitMQ, SQS, ActiveMQ)
- Pub/sub publishers (Kafka producers, Google Pub/Sub, SNS)
- Event bus emitters

### Email
- SMTP integration
- Email service providers (SendGrid, SES, Mailgun)

### Authentication Services
- OAuth providers
- LDAP/Active Directory
- Identity providers (Auth0, Keycloak, Cognito)

### Monitoring & Observability
- Logging frameworks and destinations (ELK, CloudWatch, Datadog)
- Metrics exporters (Prometheus, Micrometer, StatsD)
- Tracing (OpenTelemetry, Jaeger, Zipkin)

## How to Explore

- **HTTP clients**: Search for `RestTemplate`, `WebClient`, `HttpClient`, `fetch(`, `axios`, `requests.get`, `httpx`
- **Databases**: Search for connection strings, DataSource beans, ORM config (`@Entity`, `@Table`, `Schema.define`, `Model.define`), migration files
- **Redis/Cache**: Search for `RedisTemplate`, `ioredis`, `redis.createClient`, `@Cacheable`
- **File/Cloud storage**: Search for `S3Client`, `BlobServiceClient`, `Storage.bucket`, `fs.writeFile`, SFTP libraries
- **Messaging producers**: Search for `KafkaTemplate`, `RabbitTemplate`, `SqsClient`, `channel.sendToQueue`, `producer.send`
- **Email**: Search for `JavaMailSender`, `nodemailer`, `smtplib`, `SendGrid`
- **Auth**: Search for OAuth config, LDAP connection, JWT verification libraries, identity provider URLs
- **Monitoring**: Check logging config, metrics dependencies, tracing agent configuration

## Key Questions This Step Must Answer

- What external systems does this component depend on to function? Which are critical (component cannot start without them)?
- Which databases does the component read from and write to? What is the access pattern (read-heavy, write-heavy, both)?
- Does the component publish messages or events? To which topics/queues and what do they represent?
- Does it call external APIs? Are those integrations built with resilience in mind (retry, timeout, circuit breaker)?
- How are credentials and secrets for outbound connections injected — are they secure?
- Is there a monitoring and observability setup? Can someone detect when this component fails in production?
- Does the component send email or notifications? Through what service?

## Notes

- For each datastore, note the access pattern: read-heavy, write-heavy, or both
- If connection strings or URLs contain environment-specific values, note the variable name rather than the value
- Do NOT expose passwords, tokens, or secrets — redact them
- For messaging, distinguish between commands (point-to-point) and events (pub/sub)
