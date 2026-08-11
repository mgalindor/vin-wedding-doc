---
title: "Project Dashboard"
date: 2026-06-09
type: tech-manual
scope: internal
---

# Project Dashboard

A read-only, client-side web dashboard that visualises project data stored in Markdown files.
It uses **MarkdownDB** to index all `.md` files in the workspace into a SQLite database
(`markdown.db`), then loads that database directly in the browser via **sql.js** (WebAssembly) —
no backend, no build step.

## How It Works

```
Markdown files  →  npx mddb ./  →  markdown.db  →  browser (sql.js)  →  dashboard UI
```

1. `npx mddb ./` scans the workspace and writes `markdown.db` to the workspace root.
2. `npx serve . -l 3000` serves the workspace root as a static site.
3. The browser fetches `/markdown.db`, loads it with sql.js, and runs SQL queries directly.

## Running the Dashboard

```bash
# 1. Regenerate the database (run from workspace root)
npx mddb ./

# 2. Start the static server (must be run from workspace root)
npx serve . -l 3000

# 3. Open in browser
http://localhost:3000/dashboard/web/
```

> [!IMPORTANT]
> The server **must** be started from the workspace root, not from `dashboard/`.
> `markdown.db` must exist at the workspace root — not inside the `dashboard/` folder.

## Dashboard Views

| View | Data source | Description |
|------|-------------|-------------|
| **Overview** | `README.md` front matter + `product-backlog.md` tasks | Project stats: progress, bugs, specs, decisions |
| **Backlog** | `product-backlog.md` tasks | All backlog items grouped by domain, filterable by sprint / owner / status |
| **Tasks** | All `.md` files (excluding `product-backlog.md` and `4-specs/`) | Checklist tasks scattered across other project documents |
| **Journeys** | Files with `filetype: analysis` whose path contains `journey` | Journey map cards |
| **Documents** | All `.md` files with a `type` front matter field | Grouped by document type |
| **AI Tools** | Files ending in `.agent.md`, `.prompt.md`, `.instructions.md`, `SKILL.md` | Grouped catalogue of AI assets |

## File Requirements for Each View

### Overview — project header (client, name, dates)

Source: `README.md` (workspace root)

Required front matter fields:

```yaml
---
client: "Acme Corp"
project: "My Project"
summary: "One-line description"
project-start-date: "2026-01-01"
project-end-date: "2026-12-31"
---
```

### Overview & Backlog — backlog items and bugs

Source: any file whose path contains `product-backlog`

Tasks are written as Markdown checkboxes using the following format:

```markdown
- [ ] {id} {Short title — verb + object} - {user story} {tags}
```

Example:
```markdown
- [ ] US-001 Implement login - As a user, I want to log in so I can access my account. [groupBy:: authentication] [owner:: alice] [sprint:: Sprint-1] [priority:: 1]
- [x] BUG-001 Fix null pointer on save [groupBy:: core] [sprint:: Sprint-1]
```

#### Story ID Prefixes

| Prefix | Type | Counted in |
|--------|------|------------|
| `US-` | User Story | Backlog progress bar |
| `ARC-` | Architecture task | Backlog progress bar |
| `OPS-` | Operations task | Backlog progress bar |
| `SPIKE-` | Technical task | Backlog progress bar |
| `BUG-` | Bug | Bug progress bar |

The ID is auto-detected from the start of the task text. Alternatively, set it explicitly via the `[story-id:: US-01]` inline tag.

#### Metadata Tags (Backlog)

These tags are parsed from the task text and power the table columns and filters in the Backlog view:

| Tag | Column | Filter | Description |
|-----|--------|--------|-------------|
| `[groupBy:: domain]` | Domain | Domain | Category that groups stories on the board |
| `[owner:: name]` | Owner | Owner | Responsible person or team |
| `[sprint:: identifier]` | Sprint | Sprint | Sprint the story is planned for |
| `[priority:: number]` | Priority | — | 1-5 (5=highest) |
| `[weight:: number]` | Weight or complexity | — | 1-5 (5=highest) |
| `[due:: YYYY-MM-DD]` | — | — | Due date (stored, not shown as column) |
| `[story-id:: id]` | ID | — | Explicit story ID override (alternative to text prefix) |

#### Spec Linking

Spec documents (functional specs, tech specs, task lists) are automatically linked to a story row when the spec file's front matter contains a matching `story-id`:

```yaml
---
story-id: US-001
---
```

Linked specs appear as clickable chips when expanding a story row in the Backlog view.

### Journeys view

Source: files with **both** conditions:
- `filetype: analysis` in YAML front matter
- `journey` somewhere in the file path

```yaml
---
title: "User Journey: Donation Reception"
date: 2026-03-18
type: analysis
filetype: analysis
---
```

### Documents view

Source: any `.md` file with a `type` field in front matter.

Supported `type` values: `project-brief`, `sow`, `prd`, `discovery`, `analysis`,
`architecture`, `decision-record`, `specification`, `meeting-notes`, `transcript`,
`tech-manual`, `user-manual`, `change-management`, `risk-management`, `management`, `reference`.

Files without a `type` field are silently ignored.

### AI Tools view

Source: files matching these name patterns anywhere in the workspace:
- `*.agent.md` — Agents
- `*.prompt.md` — Prompts
- `*.instructions.md` — Instructions
- `SKILL.md` — Skills (files named exactly `SKILL.md`, excluding any path containing `resources`)

Optional front matter:
```yaml
---
name: "My Skill Name"
description: "What this skill does"
---
```

### Tasks view

Source: all `.md` files **except**:
- Files whose path contains `product-backlog`
- Files in hidden folders (starting with `.`)
- Files under `4-specs/`

Any Markdown checkbox in those files appears here:

```markdown
- [ ] Review architecture diagram [owner:: bob]
- [x] Send meeting notes to client
```

Supported inline metadata: `owner`.

## Frequent Problems

### Dashboard shows "Loading database…" and never loads

- `markdown.db` is missing. Run `npx mddb ./` from the workspace root.
- The server was started from the wrong folder. Stop it and restart from the workspace root:
  ```bash
  npx serve . -l 3000
  ```
- A browser extension is blocking the WASM file from the CDN. Open DevTools → Console to see the error.

### Overview stats show zero

- `product-backlog.md` is missing or does not contain any checkbox tasks (`- [ ]`).
- The file path does not contain the word `product-backlog`. Rename it or adjust the path.
- Project dates / name do not appear: check that `README.md` has the front matter fields listed above.

### Backlog board shows all items under "sin grupo" / "otros"

- Tasks in `product-backlog.md` are missing the `[groupBy:: domain]` metadata tag.

### Journey count is 0

- Journey files either lack `filetype: analysis` in front matter, or the word `journey` is not in their path.

### Documents view is empty or a document is missing

- The file has no `type` field in its YAML front matter, or the value is not one of the supported types.

### A document I added is not visible

- Re-run `npx mddb ./` to regenerate the database — the dashboard reads a **snapshot**; it does not watch for changes.

### Port 3000 already in use

```powershell
# Windows — find and kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

```bash
# macOS / Linux
lsof -i :3000
kill -9 <PID>
```

### Changes to Markdown files are not reflected

The database is a static snapshot. After editing any `.md` file, rerun:
```bash
npx mddb ./
```
Then reload the browser page.
