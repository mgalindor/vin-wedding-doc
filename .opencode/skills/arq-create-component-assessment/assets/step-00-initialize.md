# Step 0: Initialize Assessment Document

## Goal

Create the assessment file and establish the working mode for the analysis process.

## Actions

1. **Confirm the component path**: Verify the component path exists and contains source code. List the top-level directory to confirm it is a valid code component.

2. **Derive the component name**: Use the folder name of the component path (or the `name` field from `gene2-config.yaml` if available) to determine the component identifier. Use lowercase with hyphens.

3. **Create the assessment file** in the archaeology folder of the workspace using the project naming conventions (date prefix, lowercase, hyphens). Example: `{component-name}-assessment.md`. The file must contain ONLY:
   - YAML front matter with: `title`, `date`, `type: reference`, `scope: internal`, `version: 1.0.0`, `updated`, `component-path`
   - The document title: `# Component Assessment — {Component Name}`
   - No sections or content yet

4. **Ask the user for the work style**:
   - **interactive**: Collaborative step-by-step process with human review at each stage
   - **yolo**: Automated generation — explore and document without stopping

5. **Update the front matter** with:
   - `working-style: interactive` or `working-style: yolo`
   - `progress` list with the initialize step marked as `done`

## Expected Output

A file with this structure:

```yaml
---
title: "Component Assessment — {Component Name}"
date: YYYY-MM-DD
type: reference
scope: internal
version: 1.0.0
updated: YYYY-MM-DD
component-path: {relative path to the component root}
working-style: yolo
progress:
  - step: initialize
    status: done
---

# Component Assessment — {Component Name}
```

## Notes

- Do not add any template sections yet — they will be added step by step
- The component path in front matter should be relative to the workspace root
- If the component path is invalid or contains no code, stop the process and inform the user
