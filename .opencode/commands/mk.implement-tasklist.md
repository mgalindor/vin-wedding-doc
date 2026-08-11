---
name: mk.implement-tasklist
description: Implement the task list from its approved specifications.
agent: developer
subtask: true
metadata:
    type: prompt
    version: "1.0.0"
    updated-at: "2026-05-15"
---

Implement the task list for story

Required inputs (do not proceed if any of these are missing):
${input:storyId:Story ID from the backlog (e.g., US-006)} 
${input:tier:Tier where the task list applies (e.g., backend, frontend, fullstack)}


Locate the story specification folder using the provided ID. Verify the following documents exist at least proceeding:
- (optional) Functional specification (`functional-spec.md`)
- (required) Technical specification (`tech-spec.md`)
- (optional) Bug specification (`bug-spec.md`) if there are any bugs related to the story
- (required) Task list(s) 

If any of these required documents are missing, stop and inform the user which ones are needed before implementation can begin.

Very important: Before start to work find and read **All** the blueprint associated with the specified tier or task list to become an expert on the technology listed there

Very Important: Develop each task one by one and when its done, mark as done and move to the next one. Do not read or implement multiple tasks at the same time. Follow the order of the task list as defined in the specifications.

Task list are separated by sections like layers. When you start a new section identify what is this section about and find skills related to the frameworks, layer or technology of that section to guide the implementation. For example, if the section is about hibernate or repositories and the technology is java, "find skills related to java and hibernate string data". 

> **Note:** This prompt is part of the story delivery workflow. Load the skills related to delivering a user story and software development to guide the implementation process.
