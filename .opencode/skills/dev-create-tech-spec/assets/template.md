<!--
  TEMPLATE: Technical Specification
  ===========================================
  PURPOSE: Defines the high-level technical design for a single user story.
           Covers all affected layers: backend, frontend (web/mobile), or both.
           Used as the design reference for implementation.

  HOW TO USE:
  - Replace all {placeholder} values with real content.
  - Remove <!-- instructions --> comments before finalizing the document.
  - Remove entire sections that are not applicable to the story scope.
  - Mark unresolved items with ⚠️.
  - PLACEHOLDER FORMAT: {descriptor-in-kebab-case}

-->

---
title: "Technical Specification — {story-id}: {story-short-title}"
date: YYYY-MM-DD
type: specification
scope: internal
story-id: "{story-id}"
status: draft         # draft | approved
version: 1.0.0
updated: YYYY-MM-DD
layers:
  backend: true       # true | false
  frontend: true      # true | false — set to false if no web UI impact
  mobile: true        # true | false — set to false if no mobile UI impact
---

<!-- this is a high level design document for a single user story. Do not include fine grain code implementation details -->

# Technical Specification — {story-id}: {story-short-title}

**Status: ⚠️ Draft**

---

## Scope

<!-- Declare which layers this story touches and why.
     Remove rows for layers that do not apply. -->

| Layer           | Affected | Justification                          | foldername                |
| --------------- | -------- | -------------------------------------- |
| Backend         | Yes / No | {why-backend-is-or-is-not-needed}      | {folder name of the code} |
| Frontend Web    | Yes / No | {why-frontend-web-is-or-is-not-needed} | {folder name of the code} |
| Frontend Mobile | Yes / No | {why-mobile-is-or-is-not-needed}       | {folder name of the code} |

---

## Architecture References

<!-- List of architecture documents including blue prints and adrs -->

| Documents | Description |
|---|---|


---

## Backend

### API Endpoints

<!-- List each endpoint this story exposes or modifies.
     Use the YAML contract notation with the HTTP method and path as a header comment.
     Each field comment must include: type, required/optional, and constraints (min, max, enum, format, sign).
     For gRPC or GraphQL, adapt the notation but keep the same field-level comment convention.
     Add one block per endpoint. If no new endpoints are needed, replace this section with a single line stating so. -->

**{CREATE|MODIFY|DELETE} — {HTTP-METHOD} {/api/path}**

<!-- One sentence explaining the purpose of this endpoint. -->

```yaml
# {HTTP-METHOD} {/api/path}
security:
  type:   # jwt, basic, oauth2, public
  role:   # admin, user, public
request:
  {field-name}: {example-value}  # type, required|optional, constraints
response:
  {field-name}: {example-value}  # type, required|optional, constraints
```

---

### Database Changes

<!-- List each table that is created, modified, or deleted.
     Use DBML for all table definitions. Always show the complete table definition.
     For modifications, mark new or changed fields with inline comments: // NEW or // MODIFIED.
     Never show only the delta — always show the full table.
     If no database changes are needed, replace this section with a single line stating so.

     REFERENCED TABLES (foreign keys to existing tables):
     If a table being defined has a foreign key to a table that already exists in the system
     but is NOT part of this story's changes, include that table as a stub with ONLY the
     referenced field. Do NOT include all its columns — this prevents diagram rendering errors. -->

**{CREATE|MODIFY|DELETE} — {table_name}**

```dbml
Table {table_name} {
  id          int           [pk, increment]
  {field_name}  varchar(255)  [not null]             // NEW
  {other_field} int           [not null, default: 0]  // MODIFIED: was nullable
  {ref_table}_id int         [not null]               // NEW — FK to existing {ref_table}
  created_at  timestamp     [default: `now()`]

  indexes {
    {field_name} [name: 'idx_{table_name}_{field_name}']
  }
}

// Stub — existing table, included only to satisfy the FK reference in the diagram
Table {ref_table} {
  id  int  [pk]
}

Ref: {table_name}.{ref_table}_id > {ref_table}.id
```

---

### Events

<!-- Include only if this story publishes or consumes events. Remove this section entirely if not applicable. -->

#### Published Events

<!-- One block per event. One sentence explaining when the event is published and why. -->

**{CREATE|MODIFY} — {domain}.{action}**

```yaml
event:
  name: {domain}.{action}   # follow domain.action convention — e.g., user.registered
  topic: {topic-name}
  payload:
    {field-name}: {example-value}  # type, required|optional, constraints
```

#### Consumed Events

<!-- One block per event. One sentence explaining what triggers it and what the handler does. -->

