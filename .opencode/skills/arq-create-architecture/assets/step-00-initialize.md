# Step 0: Initialize Architecture Document

## Goal

Create the architecture file and establish the working mode for the entire process.

## Actions

1. **Create the architecture file** in the architecture folder of the workspace using the project naming conventions (date prefix, lowercase, hyphens). The file must contain ONLY:
   - YAML front matter with: `title`, `date`, `type: architecture`, `scope`, `version: 1.0.0`, `updated`
   - The document title: `# Architecture Document`
   - No sections or content yet

2. **Ask the user for the work style**:
   - **interactive**: Collaborative step-by-step process with human review at each stage
   - **yolo**: One-shot generation — infer everything and produce a complete proposal without stopping

3. **Update the front matter** with:
   - `work-style: interactive` or `work-style: yolo`
   - `progress` list with the initialize step marked as `done`

## Expected Output

A file with this structure:

```yaml
---
title: "Architecture Document"
date: YYYY-MM-DD
type: architecture
scope: internal
version: 1.0.0
updated: YYYY-MM-DD
work-style: interactive
progress:
  - step: initialize
    status: done
---

# Architecture Document
```

## Notes

- Do not add any template sections yet — they will be added step by step
- The `scope` value should be confirmed with the user (e.g., internal, client, public)
- If no scope is given, default to `internal`
