---
name: qa-create-bug-specification
description: "Creates a bug report specification. Trigger: When user asks to create, write, report, document, or register a bug — or wants to describe unexpected behavior, a defect, a regression, or a system failure — or uses terms like reportar bug, bug report, defect report, specification de bug, hay un error en, esto no funciona como esperado, encontré un problema"
user-invocable: false
metadata:
    type: skill
    version: "1.0.0"
    updated-at: "2026-05-15"
---

# What is a Bug

A bug is a **deviation between observed behavior and expected behavior** in a system. It describes what the system does versus what it should do, in a specific context that can be reproduced.

A bug report is NOT:
- A feature request or enhancement
- A question about how something works
- A vague complaint without reproducible steps

A bug IS:
- A concrete, observable failure with clear reproduction steps
- Anchored in a specific environment and context
- Validated against what the system **should** do according to a specification, user story, or acceptance criterion

---

# Minimum Required Information

Every bug report must include these five elements. Without them, the report cannot be triaged or resolved:

| # | Field | Why it matters |
|---|---|---|
| 2 | **Found behavior** | What the system actually does — the observable symptom. |
| 3 | **Expected behavior** | What the system should do — anchored in the spec, story, or agreed rule. |
| 4 | **Steps to reproduce** | Ordered steps that allow any team member to replicate the failure. |
| 5 | **Environment** | Where the bug was found: app version, browser/OS, test data used. |

**Optional but highly valuable:**
- Evidence (screenshot, video, log output)
- Severity assessment (impact on user or business)
- Frequency (always, intermittent, once)
- Linked specification or user story

> **Rule**: A bug without steps to reproduce is not actionable. The report must enable the developer to see the same failure, not just read about it.

---

# Severity Levels

Use severity to communicate the impact on the user and the system — not urgency (that is priority, decided by the team):

| Severity | Definition | Example |
|---|---|---|
| **Critical** | System is unusable or data is corrupted. Blocks core functionality with no workaround. | Login fails for all users |
| **High** | Core functionality is broken. A workaround exists but it is unacceptable for production. | Donations cannot be saved |
| **Medium** | Non-core functionality is broken or behavior is incorrect. A reasonable workaround exists. | Report totals are incorrect |
| **Low** | Minor issue, cosmetic defect, or edge case with negligible impact. | Label truncated on mobile |

---

# 

## Identify the Bug

Receive the defect description from the user. Determine:
- What is the observable symptom?
- In what context was it found?
- Is there a linked user story or acceptance criterion this violates?

If the information is incomplete, ask only for the **minimum required fields** before proceeding.

## Anchor the Expected Behavior

Find the specification that defines what the system should do:
- Search for the linked user story in the backlog
- Look for the functional specification or acceptance criteria in `05-iteration/54-specifications/`
- If no specification exists, note it as `⚠️ Expected behavior inferred — no specification found`

The expected behavior must reference the rule or criterion it violates — not be invented by the reporter.

## Build the Bug Report

Use the template to structure the bug report. Apply these guidelines:

- **Title**: Use the format `[Component/Area] Short description of the failure` — never "It doesn't work"
- **Found behavior**: Describe what happens, not what the user feels about it. Observable facts only.
- **Expected behavior**: Quote or reference the rule from the specification. If no spec exists, state what the user reasonably expects based on the context.
- **Steps to reproduce**: Number them. Start from the initial state. Be specific enough that any team member can follow without asking questions.
- **Environment**: Include app version, browser + version, OS, and any test data used (without exposing actual sensitive data).
- **Evidence**: Attach or reference screenshots, screen recordings, or relevant log lines.


# Document

- **Template**: See [assets/template.md](assets/template.md)
