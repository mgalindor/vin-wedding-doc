# Project Brief Creation Checklist

**Very Important**: This checklist is a guide to verify the implementation is completed. It is not required to create an output document with this list of items.

---

## Source

- [ ] All files in `01-kickoff/` have been read
- [ ] No project-specific data was invented — all content comes from kickoff docs or user input
- [ ] The current `README.md` was read before making any edits

## Front Matter

- [ ] `client` field is filled in
- [ ] `project` field is filled in
- [ ] `summary` field is a clear one-line description
- [ ] `type: project-brief` is present
- [ ] `date` field is set to today's date (YYYY-MM-DD)
- [ ] `scope: client` is present

## Sections

- [ ] **Project Overview** — at least 2 paragraphs describing context and goals
- [ ] **Project Challenges → Current Situation** — at least 2 bullet points
- [ ] **Project Challenges → Critical Risk** — at least one risk described
- [ ] **Kickoff Docs** — table lists the actual files from `01-kickoff/`
- [ ] **Proposal / Project Objectives** — at least 1 objective with explanation
- [ ] **Deliverables → Outputs** — at least 2 tangible outputs
- [ ] **Deliverables → Outcomes** — at least 2 business outcomes
- [ ] **Out of Scope** — explicit list of exclusions
- [ ] **Stakeholders** — table has at least 1 row with real data
- [ ] **Team Members** — table has at least 1 row with real data
- [ ] **Timeline** — duration, sprint size, and start date filled in
- [ ] **Gantt chart** — reflects actual team members and timeline
- [ ] **Assumptions** — at least 2 assumptions listed

## Quality

- [ ] No placeholder text (`{{...}}` or `{...}`) remains in README.md
- [ ] All markdown tables are properly formatted
- [ ] Mermaid Gantt chart is syntactically valid
- [ ] Language is consistent throughout (Spanish or English, not mixed)
- [ ] Section headers match the template exactly
- [ ] Verify there is no redundancy in the information Eg. same outcome than output. Or not have same text in the proposal (paragraph) section and in goals (as list)