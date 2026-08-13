---
title: "Functional Verification — OPS-023"
date: 2026-08-14
type: management
scope: internal
story-id: "OPS-023"
status: passed
version: 1.0.0
updated: 2026-08-14
verdict: pass
---

# Functional Verification — OPS-023

> **Verdict: ✅ PASS** — All 12 explicit constraints from the conversation that drove the delivery are satisfied.
> Date: 2026-08-14. Verifier: @architect (objective, independent review).
> Scope: commits `3ac8149` and `9cf29e0` on `code/`.

## Summary

| # | Constraint | Result | Evidence |
|---|---|---|---|
| 1 | Postgres version **17** | ✅ PASS | `code/docker-compose.yml:19` — `image: postgres:17` |
| 2 | No `container_name:` | ✅ PASS | `code/docker-compose.yml` contains no `container_name:` key (anywhere) |
| 3 | No custom `bridge` / `networks:` block | ✅ PASS | `code/docker-compose.yml` contains no top-level `networks:` key; only the implicit `default` is resolved |
| 4 | No `volumes:` (data must be ephemeral) | ✅ PASS | `code/docker-compose.yml` contains no `volumes:` key (file-level or service-level) |
| 5 | `.env.local` template exists at monorepo root, git-ignored | ✅ PASS | `code/.env.local` exists with documented template content; matches `.gitignore:12` |
| 6 | `DATABASE_URL` in `.env.local` matches Postgres credentials | ✅ PASS | Both sides: user=`wendy`, password=`wendy`, db=`wendy`, port=`5432` |
| 7 | ConfigModule loads `.env.local` from monorepo root, deterministic chain | ✅ PASS | `apps/api/src/config/app-config.module.ts:23-28` — root `.env.local` is entry #1; `__dirname` + 4 levels resolves to monorepo root |
| 8 | `pnpm docker:up`, `docker:down`, `docker:logs` wired in root `package.json` | ✅ PASS | `code/package.json:20-22` defines all three scripts |
| 9 | `docker compose config` validates the YAML syntax | ✅ PASS | Command exited 0; resolved config printed (see below) |
| 10 | README documents `docker:up → prisma migrate → pnpm dev` | ✅ PASS | `code/README.md` steps 3, 5, 6; full table at lines 95–97 |
| 11 | `.env.local` is in `.gitignore` | ✅ PASS | `git check-ignore -v .env.local` → `.gitignore:12:.env.local` |
| 12 | `.env.local` includes JWT_* fields (private key, kid, issuer, audience, TTLs) | ✅ PASS | Lines 31–36 include `JWT_PRIVATE_KEY_PEM`, `JWT_KEY_ID`, `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_ACCESS_TOKEN_TTL_SECONDS`, `JWT_REFRESH_TOKEN_TTL_SECONDS` |

## Verifications performed

### `docker compose config` (run from `code/`)

Command: `docker compose config`
Exit code: `0`
Verbatim output:

```yaml
name: code
services:
  postgres:
    environment:
      POSTGRES_DB: wendy
      POSTGRES_PASSWORD: wendy
      POSTGRES_USER: wendy
    image: postgres:17
    networks:
      default: null
    ports:
      - mode: ingress
        target: 5432
        published: "5432"
        protocol: tcp
networks:
  default:
    name: code_default
```

Interpretation:
- The YAML parses cleanly. No warnings or errors.
- The `networks:` block visible in the resolved output is the **implicit default network** that Docker Compose always materializes (`code_default`). The source file has no custom `networks:` declaration — that key only appears here because Compose's normalizer printed it. Constraint #3 (no custom `bridge` / `networks:` block in source) holds.
- The service uses the default network; no bridge was specified by the author.
- Port mapping `5432:5432` is present and resolves correctly.

### `git check-ignore -v .env.local` (run from `code/`)

Command: `git check-ignore -v .env.local`
Exit code: `0`
Verbatim output:

```
.gitignore:12:.env.local	.env.local
```

Interpretation:
- `.env.local` is matched by rule on line 12 of `.gitignore` (the `.env.local` pattern).
- The trailing `.env.local` after the tab is the source file path — confirming the match is on the file at `code/.env.local` itself, not a generic `.env.*.local` pattern.
- Constraint #11 (git-ignored) is verified by exit code + source attribution, not merely by file inspection.

### Credential cross-check (Constraint #6)

