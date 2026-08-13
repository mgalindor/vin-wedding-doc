---
name: dev-create-tech-spec
description: "Produces the technical specification for a user story — the high-level technical design that aligns the team on how to build it before coding begins. Use when a story is approved and needs a tech spec, technical design, or technical specification"
user-invocable: false
metadata:
    type: skill
    version: "2.0.0"
    updated-at: "2026-07-29"
---

# What is a Technical Specification

A technical specification is the **structural design document** that defines what to build and how the parts connect — not how to implement them line by line. It bridges the approved functional specification and the implementation

It exists to answer: *What components need to change? What are their contracts? How do they connect?*

The spec is always scoped to a single story. It does not redesign the system — it identifies the minimal set of changes needed to implement the story within the existing architecture.

# Document

- **Template**: See [assets/template.md](assets/template.md) for the technical specification structure and section-by-section instructions.

## Document Lifecycle

| Status | Meaning |
|---|---|
| `draft` | Produced by the architect agent from the functional spec and architecture context. Contains structural decisions and open questions. Ready for peer review. |
| `approved` | Validated after the technical peer review. All open questions resolved. |

## Boundaries

It is **NOT**:
- A code sample — no implementation examples, no src paths, no class or method names
- A frontend implementation guide — no CSS, no HTML markup, no component library props, no styling details
- A rewrite of the functional specification — do not restate business rules
- An architecture document — operate within the existing architecture, do not redefine it

# Critical Patterns

## Scope Determination

Before writing anything, determine which layers are affected by the story. Only include sections for the affected layers:

- **Backend only** — no user interface changes
- **Frontend only** — connects to existing APIs, no server-side changes
- **Full stack** — both layers require changes

## API and Events Contract Notation

Use the lightweight YAML notation for all API input/output contracts. Every field comment must include: data type, required/optional, and applicable constraints (min/max length/value, enum values, format, ISO standard).

Always include the HTTP method and path or event name (in case documenting an event) as a header comment above the contract block.

```yaml
# POST /users  or 'on user-created'
security:
  type: jwt       # jwt, basic, oauth2, public
  role: admin     # admin, user, public
request:
  name: str       # str, required, min: 2, max: 100
  email: str      # str, required, email format
  age: int        # int, optional, min: 0, max: 150
  status: str     # str, required, enum: [active, inactive]
  nested: 
    field1: str    # str, required
    country: str    # str, required , 3char ISO 3166
response:
  id: int         # int, required
  created_at: str # str, required, ISO 8601
```

For gRPC or GraphQL, adapt the notation to the protocol but keep the same field-level comment convention.

## Database Changes

Use DBML code blocks for all table definitions. Always show the complete table definition — for modifications, add inline comments marking which fields are new or changed. Never show only the delta.

```dbml
Table users {
  id          int           [pk, increment]
  name        varchar(100)  [not null]
  email       varchar(255)  [not null, unique]
  status      varchar(20)   [not null, default: 'active']
  created_at  timestamp     [default: `now()`]

  indexes {
    email [name: 'idx_users_email', unique]
  }
}

Table bookings {
  id integer
  country varchar
  booking_date date
  created_at timestamp
  user_id integer [ref: > users.id] // link to users table field id

  indexes {
    (id, country) [pk] // composite primary key
    created_at [name: 'created_at_index', note: 'Date']
    booking_date
    (country, booking_date) [unique]
    booking_date [type: hash]
  }
}
```

# Process

## Step 1 — Read the functional specification

Locate and read the approved functional specification. Extract: user need, business rules, acceptance criteria, and any technical notes. If the specification is not in `approved` status, stop and inform the user.

## Step 2 — Gather architecture context

Read the architecture documentation to understand existing components, technology stack, integration patterns, and relevant decisions. This context constrains the design — the spec must operate within it.

## Step 3 — Explore the codebase

If the repository is accessible, locate the modules relevant to the story domain to confirm what already exists before proposing changes. If not accessible, mark affected components with `⚠️ Needs code exploration`.

## Step 4 — Determine scope

Decide which layers are affected (backend, frontend, or both) and document the reasoning in the Scope section.

## Step 5 — Build the technical specification

Use the template to produce the draft. Mark anything uncertain with `> ⚠️`. Skip sections that are out of scope and note why.