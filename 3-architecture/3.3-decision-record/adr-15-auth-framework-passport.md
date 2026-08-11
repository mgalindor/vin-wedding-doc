---
title: "ADR-15 — Authentication framework: @nestjs/passport + passport-jwt"
id: adr-15
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 1.0.0
updated: 2026-08-10
---

# ADR-15 — Authentication framework: @nestjs/passport + passport-jwt

## Context

Wendy Planner's authentication layer (ADR-05) is JWT-based with OIDC-style URL paths. We need to decide **which framework** wires the JWT validation into NestJS controllers:

- **Custom NestJS guard** that parses the `Authorization` header, verifies the signature, and populates `req.user` by hand.
- **`@nestjs/passport` + `passport-jwt`**, the canonical NestJS recipe.

Factors that drive this decision:

- **Future IdP portability** (Cognito, Auth0, Keycloak) — the goal stated in ADR-05 is that swapping to a managed IdP should be a backend-internal change.
- **Team familiarity** — the standard NestJS auth recipe is what every NestJS developer recognizes.
- **Cost of adding more strategies** — login with Google for couples, SAML for enterprise customers, etc., are common roadmap items.
- **Bundle size** — we are cost-conscious but willing to pay for real value.
- **Convention over configuration** — the team is 2 people; less bespoke code is better.

## Decision

**Adopt `@nestjs/passport` + `passport-jwt` as the authentication framework. Use the canonical NestJS recipe.**

**Concrete components:**

| Component | Purpose | Lives in |
|-----------|---------|----------|
| `passport` | The underlying auth framework | `apps/api/package.json` |
| `@nestjs/passport` | NestJS adapter for Passport strategies | `apps/api/package.json` |
| `passport-jwt` | The JWT validation strategy | `apps/api/package.json` |
| `JwtStrategy` | Our concrete strategy: extract the JWT from the `Authorization: Bearer …` header, verify the signature with the public key from `/.well-known/jwks.json`, return the validated payload | `apps/api/src/modules/identity/strategies/jwt.strategy.ts` |
| `JwtAuthGuard` | Thin wrapper around `AuthGuard('jwt')` so we can extend it (e.g. add tenant context, log failures) | `apps/api/src/modules/identity/guards/jwt-auth.guard.ts` |
| `LocalAuthService` | Plain service (not a Passport strategy) that does `bcrypt.compare` for `/oauth/token` | `apps/api/src/modules/identity/local-auth.service.ts` |

**The canonical pattern (from the NestJS recipe):**

```ts
// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_PUBLIC_KEY'),
      algorithms: ['RS256'],
      audience: 'wendy',
      issuer: 'wendy-planner',
    });
  }

  // Whatever this returns is set on req.user
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    return { id: payload.sub, role: payload.role, tenantId: payload.tenantId };
  }
}
```

