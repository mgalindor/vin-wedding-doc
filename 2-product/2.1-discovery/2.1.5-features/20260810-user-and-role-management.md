---
title: "Feature: User and Role Management"
date: 2026-08-10
type: analysis
scope: client
---

# Feature: User and Role Management

## Overview

| Field | Value |
| :---- | :---- |
| Feature ID | `FEAT-005` |
| Status | `draft` |
| Owner | Product Owner (TBD — Vineyards) |
| Date | 2026-08-10 |

> **Original request:** "Roles: Administrador (da de alta nuevos WPs, ve proyectos y métricas; puede ser WP; ve/edita proyectos de los WPs que él haya dado de alta; puede deshabilitar usuarios y cambiar contraseñas). Wedding Planner: gestiona sus bodas. Credenciales: formato `nombre@wendy`; contraseña asignada por el administrador; sin auto-recuperación. Datos de perfil: nombre completo, email de contacto, teléfono de contacto." (kickoff, 2026-08-10)

> **Summary**
> Mechanism that controls who can access the platform and what they can do, supporting two roles — Administrator (onboards and supervises Wedding Planners) and Wedding Planner (manages their own weddings) — with credentials following the `nombre@wendy` convention and passwords assigned by the Administrator.

## Problem & Trigger

- **Problem:** Vineyards is a multi-WP organization with administrative oversight. Without role-based access there is no separation between operational users (WPs) and supervisory users (Administrators), and onboarding / offboarding becomes manual and error-prone.
- **Trigger:** Onboarding a new WP, offboarding a departing WP, or supervising WP activity.
- **Current workaround:** Likely managed in spreadsheets or shared documents; specific process not documented in kickoff.

## Affected Users

| Role | Description | Impact |
| :--- | :---------- | :----- |
| Administrator | Onboards WPs and supervises their activity. | Gains a single tool to create, disable, and reset accounts. |
| Wedding Planner | Operates weddings. | Gets credentials in a predictable format; profile data is captured once and visible. |
| Auditor / Compliance | Reviews who did what. | Indirect impact: the audit events recorded by the platform are the source of truth for compliance reviews. |

## Desired Outcome

- The Administrator can create, disable, and reset WP accounts from a single screen.
- A disabled account cannot log in.
- A WP can only see and manage their own weddings, never another WP's.
- An Administrator acting as WP can manage their own weddings while retaining admin powers.

## Business Rules & Constraints

| Rule | Description |
| :--- | :---------- |
| BR-01 | Two roles exist: Administrator and Wedding Planner. An Administrator may also act as a Wedding Planner. |
| BR-02 | A Wedding Planner can only view and edit weddings they own. |
| BR-03 | An Administrator can view and edit weddings belonging to WPs they have onboarded. |
| BR-04 | Credentials follow the format `nombre@wendy`. |
| BR-05 | Passwords are assigned by the Administrator at account creation time; there is no self-service recovery in MVP. |
| BR-06 | Profile data per user: full name, contact email, contact phone. |
| BR-07 | The Administrator can disable user accounts and change user passwords. |

## Variations & Configuration

| Dimension | Variation |
| :-------- | :-------- |
| Role | Administrator vs Wedding Planner — different permissions as defined in BR-01 to BR-03. |

## Scope

### In Scope

- Two roles: **Administrator** and **Wedding Planner**.
- An Administrator can:
  - Create new Wedding Planner accounts.
  - Disable user accounts.
  - Change user passwords.
  - View and edit all weddings belonging to the WPs they have onboarded.
  - Act as a Wedding Planner themselves.
- A Wedding Planner can:
  - Manage their own weddings and the data attached to them (guests, invitation, photos).
  - View and edit their own profile (full name, contact email, contact phone).
- Login with credentials of the form `nombre@wendy`.
- Administrator assigns the initial password at account creation time.
- Profile data per user: full name, contact email, contact phone.

### Out of Scope

- Self-service password recovery (forgotten / reset password flow).
- Email or SMS notifications (e.g. "your account was created", "your password was reset").
- Multi-factor authentication.
- Audit log UI (the audit events themselves are required by compliance — see Open Questions).
- Fine-grained permissions beyond the two roles.

## Proposed User Stories

> [!NOTE]
> User story decomposition is deferred until Vineyards validates this feature definition. Once approved, stories will be derived following the standard process (one need per story, grouped by actor, ordered by dependency).

## Decisions

| # | Decision | Rationale | Date |
| :- | :------- | :-------- | :--- |
| _None recorded yet_ | | | |

## Open Questions

- [X] Naming of the Product Owner / primary Administrator on the client side. `admin@wendy`
- [X] Whether an Administrator can delete (vs. only disable) a WP account. Yes
- [X] Whether a password change by an Administrator forces an immediate re-login. No
- [X] Minimum audit log events required at MVP: user creation, user disable, password change, photo download, automatic photo deletion (kickoff preconditions). Keep it simple, it could be enough simple user and timestamp creation and last update.