**{CREATE|MODIFY} — {domain}.{action}**

```yaml
event:
  name: {domain}.{action}
  topic: {topic-name}
  handler: {what-the-handler-does-when-this-event-arrives}
  payload:
    {field-name}: {example-value}  # type, required|optional, constraints
```

---

### Third-party Integrations (Backend)

<!-- Include only if the backend calls external APIs or services. Remove if not applicable.
     Describe the integration purpose, not implementation details. -->

| Action | Service | Purpose | Authentication |
|---|---|---|---|
| CREATE / MODIFY | {service-name} | {what-it-is-called-for-and-when} | {API key, OAuth2, mTLS, etc.} |

---

## Frontend

<!-- Include this section only if layers.frontend or layers.mobile is true. Remove entirely otherwise.
     Organized in three groups that reflect how a frontend architect reasons about a feature:
       - Structure:   what screens exist and how users navigate between them
       - Interaction: what users can do and how the UI responds
       - Data:        where data comes from, where it lives, and what external dependencies exist
     Remove any subsection that is not applicable to this story. -->

### Structure

#### Screens / Views

<!-- Design document — describe WHAT each screen shows and what users can do on it.
     Do NOT include: HTML markup, CSS class names, grid layout, or visual styling.
     One row per screen introduced or modified by this story. -->

| Action | Screen | Description |
|---|---|---|
| CREATE / MODIFY / DELETE | {ScreenName} | {what-this-screen-displays-and-what-user-actions-it-enables} |
| CREATE | `CalculationHistoryScreen` | Displays a paginated list of past insurance calculations; user can browse pages and refresh the list |
| MODIFY | `InsuranceCalculatorScreen` | Adds a navigation link to the history screen after a calculation is saved |

#### Navigation and Routing

<!-- OPTIONAL SECTION — include when this story adds a new screen, changes flows between screens,
     introduces a tab / modal / bottom sheet, or registers a new route accessible from other parts of the app.
     Design document — describe WHAT the navigation change is and WHAT triggers it.
     Do NOT include: router module configuration, route guard names, or URL path definitions.
     Skip when the story only modifies content within an existing screen with no routing impact.
     For mobile, always document the navigation stack type (push, modal, replace). -->

| Action | Route / Screen | Navigates from | Trigger | Stack type |
|---|---|---|---|---|
| CREATE / MODIFY | {route-or-screen-name} | {source-screen-or-entry-point} | {e.g., tap button, deep link, on login success} | push / modal / replace / tab |
| CREATE | `CalculationHistoryScreen` | Main navigation menu | User clicks the "History" tab | tab |
| CREATE | `CalculationDetailModal` | History screen | User clicks a row in the history table | modal |

---

### Interaction

#### UI Components

<!-- OPTIONAL SECTION — include only for components with meaningful logic or reuse potential.
     Exclude trivial presentational elements (labels, icons, static cards).
     Design document — describe WHAT the component shows and what interactions it enables.
     Do NOT include: CSS class names, HTML structure, component props, hooks, or internal state details.
     Remove this section if the story only modifies content within an existing screen. -->

| Action | Component | Description |
|---|---|---|
| CREATE / MODIFY / DELETE | {ComponentName} | {what this component displays and what user interactions it handles} |
| CREATE | `CalculationHistoryTable` | Displays a list of past calculations with vehicle, premium, and date; user can browse pages |
| CREATE | `PaginationControls` | Allows navigation between pages; Previous is disabled on the first page, Next on the last |
| MODIFY | `AppNavigation` | Adds a "History" entry to the main navigation menu |

#### Form Specifications

<!-- OPTIONAL SECTION — include only when the story introduces or significantly modifies a form.
     This is the INPUT CONTRACT for data collection — analogous to the API request contract.
     Design document — describe field labels, input types, validation rules, and actions.
     Do NOT include: CSS class names, HTML attributes, component library names (e.g., no "MUI TextField"), or layout details.
     Add one block per form. Remove this section entirely if the story introduces no forms. -->

**{CREATE|MODIFY} — {FormName}**

<!-- One sentence describing what this form collects and which screen it lives in. -->

| Field | Label | Input type | Required | Validation | Default |
|---|---|---|---|---|---|
| {field-name} | {Display Label} | text / number / date / select / file / textarea / checkbox / radio | Yes / No | {user-visible message} | {value or —} |
| vehicle_brand | Vehicle Brand | text | Yes | Required | — |
| vehicle_year | Year | number | Yes | Between 1990 and current year | current year |
| coverage_type | Coverage Type | select | Yes | Must select one option | — |
| market_price | Market Price (USD) | number | Yes | Greater than 0 | — |