```ts
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

```ts
// protected.controller.ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('WeddingPlanner')
@Get('me')
me(@CurrentUser() user: AuthenticatedUser) { … }
```

**Why RS256, not HS256** (sub-decision tied to the framework choice):

- RS256 uses an asymmetric key pair (private key signs, public key verifies). The private key never leaves the issuing service.
- HS256 uses a shared secret — both signer and verifier need the same secret. With a public JWKS endpoint, **any service can verify our tokens without sharing secrets**.
- The public key is exposed at `/.well-known/jwks.json` (already in ADR-05); a future IdP swap is a one-line change to `JwtStrategy`.
- The private key is stored in **AWS Secrets Manager**; the API task definition injects it on startup.

**What about `passport-local` for `/oauth/token`?** We considered it and **rejected**:

- `passport-local` is designed for session-based flows (sets `req.user` on a session cookie).
- Our `/oauth/token` returns a JSON body with access + refresh tokens. There is no session.
- Using `passport-local` here adds an abstraction layer that hides the JWT issuance flow.
- A plain `LocalAuthService` that calls `bcrypt.compare` and returns the user is ~20 lines and is easier to read and test.

**What about public tokens (invitations, photo-album)?** These use Passport's `JwtStrategy` too, but with a different `aud` claim and a different secret. Two clean options:

- **Option A (chosen):** add a second strategy `PublicTokenStrategy` that validates the public JWT shape (with `aud: 'invitation' | 'photo-album' | 'guest-photos'`) and is used via `@UseGuards(PublicTokenGuard)`.
- **Option B:** validate the public JWTs directly in the controller using `JwtService.verify()` — skip Passport for these.

We pick **Option A** for consistency. Public token endpoints use `@UseGuards(PublicTokenGuard)`. The guard verifies the token shape and the `aud` claim matches the route.

**Frontend impact:** none. The FE keeps calling the OIDC-style URL paths. The framework choice is purely server-side.

## Options Considered

### Option A — `@nestjs/passport` + `passport-jwt` — **Selected**

- **Pros**
  - **Canonical NestJS pattern** — every NestJS developer recognizes `@UseGuards(AuthGuard('jwt'))`.
  - **Less boilerplate** — `JwtStrategy` is ~20 lines vs ~50 lines for a custom guard.
  - **Future-proof for more strategies** — adding OAuth (Google for couples), SAML, etc. is one more strategy class.
  - **Future IdP portability** — swap `JwtStrategy` for the IdP's strategy without changing controllers.
  - **Community knowledge** — `passport-jwt` has 2M+ weekly downloads; bugs are found and fixed quickly.
- **Cons**
  - Adds ~25 KB to the API bundle (`passport` + `@nestjs/passport` + `passport-jwt`).
  - Abstraction layer: the request flow goes through `passport` middleware before reaching controllers. Debugging is one step removed.

### Option B — `@nestjs/jwt` + custom guard (no Passport)

- **Pros**
  - Smallest dependency footprint (~5 KB).
  - Direct control: we know exactly what happens on every request.
  - No abstraction to learn.
- **Cons**
  - **More code to maintain** — `JwtAuthGuard`, `RolesGuard`, `@CurrentUser()` decorator, all by hand.
  - **Non-standard** — anyone joining the project has to learn our custom auth layer.
  - **Harder to swap to a managed IdP** — we'd re-implement everything.
- **Verdict:** fine for a 1-week project. Not fine for a 3-month MVP that plans to evolve.

### Option C — NestJS Guards only, with `@nestjs/jwt` for parsing

- **Pros:** even simpler than B; no `@nestjs/passport` at all.
- **Cons:** same as B (custom code to maintain).

## Consequences

### Positive

- **Standard pattern** — any NestJS developer can jump into the auth code in 5 minutes.
- **Trivial future IdP swap** — change `JwtStrategy` to call Cognito/Auth0; the rest of the code is untouched.
- **Easy to add more strategies** later (Google login for couples, etc.).
- **Built-in JWKS support** — `passport-jwt` works with the `/.well-known/jwks.json` endpoint out of the box.

### Negative / Trade-offs

- ~25 KB added to the API bundle. Negligible.
- One more layer of indirection when debugging auth failures. Acceptable.

### Follow-up actions

- [ ] Install `passport`, `@nestjs/passport`, `passport-jwt` in `apps/api/` [owner:: backend] [priority:: high]
- [ ] Generate an RS256 key pair and store the private key in AWS Secrets Manager, the public key as a Secret too (returned by `/.well-known/jwks.json`) [owner:: backend] [priority:: high]
- [ ] Implement `JwtStrategy` and `JwtAuthGuard` per the canonical NestJS recipe [owner:: backend] [priority:: high]
- [ ] Implement `PublicTokenStrategy` and `PublicTokenGuard` for invitation/photo-album tokens [owner:: backend] [priority:: high]
- [ ] Replace any inline JWT parsing in the auth module with the new guards [owner:: backend] [priority:: high]
- [ ] Add tests for: valid token, expired token, wrong audience, wrong issuer, missing token [owner:: backend] [priority:: high]
- [ ] Document the key rotation runbook (RS256 simplifies this — generate a new key pair, serve both old and new public keys from JWKS for a grace period, then retire the old key) [owner:: backend] [priority:: medium]

### Revisit when

- A managed IdP (Cognito, Auth0, Keycloak) becomes cost-effective → swap the `JwtStrategy` for the IdP's adapter.
- MFA becomes a client requirement → add a second strategy (e.g. `TotpStrategy`).
- Social login is added → drop in `passport-google-oauth20` or similar as another strategy.
- Bundle size of the API becomes a real concern → unlikely, ~25 KB is fine.
