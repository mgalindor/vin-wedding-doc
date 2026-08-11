---
title: {{title}}
date: {{YYYY-MM-DD}}
type: decision-record
scope: {{internal | client | public}}
author: {{email of the author}}
status: {{Draft | Proposed | Taken | Superseded | Retired}}
---

# {{title}}

## Status: **{{Draft | Proposed | Taken | Superseded | Retired}}**

> If `Superseded`, add: *Superseded by [Title](link)*  
> If this DR supersedes a previous one, add: *Supersedes [Title](link)*

## Context

{{Describe the situation, problem, or opportunity that makes this decision necessary. Include:
- The organizational or project circumstance that triggered this decision
- Business priorities or constraints that shaped the options
- Team skills, social dynamics, or external dependencies that are relevant
- Any technical debt, risks, or forces at play
- Pros and cons relevant to the situation, framed around your actual needs}}

## Decision

{{State the decision taken in 2–4 clear sentences. What was chosen? What is now in effect or proposed?}}

## Considered Options

| Feature / Criteria | Option A: {{name}} | Option B: {{name}} | Option C: {{name}} |
|---|---|---|---|
| {{criterion 1}} | ✅ {{description}} | ❌ {{description}} | ⚠️ {{description}} |
| {{criterion 2}} | ⚠️ {{description}} | ✅ {{description}} | ❌ {{description}} |
| {{criterion 3}} | ❌ {{description}} | ⚠️ {{description}} | ✅ {{description}} |
| {{criterion 4}} | ✅ {{description}} | ✅ {{description}} | ❌ {{description}} |
| {{criterion 5}} | ❌ {{description}} | ✅ {{description}} | ⚠️ {{description}} |

> Use ✅ for the best or most favorable result for a criterion, ❌ for the worst, and ⚠️ for neutral or partial.

### Justification

{{Explain why the chosen option was selected. Address:
- Why it best fits the current context and constraints
- What concerns or limitations of the other options disqualified them
- When it would make sense to revisit or switch to another option}}

**When to consider Option B ({{name}}):**  
{{Describe the conditions under which this alternative would be preferable}}

**When to consider Option C ({{name}}):**  
{{Describe the conditions under which this alternative would be preferable}}

## Consequences

### Positive
- {{Positive outcome or benefit resulting from this decision}}
- {{...}}

### Negative / Trade-offs
- {{Known downside, cost, or risk accepted with this decision}}
- {{...}}

### Follow-up decisions
- {{List any subsequent decisions this one triggers, with links to related DRs if they exist}}

## Advice

{{Record all input gathered before or after the decision was taken, following the Advice Process.
Include: name of the advice-giver, date, and their input or concerns.}}

| Date | Advisor | Advice / Comment |
|---|---|---|
| {{YYYY-MM-DD}} | {{Name or role}} | {{Summary of their input, concern, or endorsement}} |
| {{YYYY-MM-DD}} | {{Name or role}} | {{...}} |
