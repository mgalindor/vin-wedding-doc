---
name: mk.report-bug
description: Report a bug in the system, including steps to reproduce, expected behavior, and actual behavior.
agent: product-manager
subtask: true
metadata:
    type: prompt
    version: "1.0.0"
    updated-at: "2026-05-15"
---

You are tasked to register a bug

Inputs

- Actual Behavior: Required ${input:actual:Describe what is currently happening in the system that is considered a bug}
- Expected Behavior: Required ${input:expected:Describe what should be happening in the system if the bug were not present.}
- Steps to Reproduce: Required ${input:steps:Provide a clear and concise list of steps that can be followed to reproduce the bug.}
- Environment: Optional ${input:environment:Specify the environment in which the bug occurs (e.g., development, staging, production).}

**Very Important**: Ensure required inputs are provided and clearly describe the bug. If any input is missing or unclear, ask the user for clarification before proceeding. Help user asking for the information needed to complete the bug report asking indirect questions like "What was the behavior you observed?", "Why do you consider this behavior is working wrong?" , "What did you expect to happen when you performed this action?" or "Can you describe the steps you took before encountering the issue?" to gather the necessary details for a comprehensive bug report.

Search skills related to bugs reporting , deliver user stories and software development. 

## Steps to Report the Bug

1. Gather all required information from the user about the bug, including actual behavior, expected behavior, steps to reproduce, and environment.
2. Validate that the information provided is complete and clear. If not, ask follow-up questions to fill in any gaps.
3. Create a new bug report in the project backlog, use format `{id} {short description} - { behavior reported } [link-to:: id of feature]`
4. Create a bug specification in the specification folder with the name `bug-spec.md`

`