---
name: pm-user-story
description: "Defines what a user story is, its format, core philosophy, and quality criteria. General knowledge skill — produces no artifacts Trigger: When user asks how to write or create a user story, asks what a user story is, wants to understand user story best practices, needs to create or improve a user story, or asks how to express a user need"
user-invocable: false
metadata:
    type: skill
    version: "1.0.0"
    updated-at: "2026-05-15"
---

# What is a User Story

A user story is a **one-line expression of a user need**. It names who needs something, what they need, and why it matters — nothing more. It is not a specification, not a task, and not a feature description.

The story exists to communicate a need so the team can have a conversation. The solution comes from that conversation — not from the story itself.

## What a User Story is NOT

In many methodologies, the term "user story" is used for a document that includes acceptance criteria, business rules, scenarios, edge cases, and detailed descriptions. **That is not a user story — that is a functional specification.**

The distinction is deliberate and important:

- **User story** — one line capturing a user need. Written at backlog time.
- **Specification** — the detailed description of how that story will be built: rules, scenarios, acceptance criteria, edge cases. Written at iteration time, just before the story is developed.

The story stays short so the full backlog is readable at a glance. The specification is written only when the team is about to build it — no earlier, because requirements change and detailed upfront spec is often wasted.

# Format 
**very important**: write stories in single line

```
{Short title — verb + object} - As a [role], I need [action] so that [benefit]
```

## Sections:
- **Short title** — a verb + object phrase, 3–6 words. This is what the team says in conversation: "Did we finish *record received donation*?" Scannable in a list.
- **As a [role]** — the functional role who has the need. Never a person's name.
- **I need [action]** — the real need, not a solution or a feature. If you can replace it with "I want", the story likely describes a preference or an implementation, not a need.
- **so that [benefit]** — why the need matters. If you cannot answer this, the need may be a solution in disguise.



### Examples

```
Control role-based access - As a solution owner, I need to define what each role can see and do so that operations stay secure and each person only accesses what corresponds to their responsibility

Revoke user access - As a solution owner, I need to remove access from a person so that former or inactive members no longer reach protected functionality

Access reports in a portable format - As an administrator, I need to get report data outside the system so that I can analyze it, share it, or include it in external reports

Record what was received in a donation - As a center coordinator, I need to document what arrived and in what quantity so that inventory stays accurate and traceable

Know when a significant donation arrives - As a center coordinator, I need to learn about large donations promptly so that I can make timely decisions even when I am away from the center
```

# Core Philosophy: Need vs. Want

The formula uses **"I need"** deliberately — not "I want" or "I would like."

- Bad: **"I want a login screen"** conditions the team to build a login screen. 
- Good: **"I need to control who accesses the system"** opens the solution space: SSO, OAuth, role-based permissions, a company identity provider, or a custom credential system — all valid. The architect decides, not the story.

A **need** is something the user cannot succeed without. A **want** is a preference or a proposed solution. Stories must only express needs.

This distinction has direct impact in the design and architecture phases. When stories express needs, architects and developers can evaluate solutions aligned to company constraints. When stories express solutions, the team builds what was written — even if something better exists.

# The Drill-Down Method

Before writing a story, ask: **"Why does this user need to do this? What fails if they can't?"** Keep asking until you reach the root need.

**Example — Login**

Journey action: _"Log in with credentials"_
→ Why? To access the system
→ Why? To use functionality according to their role
→ Root need: The solution owner needs to control who accesses what — and be able to revoke that access
→ Stories:
  - "Control role-based access"
  - "Revoke user access"
  - "Assign a role to a user"

Note: The person who logs in is not the one with the need. It is the *solution owner* who needs access to be controlled. This is a key shift: the story belongs to whoever is harmed if the need is not met.

**Example — Export to Excel**

Journey action: _"Export the report to Excel"_
→ Why? To share or analyze data outside the system
→ Root need: The administrator needs report data in a portable format
→ Story: "Access reports in a portable format" — no Excel, no button, no format constraint
→ The solution (Excel, PDF, API, copy-paste) is decided during design or iteration planning

**Example — Fill in the registration form**

Journey action: _"Fill in the donation registration form"_
→ Why? To record what arrived
→ Root need: The coordinator needs to document a donation accurately so inventory stays traceable
→ Story: "Record what was received in a donation" — no form, no fields, no screen

# Quality Checks

Every story must pass these checks. If a story fails any check, rewrite it until it passes.

**1. The subject is always the user — never the system.**
The story expresses a user need, not a technical task. If the subject is the system, reframe it.
- BAD: "The system notifies the coordinator" → WHO needs to know WHAT and WHY?
- GOOD: "Know when a significant donation arrives - As a center coordinator, I need to learn about large donations promptly so that I can make timely decisions even when I am away from the center"

