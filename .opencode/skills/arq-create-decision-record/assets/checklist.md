# Decision Record Checklist

**Very important**: This checklist is a guide to verify that the DR is complete. It is not required to create a separate document with this checklist.

## Content

- [ ] The title is clear and describes the decision (not the problem)
- [ ] Front-matter includes workspace fields: `title`, `date`, `type: decision-record`, `scope`, `author`, `status`
- [ ] File name follows the format `YYYYMMDD-short-title.md`
- [ ] File is located in the project's decision records folder

## Sections

- [ ] **Context**: Explains the situation that motivated the decision (not just the technical problem, also organizational or business context)
- [ ] **Decision**: Written in 2–4 sentences, clear and direct
- [ ] **Considered Options**: Includes at least 2 alternatives (ideally 3)
- [ ] **Considered Options**: Table compares relevant criteria with ✅ ❌ ⚠️
- [ ] **Justification**: Explains why the chosen option was selected and when to consider the other options
- [ ] **Consequences**: Includes positive consequences AND trade-offs / negatives
- [ ] **Advice**: Records who gave input, when, and what they said (can be empty if no advice was sought)

## Quality

- [ ] DR covers a single decision (not multiple)
- [ ] Existing information from a previous DR was not edited (created a new one if changes occurred)
- [ ] If superseding a previous DR, the `status` field is `Superseded` and there is a reference to the previous DR
- [ ] Related DRs are linked in Consequences or in the Status header
