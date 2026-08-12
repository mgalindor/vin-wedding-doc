---
title: "ADR-05 — Authentication: JWT (access + refresh) + bcrypt + OIDC-style URLs"
id: adr-05
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 2.0.1
updated: 2026-08-11
---

# ADR-05 — Authentication: JWT (access + refresh) + bcrypt + OIDC-style URLs

> **Revision history**
> - **v2.0.1 (2026-08-11):** Fixed internal contradiction — §Token mechanics said HS256 while the Framework section and ADR-15 mandate RS256 with a public JWKS endpoint. The signing algorithm is RS256 (audit `20260811-architecture-audit.md`, finding H-1).
> - **v2.0.0 (2026-08-10):** Added standards-aligned URL paths (`.well-known/`, `/oauth/...`) to make future migration to a specialized IdP (Cognito, Auth0, Keycloak) a backend-internal change. Clarified that the Admin-assigned password is the WP's **permanent** password — not a one-time code, and the WP is **not required** to change it on first login (clarification based on user review).
> - v1.0.0 (2026-08-10): Original decision.

## Context

Wendy Planner has two roles (Administrator and Wedding Planner) plus public endpoints for guests and couples (token-based, see §8.1 and ADR-10). Requirements:

- Credentials of the form `nombre@wendy` with a password **assigned by the Administrator** (TC-9).
- The password assigned by the Admin **is the WP's permanent password** — it is not a one-time code, and the WP is not required to change it on first login.
- The WP **may change their password voluntarily** from their profile (a normal authenticated `PUT /oauth/user/password` endpoint).
- No self-service password recovery in MVP — Admin resets the password manually when needed.
- About 10 internal users; potentially hundreds of public users per wedding.
- Bilingual UI; no SSO provider.
- Future migration to multi-tenancy must not require a rewrite of the auth layer.
- **Future migration to a specialized IdP** (Cognito, Auth0, Keycloak) should be possible without changing the URLs the frontend talks to.

## Decision

**Adopt JWT-based authentication with the following concrete choices:**

### Token mechanics

- **Access token:** 15-minute lifetime, signed with **RS256** (asymmetric key pair: the private key signs and never leaves Secrets Manager; the public key is published at `/.well-known/jwks.json` — see ADR-15 §Why RS256, not HS256), contains `{ sub, role, tenantId, iat, exp, jti }`.
- **Refresh token:** 7-day lifetime, stored in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie, rotated on every use, persisted server-side with a `jti` and a `revokedAt` timestamp.
- **Password storage:** bcrypt (cost factor 12). No plain-text logs.
- **Roles encoded in the token:** `Administrator`, `WeddingPlanner`. Enforced by a NestJS `RolesGuard`.
- **Initial admin (`admin@wendy`):** seeded at deploy time with a generated random password. The seed script logs the password once to a one-time secure channel (the deployer's terminal or a Secrets Manager secret the deployer reads and immediately transfers to Vineyards' password manager). This password **is the permanent password** of the admin unless an admin changes it.
- **WP password (assigned by Admin):** the value the Admin enters is stored bcrypt-hashed. The same password works on first login and every subsequent login. There is **no forced rotation** on first login. The WP can change it voluntarily from their profile.
- **Framework:** `@nestjs/passport` + `passport-jwt` (the canonical NestJS recipe, see [ADR-15](adr-15-auth-framework-passport.md)). RS256 signing; public key served at `/.well-known/jwks.json`; private key in Secrets Manager.
- **Public token shape (for invitations and photo-album links):** signed JWT with `aud: 'invitation'` / `aud: 'photo-album'` / `aud: 'guest-photos'`, `weddingId`, and an `exp` set per ADR-10. Validated by a dedicated `PublicTokenStrategy` + `PublicTokenGuard`.

### Standards-aligned URL paths

All authentication-related endpoints follow URL paths that match the conventions used by mainstream IdPs (Auth0, Cognito, Keycloak, Okta). **We do not claim OIDC compliance** — we implement enough of the conventions to make a future swap to a managed IdP a backend-internal change.

| Endpoint | Method | Purpose | Standard origin |
|----------|--------|---------|-----------------|
| `/.well-known/wendy-configuration` | GET | Discovery metadata (our own config, not OIDC) | RFC 8615 (`.well-known`) |
| `/.well-known/jwks.json` | GET | Public signing keys (JWKS) | RFC 7517 |
| `/oauth/token` | POST | Issue access + refresh tokens from username + password | OAuth 2.0 (RFC 6749 §3.2) |
| `/oauth/refresh` | POST | Exchange a refresh token for a new access + refresh pair | Common pattern (Auth0, Cognito) |
| `/oauth/revoke` | POST | Revoke a refresh token (kills all derived access tokens via `jti`) | OAuth 2.0 (RFC 7009) |
| `/oauth/userinfo` | GET | Return the authenticated user's profile (`sub`, `role`, `tenantId`, `email`) | OIDC Core 1.0 §5.3 |
| `/oauth/user/password` | PUT | Self-service password change (authenticated) | Custom (consistent with the `/oauth/*` namespace) |
| `/oauth/logout` | POST | Revoke the current refresh token and clear the cookie | Custom (Auth0 convention) |