| Source | Field | Value |
|---|---|---|
| `docker-compose.yml` | `POSTGRES_USER` | `wendy` |
| `docker-compose.yml` | `POSTGRES_PASSWORD` | `wendy` |
| `docker-compose.yml` | `POSTGRES_DB` | `wendy` |
| `docker-compose.yml` | `ports` (host port) | `5432` |
| `.env.local` | `DATABASE_URL` | `postgresql://wendy:wendy@localhost:5432/wendy?schema=public` |

Mapping:
- URL user `wendy` ↔ `POSTGRES_USER=wendy` ✅
- URL password `wendy` ↔ `POSTGRES_PASSWORD=wendy` ✅
- URL host `localhost` is consistent with the published host port `5432` (Compose maps `5432:5432`, so `localhost:5432` reaches the container) ✅
- URL port `5432` ↔ published port `5432` ✅
- URL database `wendy` ↔ `POSTGRES_DB=wendy` ✅
- Query string `?schema=public` is Prisma's standard; no equivalent in `docker-compose.yml` (not needed there) ✅

No mismatch detected.

### Env-path chain trace (Constraint #7)

From `apps/api/src/config/app-config.module.ts:23-28`:

```ts
envFilePath: [
  resolve(__dirname, '..', '..', '..', '..', '.env.local'),
  resolve(__dirname, '..', '..', '..', '..', '.env'),
  resolve(__dirname, '..', '..', '..', '.env.local'),
  resolve(__dirname, '..', '..', '..', '.env'),
],
```

Resolution (at runtime, `__dirname` = `apps/api/src/config/`):

| Index | Source path | Resolves to | Order semantics |
|---|---|---|---|
| 1 | `apps/api/src/config/` → up ×4 + `.env.local` | `<monorepo-root>/.env.local` | **First hit wins** |
| 2 | `apps/api/src/config/` → up ×4 + `.env` | `<monorepo-root>/.env` | Override / fallback |
| 3 | `apps/api/src/config/` → up ×3 + `.env.local` | `<apps/api>/.env.local` | App-local override |
| 4 | `apps/api/src/config/` → up ×3 + `.env` | `<apps/api>/.env` | App-local last resort |

NestJS ConfigModule reads the array in order; the first existing file per variable wins. The monorepo-root `.env.local` is loaded first, exactly as required by constraint #7.

## File-by-file traceability

### `code/docker-compose.yml` (25 lines)

Contributes to constraints: #1, #2, #3, #4, #6 (indirectly via credentials), #9 (validated).
- L19: `image: postgres:17` → constraint #1.
- No `container_name` anywhere → constraint #2.
- No `networks:` block in source → constraint #3.
- No `volumes:` block in source → constraint #4.
- L20–L24: `POSTGRES_USER=wendy`, `POSTGRES_PASSWORD=wendy`, `POSTGRES_DB=wendy` are the values that `.env.local` must mirror → constraint #6.
- L17–L24: parses cleanly under `docker compose config` → constraint #9.

### `code/.env.local` (36 lines)

Contributes to constraints: #5, #6, #12.
- File exists at `code/.env.local` and is git-ignored → constraint #5.
- L22: `DATABASE_URL=postgresql://wendy:wendy@localhost:5432/wendy?schema=public` matches the docker-compose credentials → constraint #6.
- L31–L36: six JWT_* variables present (`JWT_PRIVATE_KEY_PEM`, `JWT_KEY_ID`, `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_ACCESS_TOKEN_TTL_SECONDS`, `JWT_REFRESH_TOKEN_TTL_SECONDS`) → constraint #12.
- L1–L11: header documents the intended workflow (docker:up → migrate → dev), reinforcing the README.

### `code/package.json` (root, scripts section L11–L24)

Contributes to constraint: #8.
- L20: `"docker:up": "docker compose up -d"` ✅
- L21: `"docker:down": "docker compose down"` ✅
- L22: `"docker:logs": "docker compose logs -f"` ✅
- All three required scripts are present. `pnpm dev` (L19) remains unchanged and unaffected.

### `code/README.md` (143 lines)