**Actions:**

| Action | Label | Behavior |
|---|---|---|
| submit | {e.g., "Calculate"} | {e.g., calls POST /insurance-calculations, displays result on success} |
| clear | {e.g., "Clear"} | {e.g., resets all fields to their default values} |
| cancel | {e.g., "Cancel"} | {e.g., navigates back without saving} |

#### UI Behavior Rules

<!-- OPTIONAL SECTION — include only when the story introduces non-trivial client-side behavior.
     Design document — describe WHAT the rule is (conditional visibility, constraints, state-driven changes).
     Do NOT include: CSS class toggles, event handler names, animation names, or styling details.
     Remove this section if all UI behavior is straightforward. -->

| Element | Rule | Trigger |
|---|---|---|
| {element-name} | {e.g., "disabled when no records exist"} | {e.g., on data load} |
| `Previous` button | Disabled when viewing the first page | On page load and on each page change |
| `Next` button | Disabled when current page is the last page | On page load and on each page change |
| History table | Replaced by an empty-state message when there are no records | On data load |
| `Save` button | Disabled until all required fields pass validation | On any field change |

---

### Data

#### API Consumption (Frontend → Backend)

<!-- Map which backend endpoints this frontend feature calls.
     Design document — describe WHAT triggers the call and WHAT the UI does with the response.
     Do NOT include: fetch/axios code, HTTP headers, authentication tokens, or error handling implementation.
     Reference endpoints defined in the Backend section by method and path. -->

| Endpoint | Triggered by | Outcome in UI |
|---|---|---|
| {HTTP-METHOD} {/api/path} | {user-action-or-lifecycle-event} | {what-the-ui-does-with-the-response} |
| GET /insurance-calculations/history | User opens the History tab | Displays the first page of calculations in the table |
| GET /insurance-calculations/history | User clicks Previous or Next | Replaces the table content with the requested page |
| POST /insurance-calculations | User submits the calculation form | Shows the calculated premium and enables the Save button |

#### Data State Design

<!-- Key design decision: is this feature's data local to the screen or shared across screens?
     This drives whether you need a store / shared service / cache, or simple component state.
     Design document — describe WHAT data exists and its lifecycle.
     Do NOT include: store slice names, hook names, service class names, or framework-specific patterns.
     Omit trivial UI state (dropdown open/closed, hover, focus). -->

| Data | Scope | Lifecycle |
|---|---|---|
| {what data this feature manages} | local screen / shared across screens | {when it loads and when it resets} |
| calculation history list | local screen | Loads when the History tab opens; resets when user navigates away |
| current page index | local screen | Initializes at 0 when tab opens; updates on Previous / Next click |
| logged-in user session | shared across screens | Persists from login until logout |

#### Third-party Integrations (Frontend)

<!-- Include only if the frontend consumes external APIs, SDKs, or client-provided libraries. Remove if not applicable. -->

| Action | Service / SDK | Purpose | Notes |
|---|---|---|---|
| USE / INTEGRATE | {service-or-sdk-name} | {what-capability-it-provides} | {version-constraint-or-initialization-note} |

---

## Cross-cutting Concerns

### Security and Authorization

<!-- Describe which roles can access the new or modified functionality.
     Confirm alignment with the security model defined in the architecture.
     Reference decision records if a new security pattern is being introduced. -->

| Endpoint / Feature | Allowed roles | Notes |
|---|---|---|
| {endpoint-or-feature-name} | {roles} | {any-exception-or-note} |

---

### Error Handling

<!-- Describe the expected error handling strategy at a high level.
     Focus on user-visible errors and critical failure paths — not exhaustive exception catalogs. -->

| Scenario | Expected behavior |
|---|---|
| {e.g., Third-party API unavailable} | {e.g., Return 503, surface user-friendly message, log the error} |
| {e.g., Validation failure} | {e.g., Return 400 with field-level error messages} |

---

## Technical Risks and Constraints

<!-- List implementation risks, uncertainties, or constraints identified during design.
     Mark items that require a decision before implementation begins with ⚠️.
     If no risks are identified, state it explicitly — do not leave the table empty. -->

| Risk / Constraint | Impact | Mitigation |
|---|---|---|
| {description} | High / Medium / Low | {how-to-address-or-monitor-it} |

---

## Open Questions

<!-- List unresolved questions that must be answered before or during implementation.
     Tag each with the person or team who can answer it.
     This list must be empty before the document moves to approved status. -->

- [ ] {question?} — owner: {who-can-answer-this}