**Discovery document (`/.well-known/wendy-configuration`)** returns the URL map above so that any client (FE, future mobile, future third-party) can locate the endpoints dynamically. The format is inspired by OIDC's `.well-known/openid-configuration` but we do not include fields we don't support (e.g. `id_token_signing_alg_values_supported`).

**Why the `/.well-known` and `/oauth/*` conventions even though we don't implement full OAuth2/OIDC:**

- If we ever swap to Cognito, Auth0, or Keycloak, **only the NestJS auth module changes**; the FE keeps calling `/oauth/token`, `/oauth/userinfo`, etc.
- The same URL namespace is used by every major IdP, so SDKs and documentation map cleanly.
- Discovery via `/.well-known/wendy-configuration` means clients can be configured by URL, not by hard-coded paths.
- RFC 8615 (`/.well-known`) is the IETF standard for service discovery; using it costs us nothing.

### Frontend integration

- On login, the FE POSTs to `/oauth/token` with `grant_type=password` (a de-facto pattern for first-party apps; not the OIDC-recommended flow, but pragmatic for our 2-person team and a single tenant).
- The FE stores the access token in memory and the refresh token in an HttpOnly cookie (the cookie is set by the API response and not visible to JS).
- On 401, the FE POSTs to `/oauth/refresh` to obtain a new access token transparently.
- On logout, the FE POSTs to `/oauth/logout` and clears local state.

## Options Considered

### Option A — Custom URL paths (`/api/v1/auth/login`, `/api/v1/auth/refresh`)

- **Pros:** no commitment to any external convention.
- **Cons:** if we ever migrate to a managed IdP, every URL in the FE has to change. **Rejected.**

### Option B — Full OIDC compliance

- **Pros:** if we ever migrate, the FE can use any OIDC SDK unchanged.
- **Cons:** requires implementing `authorization_code` + PKCE, ID Tokens, JWE, dynamic client registration, and several other OAuth 2.1 / OIDC Core requirements. Significant scope for a 2-person team. **Out of proportion for MVP.** **Rejected.**

### Option C — OIDC-style URL paths without full compliance — **Selected**

- **Pros:** adoption cost is tiny (a few new routes, a discovery doc). Future IdP swap is contained to the backend. Aligns with how every major IdP exposes auth endpoints.
- **Cons:** we have to be careful not to claim OIDC compliance (no `openid-configuration` filename, no `id_token` field). The discovery document is honest about what we support.

## Consequences

### Positive

- **No additional managed services** (no Redis, no IdP).
- **API is fully stateless and horizontally scalable**.
- **Future migration is contained**: swapping the NestJS auth module for a Cognito/Auth0 adapter keeps the same URL paths, so the FE does not change.
- **Same JWT plumbing covers internal users and public tokens** — one code path, one library.

### Negative / Trade-offs

- We are not OIDC-compliant. A future consumer expecting OIDC behavior (e.g. requesting `scope=openid`) will get a partial implementation. Mitigated by documenting this clearly.
- We accept the cost of a small JWT signing-key rotation runbook for the MVP.

### Follow-up actions

- [ ] Implement the auth module with the URL paths above [owner:: backend] [priority:: high]
- [ ] Implement `/.well-known/wendy-configuration` returning the URL map [owner:: backend] [priority:: high]
- [ ] Implement `/.well-known/jwks.json` for public key discovery [owner:: backend] [priority:: high]
- [ ] Implement `/oauth/token`, `/oauth/refresh`, `/oauth/revoke`, `/oauth/userinfo`, `/oauth/user/password`, `/oauth/logout` [owner:: backend] [priority:: high]
- [ ] Update FE login/logout flows to use `/oauth/*` [owner:: frontend] [priority:: high]
- [ ] Document the discovery document shape and what we don't support [owner:: backend] [priority:: medium]
- [ ] Write the password rotation runbook (signed key, dual-key rotation) [owner:: backend] [priority:: medium]

### Revisit when

- Self-service password recovery becomes a requirement (consider Cognito or adding a recovery flow).
- The number of WPs grows past ~50, making manual password resets impractical.
- A managed IdP becomes cost-effective at our scale → swap the auth module for an OIDC-compliant adapter, **without changing the URL paths**.
- MFA becomes a client requirement.
