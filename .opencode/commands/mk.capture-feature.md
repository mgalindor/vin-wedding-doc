---
name: mk.capture-feature
description: "Conducts a structured Q&A conversation with a product person to unpack a rough feature idea and decompose it into user stories ready to be added to the backlog"
agent: product-manager
metadata:
    type: prompt
    version: "1.0.0"
    updated-at: "2026-05-15"
---

## User Input

Prompt inputs:

- ${input:feature_idea} : (required string) A brief, informal description of the feature idea, as the product person would describe it. No format required — plain language is fine.

## Outline

Goal: Transform a raw feature idea from a product person into a set of well-formed user stories through a structured conversational interview. The output is a proposed story list, ready to be reviewed and optionally added to the product backlog.

This prompt is the entry point for new feature ideas that arrive informally — from a business stakeholder, a product meeting, or a passing conversation. It does NOT assume any existing spec or backlog item.