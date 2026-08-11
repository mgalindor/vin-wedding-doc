---
name: mk.implement-story
description: Start or resume the implementation of a user story 
agent: architect
metadata:
    type: prompt
    version: "1.0.0"
    updated-at: "2026-05-15"
---

Deliver the story: ${input:story:ID , shortname , description of a brand new user story}

Find user story in backlog if does not exist add it in the backlog at the end and then start the delivery process. 

Locate the story specification folder. Check if story.yaml exists — if it does, read it and resume from the next pending step. If it does not, initialize story.yaml and start the delivery process from the beginning.

Search skills related to delivering user stories and software development. Use them as needed to complete the steps of the delivery process, updating story.yaml accordingly at each step.

Skip human approval until the step approve-task-list
Stop before to review the task lists
Do not use subagents
