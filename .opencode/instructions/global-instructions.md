---
metadata:
    type: instructions
    version: "1.0.0"
    updated-at: "2026-05-15"
---

Code resources can be found in `gene2-config.yaml` file
Change cmd location before running commands to ensure the command is executed in the correct location. For example, if you are in the root folder and want to run a command in the `backend` folder, use `cd backend` before running the command.

This is a demo project for gene2, not a productive app, and it uses an in-memory database. It is used to demonstrate the capabilities of gene2 and to provide a starting point for new projects. Consider update backend and front end changes 

# Communication and Documentation Guidelines
- Communication language is Spanish.
- Documentation should be in English.
- Code functions, variables and comments should be in English.
- Project brief is placed in README.md in the root of the folder.
- VERY IMPORTANT: Warn users to not save full transcripts conversations instead of summaries. Summaries are more useful for future reference and for new team members to get up to speed quickly. Summary can contains the following information: 
  - What was discussed
  - Decisions made
  - Action items and owners
  - Next steps

# Document Reading Strategy

# Naming Conventions
- Kebab-case only  Use lowercase and hyphens for all file and folder names e.g., `my-file.md`, `my_file.txt`, folder `project-management`. 
- Use `.md`** for all documentation and text content.
- New documents must include a date prefix in `YYYYMMDD` format for versioning and tracking. e.g., `20240601-project-overview.md` when format is not specified by instructions or template. 

# Workspace Organization

- Never create a folder for a single document Place it directly in the parent folder. e.g., `README.md` not `01-project-brief/README.md`; `planning/product-backlog.md` not `planning/product-backlog/product-backlog.md`. Folders are for grouping multiple related files.

# Versioning

- Use semantic versioning for any documents that are expected to evolve over time, especially templates and skills, architecture, database documentation
- Start with version `1.0.0` for new documents and update as needed when changes are made  include in the front matter as `version: 1.0.0` and `updated` date (format: YYYY-MM-DD)

# Skills

When you load an skill read the full document 