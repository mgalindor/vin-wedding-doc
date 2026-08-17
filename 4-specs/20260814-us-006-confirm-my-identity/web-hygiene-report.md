---
title: "Web Hygiene & Auth Hardening — Reference Report for US-006 + ARC-010"
date: 2026-08-17
type: technical-debt-report
scope: internal
story-id: "US-006 + ARC-010"
status: deferred
version: 0.1.0
updated: 2026-08-17
companion:
  - tech-spec.md
  - functional-spec.md
deferred-from:
  - "US-006 + ARC-010 v1.2.0 scope cut (2026-08-14) — web hygiene hardening deferred to a later story"
---


# Web Hygiene & Auth Hardening — Reference Report

- [ ] Revisar este tema de seguridad pra ver si se implementara algun dia

> **Purpose:** Capture the security and operational gaps identified during the
> implementation review of US-006 / ARC-010 so a future story can act on them
> without rediscovering the rationale.
>
> **Status:** ⚠️ **Deferred — not implemented in US-006.** Items below are
> documented, scoped, and effort-estimated. Do NOT implement ad-hoc; create a
> dedicated story or technical spec and link it here.

---

## Context

US-006 ships a `POST /oauth/token` password-grant endpoint with an RS256
JWT (access token, 1h TTL, profile as claims), an in-memory FE auth
context, and a Bearer‑injected api-client. The minimum-viable scope cut
removed `/oauth/refresh`, `/oauth/logout`, `/oauth/userinfo`, and the
`.well-known/wendy-configuration` discovery document (see
[tech-spec.md v1.1.0](tech-spec.md) §Revision History).

This report lists the **defence-in-depth** items that fall outside that
MVP cut: web hygiene (CORS, security headers, body size limits), the
token-cookie/CSRF path that becomes relevant when refresh tokens arrive,
and a few smaller operational nits. None of these are blockers for the
Vineyards pilot, but each should be owned before the platform opens to
more tenants.

---

## 1. Security Headers (Helmet)

### Current state
No global security headers. NestJS does not enable Helmet by default,
and `apps/api/src/main.ts` does not mount it. Default browser behaviour
on the current API is therefore:

| Header | Current | Risk |
|--------|---------|------|
| `X-Frame-Options` | absent | Clickjacking |
| `X-Content-Type-Options` | absent | MIME sniffing |
| `Strict-Transport-Security` | absent | HTTP downgrade |
| `Referrer-Policy` | absent | URL leakage |
| `Content-Security-Policy` | absent | XSS amplification |

### Recommendation
Mount `helmet` globally with a CSP tuned for the Wendy stack.