Contributes to constraint: #10.
- L41 (`pnpm docker:up`), L51 (`pnpm --filter @wendy/api prisma migrate dev`), L54 (`pnpm dev`) — the three-step workflow is explicitly listed.
- L63–L66: stop/restart section uses the same three scripts.
- L95–L97: root-script table documents all three docker:* scripts.
- L68: explicitly documents the ephemeral-data decision (ties back to constraint #4 — no volumes).
- L75–L80: documents the env-file load order, which mirrors the array in `app-config.module.ts` (ties back to constraint #7).

### `code/.gitignore` (45 lines)

Contributes to constraint: #11.
- L12: `.env.local` is on its own line, matched exactly by `git check-ignore`.

### `code/apps/api/src/config/app-config.module.ts` (43 lines)

Contributes to constraint: #7.
- L23–L28: the four-entry `envFilePath` array places `<monorepo-root>/.env.local` first, then `<monorepo-root>/.env`, then `apps/api/.env.local`, then `apps/api/.env` — deterministic, first-hit-wins, monorepo-root first.
- L13–L16: code comment documents the resolution semantics ("first hit wins", "local devs typically edit that one file").

### `code/apps/api/src/config/env.config.ts` (49 lines)

Contributes to constraint: #12 (by absence).
- Defines only `NODE_ENV`, `PORT`, `LOG_LEVEL`. No JWT fields today — consistent with constraint #12's conditional ("env.config.ts (no JWT today)"), so the template must include the team's expected JWT fields.

### `code/apps/api/src/config/database.config.ts` (40 lines)

Contributes to constraint: #6 (by validation).
- Validates `DATABASE_URL` as a `postgresql://` URL at boot. The value in `.env.local:22` passes this validator (URL parses; protocol is `postgresql`; user/password/host/port/db are all present and well-formed).

### `apps/api/.env.example`

Does **not** exist on disk (`Test-Path` → `False`). The README mentions it at L73 ("`apps/api/.env.example` (committed) — the typed-config template; copy fields into `.env.local`.") — see "Informational notes" below. This does **not** violate any of the 12 constraints (constraint #5 refers to the monorepo-root `.env.local`, not `apps/api/.env.example`).

## Gaps identified

**None of the 12 explicit constraints failed.** All items #1–#12 evaluate to PASS.

### Informational notes (not constraint failures)

These do not change the verdict but should be tracked for follow-up:

- **N1 — Dangling reference to `apps/api/.env.example`** (`README.md:73`). The README states "`apps/api/.env.example` (committed) — the typed-config template; copy fields into `.env.local`." The file does not exist on disk. Per constraint #5, the deliverable for OPS-023 is the monorepo-root `.env.local` (which **is** present and correct), so this is not a hard failure. Recommendation: either add a stub `apps/api/.env.example` in a follow-up (e.g., ARC-006 / OPS-024) so the README's reference resolves, or remove that line from the README.

- **N2 — JWT private key is a placeholder** (`.env.local:31`). The template ships with `JWT_PRIVATE_KEY_PEM="-----BEGIN RSA PRIVATE KEY-----\nREPLACE_ME\n-----END RSA PRIVATE KEY-----"`. This is intentional — the developer must generate their own RS256 key pair (`openssl genrsa -out jwt-private.pem 2048`) and paste the contents. The README (L45–L48) documents the generation steps. If the team wires ARC-013 (JWT auth) before a developer has run those `openssl` commands, the API will refuse to boot on JWT-key validation — but that is by design and the typed config class will be added in ARC-013, not OPS-023.

- **N3 — Backlog typo** (`20260810-product-backlog.md:207`). The backlog entry for OPS-023 says "Postgres 15" while the implementation (correctly per the conversation) uses Postgres 17. The backlog should be updated to "Postgres 17" to match the deliverable. Out of scope for OPS-023 itself but worth a quick backlog patch.

- **N4 — Backlog says "One command (`pnpm dev`) brings up the full stack"** (line 207). In practice, `pnpm dev` starts the API + Web; the docker stack is brought up by a separate `pnpm docker:up` (constraint #8). This is consistent with the conversation (docker is a prerequisite, not part of `pnpm dev`), so this is more a backlog description issue than an OPS-023 implementation issue. OPS-024 is the right place to refine the phrasing.

## Recommendation

**Mark OPS-023 as DONE.** Verdict: **`pass`**.

The implementation satisfies every one of the 12 explicit constraints agreed during the conversation that drove the delivery. The `docker compose config` output, the `git check-ignore` output, and the cross-file credential comparison confirm the constraints objectively.

Follow-ups (not blocking OPS-023, but worth tracking):

1. **OPS-024** — finalize the full local-dev guide (referenced in `README.md:142`); at that point, either create `apps/api/.env.example` or remove the dangling reference (N1).
2. **Backlog hygiene** — fix the "Postgres 15" → "Postgres 17" typo (N3) and clarify the `pnpm dev` vs `pnpm docker:up` relationship (N4) when OPS-024 is written.
3. **ARC-013** — when JWT auth lands, the placeholder `JWT_PRIVATE_KEY_PEM` in `.env.local` becomes a real validation requirement. Add the corresponding `apps/api/src/config/jwt.config.ts` typed config at that point; the template is already shaped for it.