# Step 5: Data Archaeology

## Goal

Document the data model owned or managed by this component. In brownfield projects, the inherited data model is often the heaviest constraint and the hardest to change. This step makes that constraint explicit.

## What to Discover

### Data Schema

For each type of datastore identified in Step 4 (Output Interfaces), document the schema:

- **RDBMS**: Tables, columns, types, primary keys, foreign keys, indexes, constraints
- **NoSQL**: Collections/documents, field structures, indexes
- **Caching**: Key patterns, value structures, TTL policies
- **File Store**: File formats, naming conventions, directory structures

### Key Data Entities and Relationships

- Identify the most important domain entities (the "core tables" or "core collections")
- Map their relationships (1:1, 1:N, N:M)
- Note which entities are owned by this component vs. shared with or replicated from other components

### Problematic Legacy Patterns

Look for common data model issues:

- **God tables**: Tables with 50+ columns that contain unrelated data
- **Multi-purpose fields**: Columns like `type`, `status`, `data` that encode different things depending on context
- **Missing foreign keys**: Logical relationships that exist but have no FK constraints
- **Soft deletes without indexing**: `deleted_at` or `is_active` columns without proper indexes
- **JSON blobs in RDBMS**: Structured data stored as serialized JSON in text/JSON columns
- **Circular dependencies**: Tables that reference each other in cycles
- **Missing audit trails**: No `created_at`, `updated_at`, or version columns
- **Denormalized aggregates**: Precomputed totals or cached values stored in the source table
- **Enum-as-string without constraints**: Status or type fields with no CHECK constraints

## How to Explore

- **Migrations**: Search for migration files (`db/migrate/`, `migrations/`, `flyway/`, `liquibase/`, `alembic/`, `prisma/migrations/`)
- **ORM entities**: Search for entity definitions (`@Entity`, `@Table`, `Schema.define`, `Model`, `@model`, `class Meta:`)
- **SQL scripts**: Search for `.sql` files that create or alter tables
- **Schema files**: Look for `schema.prisma`, `schema.graphql`, `dbml` files
- **NoSQL models**: Search for Mongoose schemas, DynamoDB table definitions, Elasticsearch mappings
- If no migrations or entity files are found, document the configuration for connecting to the datastore and note that the schema must be inspected directly

## Key Questions This Step Must Answer

- What are the core domain tables or collections owned by this component?
- How do the key entities relate to each other — what are the main 1:N and N:M relationships?
- Are there god tables, multi-purpose columns, missing FKs, or other structural problems that will constrain future changes?
- Is the schema versioned through migrations? Is the migration history complete and traceable?
- Which data does this component own vs. replicate or read from another component?
- Are there orphan records possible due to missing referential integrity constraints?
- Is there evidence of audit trails (created_at, updated_at, version columns)?

## Notes

- The DBML format is preferred for RDBMS because it is readable and widely supported by visualization tools
- Do NOT include sample data or PII in the schema documentation
- If the schema is very large, focus on the core domain tables and provide a summary of utility/support tables
- Flag any data patterns that would make future changes particularly difficult (these become constraints for architecture decisions)
