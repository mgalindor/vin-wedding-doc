---
title: "ADR-10 — Public invitation URL strategy: path-based /i/:token"
id: adr-10
type: decision-record
status: accepted
date: 2026-08-10
scope: client
project: wendy-planner
version: 1.0.0
updated: 2026-08-10
---

# ADR-10 — Public invitation URL strategy: path-based /i/:token

## Context

Wendy Planner's public invitation pages must be:

- Accessible to invited guests via a unique, shareable URL.
- Distributed **manually** by the WP in MVP (no email automation, no SMS).
- Fast-loading, SEO-friendly, and friendly to social previews.
- Secure (token-based, scoped, expiring).
- Easy for the WP to copy and paste into WhatsApp, SMS, or any other channel.

## Options Considered

### Option A — Subdomain per wedding (e.g. `maria-jose-2026.wendy.app`)

- **Pros**
  - Cleanest URL; very shareable.
- **Cons**
  - Requires wildcard DNS + wildcard TLS certificate.
  - Risk of subdomain takeover if not managed carefully.
  - Hard to share analytics across weddings.

### Option B — Custom domain per WP (e.g. `events.vineyards.com`)

- **Pros**
  - Brand consistency.
  - WP owns the domain.
- **Cons**
  - Requires DNS delegation to Vineyards.
  - Out of scope for MVP (kickoff says no custom domains for invitations).

### Option C — Path-based: `wendy.app/i/:token` — **Selected**

- **Pros**
  - **Simplest deployment** — one domain, one CloudFront distribution, one ALB rule.
  - **Token-based** — the path carries a signed token; no need to encode the wedding ID in the URL.
  - **Easy to share** — the WP copies the URL from the dashboard.
  - **Easy to rotate** — invalidating a token is a DB change, not a DNS change.
  - **SEO-safe** — we set `noindex, nofollow` on the public invitation pages; only the RSVP form is interactive.
- **Cons**
  - Longer URLs (acceptable).
  - No brand separation per wedding (acceptable for MVP).

### Option D — Query parameters (`?wedding=...&guest=...`)

- **Pros**
  - No route changes.
- **Cons**
  - Easy to tamper with.
  - Less idiomatic; harder to share visually.
  - Mixing tokens into query strings makes them show up in server logs more often.

## Decision

**Adopt path-based URLs for all public invitation endpoints.**

**Concretely:**

- Public invitation page: `https://wendy.app/i/{token}` where `{token}` is a signed JWT (see ADR-05) with `aud: 'invitation'`, `weddingId`, `guestId`, and `exp: event_date + 30d`.
- Public photo album (couple): `https://wendy.app/c/{token}` with `aud: 'photo-album'`, `weddingId`, `exp: event_date + 7d` (configurable).
- Public guest photo upload: `https://wendy.app/g/{token}` with `aud: 'guest-photos'`, `weddingId`, `guestId`, `exp: event_date`.

**Token claims (decoded by the API):**

```json
{
  "aud": "invitation",
  "weddingId": "uuid",
  "guestId": "uuid",
  "iat": 1730000000,
  "exp": 1732500000
}
```

**Headers on public pages:**

- `X-Robots-Tag: noindex, nofollow` to prevent indexing of personal data.
- `Cache-Control: private, no-store` to prevent shared caching of personalized content.

**URL preview:**

- The dashboard shows a "Copy link" button with the full URL ready to share.
- The URL is short enough to fit in a WhatsApp message preview (~80 chars including the host).

## Consequences

### Positive

- One domain, one CDN, one ALB.
- Tokens are tamper-proof, scoped, and self-expiring.
- Adding a custom domain per WP later is a reverse-proxy change, not a backend change.

### Negative / Trade-offs

- We accept longer URLs in exchange for simplicity.
- The WP must copy and paste the URL manually (out of scope for MVP per the kickoff).

### Follow-up actions

- [ ] Implement the public invitation controller with the token validation logic [owner:: backend] [priority:: high]
- [ ] Implement the "Copy link" UX in the dashboard [owner:: frontend] [priority:: high]
- [ ] Add `noindex, nofollow` and `Cache-Control` headers in the public pages [owner:: frontend] [priority:: high]
- [ ] Document the token claim shape in the API reference [owner:: backend] [priority:: medium]

### Revisit when

- A custom domain per WP becomes a client requirement.
- A branded short URL (e.g. `wendy.app/maria-jose`) is requested.
- A/B testing of invitation templates needs stable, shareable variants.
