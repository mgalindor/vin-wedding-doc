---
name: mk.implement-code
description: Implement the code for a story derived from its approved technical specification.
agent: developer
subtask: true
metadata:
    type: prompt
    version: "2.0.0"
    updated-at: "2026-08-12"
---

Implement the code for a story

Required inputs (do not proceed if any of these are missing):
${input:storyId:Story ID from the backlog (e.g., US-006)} 
${input:tier:Tier to implement (e.g., backend, frontend, fullstack)}


Locate the story specification folder using the provided ID. Verify the following documents exist before proceeding:
- (optional) Functional specification (`functional-spec.md`)
- (required) Technical specification (`tech-spec.md`)
- (optional) Bug specification (`bug-spec.md`) if there are any bugs related to the story

If any required documents are missing, stop and inform the user before implementation can begin.

Derive the ordered list of implementation tasks from the technical specification. Do not expect a separate task list file.

Very important: Before starting, find and read **all** blueprints associated with the specified tier to become an expert on the technology listed there.

Very important: Implement each task one by one. When a task is done, note it as completed and move to the next one. Do not read or implement multiple tasks at the same time. Follow the implementation order defined in the technical specification.

When starting a new section or layer, identify what it is about and find skills related to the frameworks, layer or technology of that section to guide the implementation.

> **Note:** This prompt is part of the story delivery workflow. Load the skills related to delivering a user story and software development to guide the implementation process.
