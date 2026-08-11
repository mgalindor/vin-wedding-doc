<!-- ============================================================
  TEMPLATE: Bug Specification
  ============================================================
  HOW TO USE THIS TEMPLATE:
  1. Replace all {placeholder} values with actual content
  2. Remove all <!-- comment --> blocks before finalizing
  3. Fill in every required section — optional sections only if applicable

  REQUIRED FIELDS:
  - title, found-behavior, expected-behavior, steps-to-reproduce, environment

  PLACEHOLDER FORMAT : {kebab-case-name}
  COMMENT FORMAT     : <!-- comment -->

  SECTIONS OVERVIEW:
  - Front matter         : Document metadata (title, date, severity, status)
  - Title                : Short, specific description of the failure
  - Found Behavior       : What the system actually does (observable facts)
  - Expected Behavior    : What the system should do (anchored in a spec/rule)
  - Steps to Reproduce   : Ordered steps to replicate the failure
  - Environment          : Where and under what conditions the bug appears
  - Evidence             : Screenshots, videos, or logs (optional but recommended)
  - Severity             : Impact on user/business
  - Additional Context   : Frequency, workarounds, linked stories (optional)
  ============================================================ -->
---
title: "Bug: {short-title}"
date: {YYYY-MM-DD}
type: specification
scope: internal
status: open         # open | in-progress | resolved | closed | wont-fix
severity: {critical|high|medium|low}
story-id: "{story-id}"   # Leave empty if not linked to a story
version: 1.0.0
reported-by: {reporter-name-or-role}
---

# Bug: {short-title}

- **Status: Open** 
- **Severity: {Critical / High / Medium / Low}**
- **Linked story / specification:** `{story-id}` — {short title}
- **Environment: {dev, staging, production}** 

<!-- ============================================================
  FOUND BEHAVIOR
  Purpose : Describe what the system actually does — observable facts only
  Tone    : Neutral, factual. No opinions or interpretations.
  Example : "When the coordinator clicks 'Save', the form clears all fields
             and the browser console shows a 500 error. No confirmation message appears."
  ============================================================ -->
## Found Behavior

{What does the system actually do? Describe the observable symptom — what the user sees, what happens in the UI, what error appears. Stick to facts.}

<!-- ============================================================
  EXPECTED BEHAVIOR
  Purpose : Define what the system should do — anchored in a spec, rule, or criterion
  Format  : Reference the functional specification or acceptance criterion if available
  Example : "According to Rule 3 in the donation registration spec: 'A donation must be
             persisted and a confirmation message must be displayed after successful save.'"
  ============================================================ -->
## Expected Behavior

{What should the system do instead? Reference the rule, acceptance criterion, or user story that defines the correct behavior. If no specification exists, describe what the user reasonably expects.}

> ⚠️ *Expected behavior referenced from: {specification / user story / acceptance criterion — or "inferred, no specification found"}*

---

<!-- ============================================================
  STEPS TO REPRODUCE
  Purpose : Allow any team member to replicate the failure without asking questions
  Format  : Numbered list, starting from the initial state
  Rules   : Be specific — include URL, data used, button name, exact action taken
  Example :
    1. Log in as a coordinator (test user: coordinator@test.com)
    2. Navigate to Donations > Register new donation
    3. Fill in all required fields with valid data
    4. Click the "Save" button
    5. Observe: all fields clear and no confirmation message appears
  ============================================================ -->
## Steps to Reproduce

1. {Start from initial state — e.g., "Log in as {role}"}
2. {Navigate to the affected area}
3. {Perform the action that triggers the bug}
4. {Observe: describe exactly what happens}

<!-- ============================================================
  ENVIRONMENT
  Purpose : Specify where and under what conditions the bug was found
  Fields  : App version, browser + version, OS, device, test data used
  ============================================================ -->
## Environment

| Field | Value |
|---|---|
| App version | {version number or build identifier} |
| Browser | {browser name and version — e.g., Chrome 123} |
| Operating System | {OS name and version} |
| Device | {Desktop / Mobile — model if relevant} |
| Test data used | {Describe the data context without exposing sensitive values} |
| URL / Endpoint | {URL or route where the bug occurs} |

---

<!-- ============================================================
  EVIDENCE
  Optional — but highly recommended
  Purpose : Attach or reference proof that the bug exists
  Types   : Screenshot, screen recording, log output, network response
  ============================================================ -->
## Evidence

<!-- Remove this section if no evidence is available — but always try to include at least one screenshot -->

- {Screenshot: [description](./path-to-screenshot.png)}
- {Log output or error message:}

```
{Paste relevant log lines or error output here}
```
---

<!-- ============================================================
  ADDITIONAL CONTEXT
  Optional section
  ============================================================ -->
## Additional Context

<!-- Remove this section if not applicable -->

**Frequency:** {Always reproducible / Intermittent / Happened once}

**Workaround:** {Is there a temporary way to achieve the goal? Describe it briefly, or write "None identified."}

**Notes:** {Any other context relevant to understanding or fixing the bug — related changes, recent deployments, patterns observed}

---

*Bug reported on {YYYY-MM-DD}. Pending triage and assignment.*