```typescript
// apps/api/src/main.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],   // Vite dev needs unsafe-inline
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://s3.amazonaws.com"],   // S3 photos
      connectSrc: ["'self'", "https://api.wendy-planner.com"],
      frameAncestors: ["'none'"],                              // anti-clickjacking
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,    // for S3 uploads later
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

**Effort:** 1h (deps + config + smoke test).
**Owner:** Backend. **Priority:** P1.

---

## 2. CORS — Production Tightening

### Current state
[apps/api/src/main.ts](code/apps/api/src/main.ts) (sprint-1 commit
`e3e3611`) hardcodes two dev origins.

```typescript
app.enableCors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
```

The inline comment correctly flags this must be tightened for prod.

### Recommendation
Move the origin list into `EnvConfig` and switch to a callback that
logs rejected origins at `warn` level (helps debugging misconfigured
ALB origins).

```typescript
app.enableCors({
  origin: (origin, callback) => {
    const allow = (env.CORS_ORIGINS ?? '').split(',').filter(Boolean);
    if (!origin || allow.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin not allowed: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,   // cache preflight 24h
});
```

**Rule of thumb for the FE:** never use `origin: '*'` together with
`credentials: true` — browsers reject the combination.

**Effort:** 30min. **Owner:** Backend. **Priority:** P1 (gate before
prod cutover).

---

## 3. Body Size Limits

### Current state
NestJS defaults to a 100kb JSON limit, but it is not explicitly set in
[apps/api/src/main.ts](code/apps/api/src/main.ts). This is acceptable
for `/oauth/token` but not for upcoming photo / RSVP bulk-import
endpoints (per [glossary.md](../../glossary.md)).

### Recommendation
Pin the limit explicitly and split per route when bulk endpoints land.

```typescript
// apps/api/src/main.ts
import { json, urlencoded } from 'express';

app.use(json({ limit: '100kb' }));
app.use(urlencoded({ limit: '100kb', extended: false }));

// For bulk import routes (future):
// app.use('/api/v1/imports', json({ limit: '5mb' }));
```

**Effort:** 5min. **Owner:** Backend. **Priority:** P1.

---

## 4. Refresh Tokens (deferred from US-006)

### Current state
Per the v1.2.0 scope cut, US-006 ships an access token only — no
refresh token, no revocation list. The functional spec explicitly says
"the token expires naturally" (see [functional-spec.md](functional-spec.md)
§Revision History v1.2.0). This means a leaked token is valid for up
to **1 hour** in the current implementation (TTL was tightened from
7 days during hardening, see git `82a3cf2`).

### Why it was deferred
- Adds a `/oauth/refresh` endpoint, cookie handling, sliding-window logic.
- Needs persistent storage for `refresh_tokens` (or a Redis blacklist).
- The MVP pilot tolerates a 1-hour window.

### When to revisit
- Multi-day sessions become a UX blocker for wedding planners.
- Compliance review requires revocable sessions (PII of guests).
- The platform opens to tenants with elevated risk profile.

### Design sketch (for the future story)
```sql
-- prisma migration
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  token_hash  TEXT NOT NULL,             -- sha256 of the issued token
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);
CREATE INDEX idx_refresh_user ON refresh_tokens(user_id) WHERE revoked_at IS NULL;
```

| Property | Value |
|----------|-------|
| Access token TTL | 15 min (sliding) |
| Refresh token TTL | 7 days (absolute) |
| Storage | DB, sha256-hashed |
| Sliding window | extend if used in last 24h |
| Rotation | new refresh on every use, revoke old |

**Effort:** 1 sprint. **Owner:** Backend + Web. **Priority:** P2.

---

## 5. Cookie-Based Auth + CSRF

### Current state
The access token is held in **memory** by the FE React context and
sent on every request as `Authorization: Bearer`. There is **no
cookie** in flight, so CSRF does not apply — same-origin policy
prevents a malicious site from reading or setting the `Authorization`
header.

### Why this becomes relevant
If/when refresh tokens land (item 4), they have to live somewhere
that survives page reloads and the FE process lifecycle. The two
sane options are:

1. `localStorage` — XSS‑stealable.
2. `httpOnly; Secure; SameSite=Lax` cookie — XSS‑safe, but
   automatically sent on cross-site POSTs (mitigated by `SameSite=Lax`)
   and vulnerable to classical CSRF if `SameSite=None` is required.

### Recommendation (when refresh tokens arrive)
Issue the refresh token in an httpOnly cookie and pair it with a
**double-submit CSRF token** (or `csrf-csrf` library):

```typescript
// apps/api/src/main.ts
import { doubleCsrfProtection } from 'csrf-csrf';

const { doubleCsrfProtection } = doubleCsrfProtection({
  getSecret: () => process.env.CSRF_SECRET!,
  cookieName: 'x-csrf-token',
  cookieOptions: {
    sameSite: 'lax',
    secure: true,
    httpOnly: false,    // FE must read it
  },
  size: 64,
});

app.use(doubleCsrfProtection);
```

```typescript
// auth.controller.ts — refresh endpoint
@Post('refresh')
@Public()
async refresh(@Req() req: Request, @Res() res: Response) {
  const refreshToken = req.cookies['wendy-refresh'];
  // ... validate against refresh_tokens table, rotate
  res.cookie('wendy-refresh', newToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/oauth',         // narrow scope
  });
  res.json({ access_token });
}
```

```typescript
// apps/web/src/shared/api-client/use-api-client.ts
headers['x-csrf-token'] = getCsrfTokenFromCookie();
```

### Cookie attributes reference

| Attribute | Value | Why |
|-----------|-------|-----|
| `httpOnly` | `true` | Blocks `document.cookie` access (XSS mitigation) |
| `secure` | `true` | Only over HTTPS |
| `sameSite` | `lax` | CSRF mitigation; allows top-level GET navigation |
| `path` | `/oauth` | Not sent on other paths |
| `domain` | (omitted) | Scoped to the issuing host |
| `maxAge` / `expires` | 7 days | Matches refresh TTL |

### Same-origin alternative
If the FE and API are served from the **same host** (ALB routes
`/api/*` to the NestJS app, everything else to the static SPA), the
cookie is automatically same-site and the explicit CSRF token can be
omitted. This is the simplest path for prod.

**Effort:** 1 sprint (incl. tests). **Owner:** Backend + Web.
**Priority:** P2 — bundle with item 4.

---

## 6. Rate Limiting (deferred per user instruction)

### Status
The user explicitly stated that rate limiting will be implemented
**outside the auth component, in a separate layer** (e.g. an API
gateway or a NestJS guard mounted globally). Therefore it is **not
in scope for US-006** and not documented here beyond a pointer.

When the dedicated story arrives, target the following limits:

| Endpoint | Limit | Reason |
|----------|-------|--------|
| `POST /oauth/token` | 5 / min / IP, 10 / h / user | Brute force defence |
| `GET /users/*` | 60 / min / user | Scraping defence |
| `POST /uploads/*` | 10 / min / user | Quota + abuse |

Recommended libraries: `@nestjs/throttler` (per-IP / per-user) or
AWS API Gateway usage plans (per-tenant).

---

## 7. Smaller Operational Nits

| Item | Where | Effort | Owner |
|------|-------|--------|-------|
| `window.location.href = '/login'` in 401 handler breaks the SPA | [use-api-client.ts](code/apps/web/src/shared/api-client/use-api-client.ts) | 15min | Web |
| `useProtectedRoute` is misleadingly named (only reads state, doesn't guard) | [use-protected-route.ts](code/apps/web/src/shared/auth/use-protected-route.ts) | 1h (move guard into TanStack `beforeLoad`) | Web |
| `Content-Type: application/json` hardcoded — breaks multipart | [use-api-client.ts](code/apps/web/src/shared/api-client/use-api-client.ts) | 30min | Web |
| BE error messages echoed to the user verbatim | [use-login.ts](code/apps/web/src/shared/auth/use-login.ts) | 1h (whitelist + i18n) | Web |
| `userRepository.findUserForAuth` returns `password_hash` — must never leave the auth use case | [user.repository.ts](code/apps/api/src/modules/identity/outbound-adapters/user.repository.ts) | ✅ already enforced (rename + docblock) | — |

---

## 8. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-17 | Defer helmet, CSP, CORS prod config, body limits, refresh tokens, CSRF to this report | MVP pilot tolerates them; capture rationale now |
| 2026-08-17 | Rate limiting explicitly excluded from US-006 | Will be implemented as a separate layer |
| 2026-08-17 | Access token TTL = 1h, refresh TTL = 3d (configurable) | Shorter window than original 7d; balance UX vs. leak blast radius |
| 2026-08-17 | Profile (fullName, email, role, tenantId) lives in JWT claims, not response body | Preserves OAuth 2.0 token-shape contract (RFC 6749 §5.1) |
| 2026-08-17 | `UserRepository.findUserForAuth` rename | Make auth-only intent explicit; prevent accidental use in non-auth flows |

---

## 9. Suggested Stories

When the platform graduates from MVP, create stories in this order:

1. **US-007 — Web hygiene hardening.** Helmet, CSP, CORS prod list, body
   limits. ~1 day. P1.
2. **US-008 — Rate limiting layer.** @nestjs/throttler or API gateway
   rules; per-endpoint limits table. P1.
3. **US-009 — Refresh tokens + cookie-based auth.** DB-backed refresh
   tokens, sliding window, rotation, revocation. P2.
4. **US-010 — CSRF protection.** Double-submit tokens or same-origin
   deployment. Bundle with US-009. P2.
5. **US-011 — Operational nits sweep.** FE api-client fixes, error
   i18n, protected-route guard. P3.

---

## 10. References

- [OWASP Cheat Sheet: JWT for Java](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [OWASP Cheat Sheet: Cross-Site Request Forgery Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [RFC 6749 — The OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749) §5.1 (token response)
- [RFC 6750 — The OAuth 2.0 Authorization Framework: Bearer Token Usage](https://datatracker.ietf.org/doc/html/rfc6750)
- [helmet — GitHub](https://github.com/helmetjs/helmet)
- [nestjs/throttler — GitHub](https://github.com/nestjs/throttler)
- [ADR-05 — JWT mechanics](../../3-architecture/3.3-decision-record/adr-05-auth-jwt-bcrypt.md)
- [ADR-15 — Auth framework (Passport)](../../3-architecture/3.3-decision-record/adr-15-auth-framework-passport.md)
