---
name: project-resources
description: "Locates key project code resources. Trigger: When user needs or ask to create the source code configuration,  find architecture docs, ADRs, blueprints, or source code repositories  — or when a user asks where is the code?, where is the architecture documentation?, what repositories does this project have?, where are the blueprints?, what tiers exist?, where is the backend / frontend code?, or needs to understand the project's source code structure before implementing anything."
user-invocable: false
metadata:
    type: skill
    version: "1.0.0"
    updated-at: "2026-05-15"
---

# Critical Patterns

## Primary source: gene2-config.yaml

The file **`gene2-config.yaml`** lives at the **workspace root** (same level as `README.md`). Always read it before answering any question about project resources or before starting any implementation task. This file is the **single source of truth** for architecture and source code locations.

## Schema

```yaml
architecture:
  path:                         # list of workspace-relative folders with architecture docs and ADRs
    - ./path/to/architecture/
    - ./path/to/decision-records/
  blueprints:
    - tier: backend             # tier identifier (e.g. backend, frontend, mobile)
      path: ./path/to/backend-blueprint.md
    - tier: frontend
      path: ./path/to/frontend-blueprint.md

src-code:
  - name: service-name          # repository or service identifier
    type: backend               # matches tier names used in blueprints
    git: https://github.com/... # remote git URL — may be empty
    local: ../relative/path/    # local path relative to workspace root — may be empty
  - name: another-service
    type: frontend
    git:
    local: ../another/path/
```

## Example

```yaml
architecture:
  path:
    - ./05-iteration/53-architecture/
    - ./05-iteration/52-decision-record/
  blueprints:
    - tier: backend
      path: ./05-iteration/53-architecture/backend-blueprint.md

src-code:
  - name: coh-backend
    type: backend
    git:
    local: ../code/
  - name: datahub
    type: coh-frontend-web
    git:
    local: ../code/
```

## Sections

The file has two top-level sections:

### `architecture`

Describes where architecture documentation lives.

| Field | Description |
|---|---|
| `path` | List of workspace-relative folder paths that contain architecture documents, ADRs, and decision records |
| `blueprints` | List of tier blueprint entries |
| `blueprints[].tier` | Tier name (e.g., `backend`, `frontend`, `mobile`) |
| `blueprints[].path` | Workspace-relative path to the blueprint file for that tier |

### `src-code`

List of source code repositories that make up the project.

| Field | Description |
|---|---|
| `name` | Repository or service identifier |
| `type` | Technology tier of the codebase (e.g., `backend`, `frontend`, `mobile`) |
| `git` | Remote git URL — may be empty if not yet configured |
| `local` | Local file system path **relative to the workspace root** — may be empty if not yet checked out |

## Interpreting paths

- All paths are relative to the workspace root folder (the folder that contains `gene2-config.yaml`)
- When `local` is set on a `src-code` entry, use that path for all file-system operations: reading files, searching code, implementing features
- When `local` is empty and `git` has a value, the code is only accessible remotely — inform the user and suggest cloning the repository in the local folder before proceeding
- When both `local` and `git` are empty, flag the repository as not yet configured