**2. Express the real need, not the solution.**
Ask: "Why does this user need this? What fails if they can't do it?" If the answer reveals a deeper need, write THAT instead.
- BAD: "Log in to the system" → Login is a mechanism. Who needs what, and why?
- GOOD: "Control who can access each function - As a solution owner, I need to ensure each role only sees and does what corresponds to their responsibilities so that operations stay secure"
- BAD: "Export to Excel" → Excel is a proposed format, not a need.
- GOOD: "Access report data in a portable format - As an administrator, I need to get report data outside the system so that I can analyze it or include it in external reports"

**3. No implementation vocabulary.**
These words signal a solution, not a need. If you catch yourself writing them, stop and reframe:
- "system", "screen", "button", "form", "database", "API", "login", "credentials", "click", "dropdown", "modal", "dashboard", "Excel", "PDF", "WhatsApp", "notification", "automatically"
- Instead of "see a screen with...", write what information the user needs and why.
- Instead of "the system automatically...", write what outcome the user needs without describing the mechanism.

**4. One story per real need, not per UI interaction.**
If three journey rows describe "open list → find item → click item", that is one need: "Find a specific {thing} quickly." Do not write three stories.

**5. Identify who really has the need — it may not be the person performing the action.**
Ask: "Who is harmed if this need is not met?" The stakeholder behind the need may be different from the user performing the action.
- BAD: "Log in - As a coordinator, I need to enter my credentials so that I can access the system" → The coordinator does not need to log in. The SOLUTION OWNER needs access controlled.
- GOOD: "Control role-based access - As a solution owner, I need to restrict each person to the functions that match their role so that operations stay secure"
- BAD: "Notify coordinator about assignment" → The coordinator receives the notification, but who needs communication to happen? The one delegating.
- GOOD: "Confirm responsibility delegation - As a general coordinator, I need the person I assign a center to know they are now responsible so that there is no ambiguity about ownership"

**6. Use roles, never personal names.**
Stories describe needs of functional roles, not specific people. Names belong to personas in discovery documents.
- BAD: "As María..." or "As Carmen..." or "As Luis..."
- GOOD: "As a general coordinator..." or "As a center coordinator..." or "As a field volunteer..."
- If source documents use names, map them to their functional role. If two people share a role, the story is written once — not duplicated per person.

**7. One story, one action — atomicity.**
A story must express a single, indivisible need. If the `I need` clause contains more than one verb connected by "and", "or", or a comma, it is not atomic — split it.
Each action usually has a different trigger, a different context, and may be developed and tested independently. Bundling them hides complexity and makes the story harder to estimate, test, and accept.
- BAD: "As a solution owner, I need to add and deactivate user accounts so that only active team members can access the platform" → two distinct actions: creating access and removing it. Different triggers, different rules, different scenarios.
- GOOD: "Add a user to the platform - As a solution owner, I need to create an account for a new team member so that they can access the functionality assigned to their role"
- GOOD: "Deactivate a user account - As a solution owner, I need to revoke access from a person who is no longer part of the team so that former members cannot reach protected functionality"
- To check atomicity: read the `I need` clause aloud. If you can split the sentence at "and" or "or" and each half makes a complete, independent need — split the story.

**8. No frontend, backend, QA, architecture stories. Only user needs.**
A user story has no layer. It does not belong to the frontend, backend, mobile app, or any technical component. If a story mentions a layer, a technology, or a system component — it is not a user story, it is a technical task in disguise.
The same user need may eventually result in frontend work, backend work, and infrastructure work. That decomposition happens during development, not in the backlog.
- BAD: "As a user, I need a REST API endpoint for donations so that the mobile app can submit them" → This is backend work, not a user need.
- BAD: "As a user, I need a mobile screen to register a donation so that I can enter the data" → This is a UI task, not a user need.
- GOOD: "Record what was received in a donation - As a center coordinator, I need to document what arrived and in what quantity so that inventory stays accurate" → Technology-agnostic. Could be mobile, web, paper-based — the story doesn't decide.

**9. Not everything is a user story — and forcing it makes things worse.**
User stories express human needs. Not every task on a project comes from a human need. When you identify work that is architectural, infrastructural, or technical in nature — do not force it into the `As a... I need... so that` format. That format will distort the intent and confuse the team.
Express those tasks directly and explicitly for what they are:
- BAD: "As a developer, I need a code repository so that the team can collaborate on the codebase" → The developer is not the stakeholder — this is setup work. The story format adds nothing.
- GOOD (as a plain task): "Create code repository"
- BAD: "As a system, I need a CI/CD pipeline so that deployments are automated" → The system is not a user. This is an infrastructure task.
- GOOD (as a plain task): "Set up CI/CD pipeline"
- BAD: "As an architect, I need to define the database schema so that data can be stored" → Architecture work is not a user story.
- GOOD (as a plain task): "Define initial database schema"

If someone asks you to write user stories for architecture, DevOps, or infrastructure work — warn them. Explain that the `As a... I need... so that` format is reserved for human needs, and that expressing technical tasks as user stories obscures what the work actually is, makes estimation harder, and confuses developers about what they are building and why. Strong suggest writing those items as explicit technical tasks instead.
